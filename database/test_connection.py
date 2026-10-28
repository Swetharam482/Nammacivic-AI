"""
NammaCivic AI - PostgreSQL Connection Diagnostics Tool
Tests database connectivity against local or remote PostgreSQL using credentials from .env
"""

import sys
from pathlib import Path

# Add backend directory to path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.core.config import settings
from app.core.database import get_normalized_database_url, engine
from sqlalchemy import text, inspect

def test_connection():
    db_url = get_normalized_database_url(settings.DATABASE_URL)
    masked_url = db_url
    if ":" in db_url and "@" in db_url:
        # Mask password in console output
        prefix, rest = db_url.split("://", 1)
        creds, host_part = rest.split("@", 1)
        if ":" in creds:
            user, _ = creds.split(":", 1)
            masked_url = f"{prefix}://{user}:******@{host_part}"

    print("=" * 65)
    print("  NammaCivic AI - Database Connection Diagnostic")
    print("=" * 65)
    print(f"Target URL: {masked_url}")
    print(f"Dialect:    {engine.dialect.name}")
    print("-" * 65)

    if engine.dialect.name == "sqlite":
        print("[NOTICE] Application is currently configured with SQLite fallback.")
        print("To connect to your PostgreSQL database, configure DATABASE_URL in .env:")
        print("  DATABASE_URL=postgresql://postgres:<your_password>@localhost:5432/Nammacivic AI")
        print("=" * 65)
        return False

    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version(), current_database(), current_user;")).fetchone()
            version, db_name, db_user = result[0], result[1], result[2]
            
            print(f"[SUCCESS] Successfully connected to PostgreSQL!")
            print(f"  -> Database: {db_name}")
            print(f"  -> User:     {db_user}")
            print(f"  -> Version:  {version.split(',')[0]}")
            
            # Inspect tables
            inspector = inspect(conn)
            tables = inspector.get_table_names()
            print(f"  -> Existing tables in database: {len(tables)}")
            if tables:
                print(f"     Tables: {', '.join(sorted(tables))}")
            else:
                print("     (No tables found yet. Run 'python database/migrate.py' to initialize schema)")
            
            print("=" * 65)
            return True

    except Exception as e:
        err_msg = str(e)
        print(f"[FAILED] Could not connect to PostgreSQL database.")
        if "fe_sendauth: no password supplied" in err_msg or "password authentication failed" in err_msg:
            print("  -> Authentication Error: Password incorrect or not supplied.")
            print("  -> Solution: Set your PostgreSQL password in .env file (DATABASE_URL or POSTGRES_PASSWORD).")
        elif "does not exist" in err_msg:
            print(f"  -> Database Error: The target database does not exist in PostgreSQL.")
            print("  -> Solution: Create the database in pgAdmin or run: psql -U postgres -c 'CREATE DATABASE \"Nammacivic AI\";'")
        else:
            print(f"  -> Details: {err_msg}")
        print("=" * 65)
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
