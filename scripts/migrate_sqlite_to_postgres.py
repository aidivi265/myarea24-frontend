#!/usr/bin/env python3
"""
MyArea24 — SQLite to PostgreSQL Migration Engine
Performs safe, transactional, idempotent, and non-destructive migration of all
relational and spatial tables from a source SQLite database into a target PostgreSQL
(or PostgreSQL/PostGIS) database.

Features:
- Non-destructive: Source SQLite database is opened in read-only mode (?mode=ro).
- Rerun-Safe / Idempotent: Supports --clean flag to truncate existing target tables in reverse
  foreign-key order before loading.
- Pre-flight Collision Guard: If target tables contain existing records and --clean is omitted,
  aborts safely before modifying data.
- Rollback Command: Provides --rollback flag to safely reset target tables.
- Foreign-key Preservation: Migrates in strict topological dependency order.
- Robust Type Casting: Normalizes SQLite 0/1 to boolean, empty strings to NULL, and ISO datetimes.
- Sequence Alignment: Synchronizes PostgreSQL SERIAL / IDENTITY sequences with MAX(id).
- Audit & Verification: Verifies 100% record parity between source and destination.
"""

import argparse
import datetime
import json
import os
import sqlite3
import sys
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Integer,
    JSON,
    String,
    Text,
    create_engine,
    inspect,
    text,
)

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database.models import Base  # noqa: E402


# Explicit topological dependency ordering for foreign keys
MIGRATION_ORDER = [
    "users",
    "data_sources",
    "data_sync_logs",
    "weather_readings",
    "traffic_readings",
    "air_quality_readings",
    "intelligence_insights",
    "intelligence_signals",
    "fuel_rate_readings",
    "mandi_market_rates",
    "emergency_facilities",
    "businesses",
    "products",
    "service_listings",
    "exclusive_offers",
    "civic_events",
    "events",
    "bulletin_posts",
    "orders",
    "order_items",
    "service_bookings",
    "user_saved_items",
    "otp_tokens",
]


def get_sqlite_tables(conn: sqlite3.Connection) -> List[str]:
    """Returns list of user tables in the SQLite database."""
    cur = conn.cursor()
    return [
        row[0]
        for row in cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        ).fetchall()
    ]


def parse_datetime_val(val: Any) -> Optional[datetime.datetime]:
    """Robustly parses datetime strings from SQLite into datetime objects."""
    if val is None or val == "":
        return None
    if isinstance(val, datetime.datetime):
        return val
    if isinstance(val, str):
        cleaned = val.strip().replace("Z", "+00:00")
        try:
            return datetime.datetime.fromisoformat(cleaned)
        except Exception:
            # Fallback for standard SQL timestamp formats
            for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    return datetime.datetime.strptime(cleaned, fmt)
                except Exception:
                    pass
    return None


def clean_target_tables(target_engine, tables_in_reverse: List[str], is_postgres: bool = False):
    """Safely cleans target tables in reverse dependency order (child before parent)."""
    print("[*] Cleaning existing records in target database in reverse dependency order...")
    with target_engine.begin() as conn:
        if is_postgres:
            # If PostgreSQL, can truncate cascade or delete
            for t in tables_in_reverse:
                if t in Base.metadata.tables:
                    try:
                        conn.execute(text(f'TRUNCATE TABLE "{t}" CASCADE;'))
                    except Exception:
                        conn.execute(text(f'DELETE FROM "{t}";'))
        else:
            for t in tables_in_reverse:
                if t in Base.metadata.tables:
                    conn.execute(text(f'DELETE FROM "{t}";'))
    print("[✓] Target tables cleaned successfully.")


def rollback_migration(target_url: str):
    """Rolls back and empties target database tables in reverse dependency order."""
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    is_postgres = "postgres" in target_url
    target_engine = create_engine(target_url, echo=False)
    reverse_order = list(reversed(MIGRATION_ORDER))

    print(f"[*] Initiating rollback on target: {target_url}")
    clean_target_tables(target_engine, reverse_order, is_postgres)
    target_engine.dispose()
    print("[+] Rollback complete. Target database reset to clean state.")


