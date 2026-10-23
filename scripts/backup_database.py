#!/usr/bin/env python3
"""
MyArea24 — Database Backup & Integrity Verification Tool
Performs a point-in-time, non-destructive snapshot of the active SQLite database
using the SQLite Online Backup API, verifies database integrity via PRAGMA integrity_check,
computes cryptographic SHA-256 checksums, and produces an audited table-by-table manifest.
"""

import argparse
import datetime
import hashlib
import json
import os
import sqlite3
import sys
from typing import Any, Dict


def compute_sha256(filepath: str) -> str:
    """Computes the SHA-256 cryptographic hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def get_database_manifest(conn: sqlite3.Connection) -> Dict[str, Any]:
    """Inspects SQLite database and returns table names, row counts, and column counts."""
    cur = conn.cursor()
    tables = [
        row[0]
        for row in cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        ).fetchall()
    ]

    manifest = {"tables": {}, "total_rows": 0, "total_tables": len(tables)}

    for table in tables:
        try:
            count = cur.execute(f'SELECT COUNT(*) FROM "{table}";').fetchone()[0]
            col_info = cur.execute(f'PRAGMA table_info("{table}");').fetchall()
            cols = [c[1] for c in col_info]
            manifest["tables"][table] = {
                "row_count": count,
                "columns_count": len(cols),
                "columns": cols,
            }
            manifest["total_rows"] += count
        except Exception as e:
            manifest["tables"][table] = {"error": str(e), "row_count": 0}

    return manifest


def backup_sqlite_database(
    source_path: str = "myarea24.db",
    backup_dir: str = "backups",
) -> Dict[str, Any]:
    """
    Performs an online, non-blocking backup of the SQLite database.
    Verifies integrity before and after backup.
    """
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source database file not found: {source_path}")

    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"myarea24_backup_{timestamp}.db"
    backup_path = os.path.join(backup_dir, backup_filename)
    manifest_filename = f"manifest_{timestamp}.json"
    manifest_path = os.path.join(backup_dir, manifest_filename)

    print(f"[*] Connecting to source database: {source_path}")
    source_conn = sqlite3.connect(source_path)

    # 1. Verify source integrity
    print("[*] Running source integrity check...")
    source_cur = source_conn.cursor()
    integrity_result = source_cur.execute("PRAGMA integrity_check;").fetchall()
    if not integrity_result or integrity_result[0][0] != "ok":
        source_conn.close()
        raise RuntimeError(f"Source database integrity check failed: {integrity_result}")
    print("    -> Source database integrity: OK")

    # 2. Get baseline manifest
    source_manifest = get_database_manifest(source_conn)
    print(
        f"    -> Source contains {source_manifest['total_tables']} tables, "
        f"{source_manifest['total_rows']:,} live records."
    )

    # 3. Perform atomic online backup using SQLite backup API
    print(f"[*] Creating atomic snapshot: {backup_path}...")
    backup_conn = sqlite3.connect(backup_path)
    with backup_conn:
        source_conn.backup(backup_conn, pages=100)
    backup_conn.close()
    source_conn.close()

    # 4. Verify backup integrity
    print("[*] Verifying backup database integrity...")
    verify_conn = sqlite3.connect(backup_path)
    verify_cur = verify_conn.cursor()
    verify_integrity = verify_cur.execute("PRAGMA integrity_check;").fetchall()
    if not verify_integrity or verify_integrity[0][0] != "ok":
        verify_conn.close()
        raise RuntimeError(f"Backup database integrity check failed: {verify_integrity}")
    print("    -> Backup integrity check: OK")

    # 5. Verify row count equivalence
    backup_manifest = get_database_manifest(verify_conn)
    verify_conn.close()

    assert source_manifest["total_tables"] == backup_manifest["total_tables"], (
        f"Table count mismatch: {source_manifest['total_tables']} vs {backup_manifest['total_tables']}"
    )
    assert source_manifest["total_rows"] == backup_manifest["total_rows"], (
        f"Row count mismatch: {source_manifest['total_rows']} vs {backup_manifest['total_rows']}"
    )

    # 6. Compute Checksums
    backup_sha256 = compute_sha256(backup_path)
    backup_size_bytes = os.path.getsize(backup_path)
    print(f"    -> Backup SHA-256: {backup_sha256}")
    print(f"    -> Backup File Size: {backup_size_bytes / (1024 * 1024):.2f} MB")

    audit_report = {
        "timestamp_utc": datetime.datetime.utcnow().isoformat(),
        "source_path": os.path.abspath(source_path),
        "backup_path": os.path.abspath(backup_path),
        "backup_filename": backup_filename,
        "backup_size_bytes": backup_size_bytes,
        "backup_sha256": backup_sha256,
        "integrity_status": "VERIFIED_OK",
        "total_tables": backup_manifest["total_tables"],
        "total_rows": backup_manifest["total_rows"],
        "tables": backup_manifest["tables"],
    }

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(audit_report, f, indent=2)

    print(f"[+] Audit manifest written: {manifest_path}")
    print(f"[+] Backup complete: {backup_path} ({backup_manifest['total_rows']:,} rows preserved)")

    return audit_report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MyArea24 Database Backup & Verification Tool")
    parser.add_argument("--source", default="myarea24.db", help="Path to source SQLite database")
    parser.add_argument("--backup-dir", default="backups", help="Directory to store backups")
    args = parser.parse_args()

    try:
        backup_sqlite_database(args.source, args.backup_dir)
        sys.exit(0)
    except Exception as exc:
        print(f"[-] Backup failed: {exc}", file=sys.stderr)
        sys.exit(1)
