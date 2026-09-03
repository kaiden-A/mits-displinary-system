"""Sync the students cache from the configured STUDENT_DATA_API.

Run from the server directory with uv:
    uv run python scripts/sync_students.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal  # noqa: E402
from app.services.students_service import sync_students  # noqa: E402


def main() -> None:
    db = SessionLocal()
    try:
        count = sync_students(db)
        print(f"Synced {count} students into students_cache.")
    finally:
        db.close()


if __name__ == "__main__":
    main()