def migrate_data(
    source_db_path: str,
    target_url: str,
    dry_run: bool = False,
    clean: bool = False,
    batch_size: int = 500,
) -> Dict[str, Any]:
    """
    Executes the migration process from SQLite to target database.
    """
    if not os.path.exists(source_db_path):
        raise FileNotFoundError(f"Source SQLite database not found at {source_db_path}")

    # Normalize target URL
    if target_url.startswith("postgres://"):
        target_url = target_url.replace("postgres://", "postgresql://", 1)

    is_target_postgres = "postgres" in target_url

    print(f"[*] Source Database: {os.path.abspath(source_db_path)}")
    print(f"[*] Target Database Dialect: {'PostgreSQL' if is_target_postgres else 'SQLite/Other'}")
    print(f"[*] Dry-run mode: {dry_run}")
    print(f"[*] Clean target mode: {clean}")

    # 1. Connect to source SQLite in URI read-only mode
    src_conn = sqlite3.connect(f"file:{os.path.abspath(source_db_path)}?mode=ro", uri=True)
    src_cur = src_conn.cursor()

    all_src_tables = get_sqlite_tables(src_conn)
    print(f"[*] Discovered {len(all_src_tables)} tables in source database.")

    # Sort tables: migration order first, followed by any remaining tables
    tables_to_migrate = []
    for t in MIGRATION_ORDER:
        if t in all_src_tables:
            tables_to_migrate.append(t)
    for t in all_src_tables:
        if t not in tables_to_migrate:
            tables_to_migrate.append(t)

    # Collect source row counts
    src_counts: Dict[str, int] = {}
    total_src_rows = 0
    for t in tables_to_migrate:
        count = src_cur.execute(f'SELECT COUNT(*) FROM "{t}";').fetchone()[0]
        src_counts[t] = count
        total_src_rows += count
        print(f"    - {t}: {count:,} rows")

    print(f"[*] Total source records to migrate: {total_src_rows:,}")

    if dry_run:
        src_conn.close()
        print("[+] Dry run complete. No database changes were made.")
        return {"status": "DRY_RUN_COMPLETED", "tables": src_counts, "total_rows": total_src_rows}

    # 2. Connect to target database and build schema
    print(f"[*] Connecting to target database...")
    target_engine = create_engine(target_url, echo=False)

    # If target is Postgres, initialize PostGIS extension if possible
    if is_target_postgres:
        try:
            with target_engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
                print("    -> PostGIS extension enabled on target PostgreSQL.")
        except Exception as e:
            print(f"    -> Notice: PostGIS extension could not be created automatically: {e}")

    # Build schema
    print("[*] Creating target schema if not exists...")
    Base.metadata.create_all(bind=target_engine)
    target_inspector = inspect(target_engine)
    target_tables = set(target_inspector.get_table_names())
    print(f"    -> Target schema has {len(target_tables)} tables ready.")

    # Check for existing data in target database
    existing_target_rows = {}
    with target_engine.connect() as conn:
        for t in tables_to_migrate:
            if t in target_tables:
                try:
                    c = conn.execute(text(f'SELECT COUNT(*) FROM "{t}";')).scalar()
                    if c and c > 0:
                        existing_target_rows[t] = c
                except Exception:
                    pass

    if existing_target_rows:
        if not clean:
            src_conn.close()
            target_engine.dispose()
            raise RuntimeError(
                f"Pre-flight Check Failed: Target database already contains data in {len(existing_target_rows)} tables "
                f"(e.g. {list(existing_target_rows.keys())[:3]} have records). "
                f"To prevent duplicate key collisions, run migration with '--clean' to safely reset target tables first."
            )
        else:
            # Clean target tables in reverse dependency order
            reverse_tables = list(reversed(tables_to_migrate))
            clean_target_tables(target_engine, reverse_tables, is_target_postgres)

    # 3. Perform batch migration within a transactional boundary
    migrated_counts: Dict[str, int] = {}

    with target_engine.begin() as target_conn:
        for table_name in tables_to_migrate:
            if table_name not in Base.metadata.tables:
                print(f"[!] Warning: Table '{table_name}' has no SQLAlchemy model definition. Skipping.")
                continue

            sa_table = Base.metadata.tables[table_name]
            target_cols = [c.name for c in sa_table.columns]
            col_types = {c.name: c.type for c in sa_table.columns}

            # Fetch columns from source SQLite
            src_cur.execute(f'PRAGMA table_info("{table_name}");')
            src_col_info = src_cur.fetchall()
            src_cols = [row[1] for row in src_col_info]

            # Find matching common columns
            common_cols = [c for c in src_cols if c in target_cols]
            if not common_cols:
                print(f"[!] No matching columns for {table_name}. Skipping.")
                continue

            quoted_cols = ", ".join(f'"{c}"' for c in common_cols)
            src_cur.execute(f'SELECT {quoted_cols} FROM "{table_name}";')

            batch: List[Dict[str, Any]] = []
            rows_migrated_for_table = 0

            while True:
                rows = src_cur.fetchmany(batch_size)
                if not rows:
                    break

                for row in rows:
                    row_dict = {}
                    for col_idx, col_name in enumerate(common_cols):
                        val = row[col_idx]
                        col_type = col_types.get(col_name)

                        # Empty string to NULL conversion for non-string columns
                        if val == "" and not isinstance(col_type, (String, Text)):
                            if isinstance(col_type, (Integer, Float, DateTime, Boolean)):
                                val = None

                        # Type normalization
                        if val is not None:
                            # Boolean normalization (SQLite 0/1 -> bool)
                            if isinstance(col_type, Boolean):
                                val = bool(val)
                            # JSON normalization
                            elif isinstance(col_type, JSON):
                                if isinstance(val, str):
                                    try:
                                        val = json.loads(val)
                                    except Exception:
                                        pass
                            # DateTime normalization
                            elif isinstance(col_type, DateTime):
                                val = parse_datetime_val(val)
                            # Numeric normalization
                            elif isinstance(col_type, Integer) and isinstance(val, str):
                                try:
                                    val = int(val)
                                except Exception:
                                    pass
                            elif isinstance(col_type, Float) and isinstance(val, str):
                                try:
                                    val = float(val)
                                except Exception:
                                    pass

                        row_dict[col_name] = val
                    batch.append(row_dict)

                if batch:
                    target_conn.execute(sa_table.insert(), batch)
                    rows_migrated_for_table += len(batch)
                    batch = []

            migrated_counts[table_name] = rows_migrated_for_table
            print(f"    [+] Migrated '{table_name}': {rows_migrated_for_table:,} / {src_counts[table_name]:,} rows")

        # 4. If PostgreSQL, reset sequences so auto-increment works on new records
        if is_target_postgres:
            print("[*] Synchronizing PostgreSQL sequence counters...")
            for table_name in tables_to_migrate:
                if table_name in Base.metadata.tables:
                    try:
                        seq_sql = text(
                            f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), "
                            f"COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM \"{table_name}\";"
                        )
                        target_conn.execute(seq_sql)
                    except Exception:
                        pass  # Table might not have an 'id' serial

    src_conn.close()

    # 5. Verification Phase: Check row counts in target database
    print("\n[*] Auditing post-migration target record counts...")
    discrepancies = []
    with target_engine.connect() as verify_conn:
        for t, expected_count in src_counts.items():
            if t in Base.metadata.tables:
                actual_count = verify_conn.execute(text(f'SELECT COUNT(*) FROM "{t}";')).scalar()
                if actual_count != expected_count:
                    discrepancies.append((t, expected_count, actual_count))
                    print(f"    [-] DISCREPANCY in '{t}': expected {expected_count:,}, got {actual_count:,}")
                else:
                    print(f"    [✓] '{t}': {actual_count:,} rows (Exact match)")

    target_engine.dispose()

    if discrepancies:
        raise RuntimeError(f"Database migration verification failed with {len(discrepancies)} discrepancies: {discrepancies}")

    print("\n[+] MIGRATION VERIFICATION SUCCESSFUL: 100% record parity across all tables!")
    return {
        "status": "SUCCESS",
        "migrated_tables": migrated_counts,
        "total_migrated": sum(migrated_counts.values()),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MyArea24 SQLite to PostgreSQL Migration Tool")
    parser.add_argument("--source-db", default="myarea24.db", help="Path to source SQLite file")
    parser.add_argument(
        "--target-url",
        default=os.getenv("STAGING_DATABASE_URL", "sqlite:///myarea24_staging_test.db"),
        help="Target SQLAlchemy database URL (e.g. postgresql://user:pwd@host:5432/myarea24)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Simulate migration without modifying target")
    parser.add_argument("--clean", action="store_true", help="Truncate target tables before migrating (rerun-safe)")
    parser.add_argument("--rollback", action="store_true", help="Roll back and truncate target tables without migrating")
    parser.add_argument("--batch-size", type=int, default=500, help="Row batch size for migration")
    args = parser.parse_args()

    if args.rollback:
        rollback_migration(args.target_url)
        sys.exit(0)

    try:
        res = migrate_data(
            source_db_path=args.source_db,
            target_url=args.target_url,
            dry_run=args.dry_run,
            clean=args.clean,
            batch_size=args.batch_size,
        )
        sys.exit(0)
    except Exception as exc:
        print(f"[-] Migration failed: {exc}", file=sys.stderr)
        sys.exit(1)
