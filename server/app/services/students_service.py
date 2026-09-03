import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import StudentCache

STUDENT_API = "https://mits-student-server-1088310577603.asia-southeast1.run.app"


def fetch_all_students() -> list[dict]:
    """Fetch the full student list from the MITS student server (paginated)."""
    items: list[dict] = []
    offset = 0
    limit = 200
    with httpx.Client(timeout=30) as client:
        while True:
            res = client.get(f"{STUDENT_API}/api/v1/students/", params={"limit": limit, "offset": offset})
            res.raise_for_status()
            payload = res.json()
            batch = payload.get("items", [])
            items.extend(batch)
            total = payload.get("total", 0)
            offset += len(batch)
            if offset >= total or not batch:
                break
    return items


def sync_students(db: Session) -> int:
    """Upsert all students into the cache. Returns number of rows upserted."""
    rows = fetch_all_students()
    for row in rows:
        existing = db.scalar(
            select(StudentCache).where(StudentCache.source_id == row["id"])
        )
        if existing is None:
            existing = StudentCache(source_id=row["id"])
            db.add(existing)
        existing.ic_number = row["ic_number"]
        existing.name = row["name"]
        existing.gender = row["gender"]
        existing.tingkatan = row["tingkatan"]
        existing.kelas = row["kelas"]
        existing.birth_year = row["birth_year"]
        existing.year = row["year"]
    db.commit()
    return len(rows)


def get_student(db: Session, source_id: int) -> StudentCache | None:
    return db.scalar(select(StudentCache).where(StudentCache.source_id == source_id))


def snapshot_of(student: StudentCache) -> dict:
    """Identity snapshot stored on the case so history survives transfers/graduation."""
    return {
        "source_id": student.source_id,
        "ic_number": student.ic_number,
        "name": student.name,
        "gender": student.gender,
        "tingkatan": student.tingkatan,
        "kelas": student.kelas,
        "kelas_label": f"{student.tingkatan} {student.kelas}",
        "birth_year": student.birth_year,
        "year": student.year,
    }