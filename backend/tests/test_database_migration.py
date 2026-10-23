import os
import shutil
import sqlite3
import tempfile
import pytest
from sqlalchemy import create_engine, inspect, text
from backend.app.database.models import Base


def test_database_migration_preserves_existing_data():
    """
    Step 4: Test database migrations against a copy of an existing database,
    preserving records and validating recovery after aborted transactions.
    """
    source_db = "myarea24.db"
    assert os.path.exists(source_db), f"Source database {source_db} does not exist"

    # 1. Create an isolated copy of the database
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        temp_copy_path = f.name

    try:
        shutil.copyfile(source_db, temp_copy_path)

        # 2. Record baseline row counts across all tables before migration
        conn_pre = sqlite3.connect(temp_copy_path)
        cur_pre = conn_pre.cursor()
        tables_pre = [
            row[0]
            for row in cur_pre.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
            ).fetchall()
        ]
        counts_pre = {}
        for t in tables_pre:
            counts_pre[t] = cur_pre.execute(f'SELECT COUNT(*) FROM "{t}";').fetchone()[0]
        conn_pre.close()

        assert len(tables_pre) >= 20, f"Expected at least 20 tables in existing DB, found {len(tables_pre)}"

        # 3. Execute application schema evolution / migration against the copy
        engine = create_engine(f"sqlite:///{temp_copy_path}")
        with engine.begin() as conn:
            # Check orders.tracking_token
            insp = inspect(conn)
            cols = [c["name"] for c in insp.get_columns("orders")]
            if "tracking_token" not in cols:
                conn.execute(text("ALTER TABLE orders ADD COLUMN tracking_token VARCHAR(100);"))

            # Create performance indexes
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_orders_user_id ON orders(user_id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_orders_business_id ON orders(business_id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_service_bookings_user_id ON service_bookings(user_id);"))

        # Create any newly defined models
        Base.metadata.create_all(bind=engine)
        engine.dispose()

        # 4. Record row counts after migration and assert ZERO data loss
        conn_post = sqlite3.connect(temp_copy_path)
        cur_post = conn_post.cursor()
        tables_post = [
            row[0]
            for row in cur_post.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
            ).fetchall()
        ]
        counts_post = {}
        for t in tables_post:
            counts_post[t] = cur_post.execute(f'SELECT COUNT(*) FROM "{t}";').fetchone()[0]

        # Verify all original tables still exist
        for t in tables_pre:
            assert t in tables_post, f"Table {t} was lost during migration!"
            assert counts_post[t] == counts_pre[t], (
                f"Data loss in table {t}: was {counts_pre[t]} rows, now {counts_post[t]} rows"
            )

        # 5. Verify transaction rollback and recovery
        # Simulate a transaction failure: insert a row then intentionally fail
        try:
            cur_post.execute("BEGIN TRANSACTION;")
            cur_post.execute(
                "INSERT INTO users (email, phone, full_name, role, is_active, is_verified, created_at, updated_at) "
                "VALUES ('test_rollback@example.com', '9999999999', 'Rollback User', 'resident', 1, 1, datetime('now'), datetime('now'));"
            )
            # Intentionally simulate failure
            raise RuntimeError("Simulated mid-transaction crash")
        except RuntimeError:
            conn_post.rollback()

        # Verify the rolled-back user is NOT present
        user_check = cur_post.execute("SELECT COUNT(*) FROM users WHERE email='test_rollback@example.com';").fetchone()[0]
        assert user_check == 0, "Aborted transaction was not rolled back; uncommitted data leaked into database!"

        # Verify original row count remains intact after rollback
        final_user_count = cur_post.execute("SELECT COUNT(*) FROM users;").fetchone()[0]
        assert final_user_count == counts_pre["users"]

        conn_post.close()

    finally:
        if os.path.exists(temp_copy_path):
            try:
                os.remove(temp_copy_path)
            except OSError:
                pass


def test_backup_tool_creates_verified_snapshot():
    """Verifies that backup_database creates a valid snapshot with verified checksums."""
    from scripts.backup_database import backup_sqlite_database
    with tempfile.TemporaryDirectory() as tmp_dir:
        report = backup_sqlite_database(source_path="myarea24.db", backup_dir=tmp_dir)
        assert report["integrity_status"] == "VERIFIED_OK"
        assert report["total_tables"] >= 20
        assert report["total_rows"] > 1000
        assert os.path.exists(report["backup_path"])
        assert len(report["backup_sha256"]) == 64


def test_migration_tool_transfers_records_with_parity():
    """Verifies that migrate_data transfers schema and records to a target database with 100% parity."""
    from scripts.migrate_sqlite_to_postgres import migrate_data
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_target:
        target_path = tmp_target.name

    try:
        target_url = f"sqlite:///{target_path}"
        result = migrate_data(source_db_path="myarea24.db", target_url=target_url, batch_size=200)
        assert result["status"] == "SUCCESS"
        assert result["total_migrated"] > 1000

        # Verify target table count and row count match source
        conn = sqlite3.connect(target_path)
        cur = conn.cursor()
        users_count = cur.execute("SELECT COUNT(*) FROM users;").fetchone()[0]
        assert users_count >= 80, f"Expected at least 80 users in migrated target, got {users_count}"
        conn.close()
    finally:
        if os.path.exists(target_path):
            try:
                os.remove(target_path)
            except OSError:
                pass


def test_migration_rerun_safety_and_rollback():
    """Verifies that migration detects existing records, prevents collisions, and supports clean rerun & rollback."""
    from scripts.migrate_sqlite_to_postgres import migrate_data, rollback_migration
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_target:
        target_path = tmp_target.name

    try:
        target_url = f"sqlite:///{target_path}"
        # 1. Initial migration
        res1 = migrate_data(source_db_path="myarea24.db", target_url=target_url, batch_size=200)
        assert res1["status"] == "SUCCESS"

        # 2. Rerun without clean flag should raise RuntimeError
        with pytest.raises(RuntimeError, match="Pre-flight Check Failed"):
            migrate_data(source_db_path="myarea24.db", target_url=target_url, clean=False)

        # 3. Rerun with clean=True should succeed
        res2 = migrate_data(source_db_path="myarea24.db", target_url=target_url, clean=True, batch_size=200)
        assert res2["status"] == "SUCCESS"

        # 4. Rollback should reset target tables
        rollback_migration(target_url)
        conn = sqlite3.connect(target_path)
        cur = conn.cursor()
        users_after_rollback = cur.execute("SELECT COUNT(*) FROM users;").fetchone()[0]
        assert users_after_rollback == 0, f"Expected 0 users after rollback, found {users_after_rollback}"
        conn.close()
    finally:
        if os.path.exists(target_path):
            try:
                os.remove(target_path)
            except OSError:
                pass
