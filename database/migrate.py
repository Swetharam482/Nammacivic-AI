"""
NammaCivic AI - Database Migration Runner
Supports both PostgreSQL (production) and SQLite (development).
Tracks applied versions in the `schema_migrations` table.
"""

import sys
import argparse
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy import text, inspect

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from app.core.database import engine, Base
    from app.core.config import settings
    import app.models  # load models
except ImportError:
    from backend.app.core.database import engine, Base
    from backend.app.core.config import settings
    import backend.app.models

MIGRATIONS = [
    {
        "version": "001_initial_schema",
        "description": "Create core tables: users, departments, complaints, history, evidence, verifications, sessions",
        "up": lambda conn: Base.metadata.create_all(bind=conn)
    },
    {
        "version": "002_add_geocoding_columns",
        "description": "Ensure spatial geocoding columns (latitude, longitude, geocoded_address) exist on complaints",
        "up": lambda conn: _add_geocoding_columns(conn)
    }
]

def _add_geocoding_columns(conn):
    inspector = inspect(conn)
    if "complaints" in inspector.get_table_names():
        cols = [c["name"] for c in inspector.get_columns("complaints")]
        if "latitude" not in cols:
            conn.execute(text("ALTER TABLE complaints ADD COLUMN latitude FLOAT"))
        if "longitude" not in cols:
            conn.execute(text("ALTER TABLE complaints ADD COLUMN longitude FLOAT"))
        if "geocoded_address" not in cols:
            conn.execute(text("ALTER TABLE complaints ADD COLUMN geocoded_address VARCHAR(500)"))

def ensure_migration_table(conn):
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(100) PRIMARY KEY,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    """))

def get_applied_migrations(conn):
    ensure_migration_table(conn)
    res = conn.execute(text("SELECT version FROM schema_migrations ORDER BY version ASC"))
    return {row[0] for row in res.fetchall()}

def record_migration(conn, version):
    now = datetime.now(timezone.utc)
    conn.execute(
        text("INSERT INTO schema_migrations (version, applied_at) VALUES (:version, :applied_at)"),
        {"version": version, "applied_at": now}
    )

def run_migrations():
    print(f"Connecting to database via engine dialect: '{engine.dialect.name}'...")
    with engine.begin() as conn:
        applied = get_applied_migrations(conn)
        pending = [m for m in MIGRATIONS if m["version"] not in applied]

        if not pending:
            print("Database is up to date. No pending migrations.")
            return

        print(f"Found {len(pending)} pending migration(s):")
        for m in pending:
            print(f"  -> Applying [{m['version']}]: {m['description']}...")
            m["up"](conn)
            record_migration(conn, m["version"])
            print(f"     Applied [{m['version']}] successfully.")

    print("All migrations completed successfully.")

def show_status():
    with engine.connect() as conn:
        applied = get_applied_migrations(conn)
        print(f"\nDatabase status (Dialect: {engine.dialect.name}):")
        print("-" * 60)
        for m in MIGRATIONS:
            status = "APPLIED" if m["version"] in applied else "PENDING"
            print(f"  [{status:7s}] {m['version']} - {m['description']}")
        print("-" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NammaCivic AI Database Migration Tool")
    parser.add_argument("--status", action="store_true", help="Show migration status")
    args = parser.parse_args()

    if args.status:
        show_status()
    else:
        run_migrations()

