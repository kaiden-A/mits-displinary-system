"""Reset the database — deletes all rows from every table except the students cache.

Run from the server directory with uv:
    uv run python scripts/clean_db.py
"""

import sys
from pathlib import Path

from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import engine  # noqa: E402

KEEP_TABLES = {"students_cache", "alembic_version"}


def main() -> None:
    with engine.begin() as conn:
        tables = [
            row[0]
            for row in conn.execute(
                text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
            )
        ]
        drop = [t for t in tables if t not in KEEP_TABLES]
        if drop:
            conn.execute(text(f"TRUNCATE TABLE {', '.join(drop)} RESTART IDENTITY CASCADE"))
        print(f"Cleaned {len(drop)} tables: {', '.join(drop) or 'none'}")
        print(f"Kept: {', '.join(KEEP_TABLES)}")


if __name__ == "__main__":
    main()