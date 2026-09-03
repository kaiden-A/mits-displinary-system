from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_principal, require_roles
from ..models import StudentCache
from ..schemas import Principal, StudentListOut, StudentOut
from ..services import students_service

router = APIRouter(prefix="/students", tags=["students"])

sync_students = require_roles("guru_disiplin", "pentadbir", "super_admin")


@router.get("", response_model=StudentListOut)
def list_students(
    q: str | None = None,
    tingkatan: int | None = None,
    kelas: str | None = None,
    gender: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    _: Principal = Depends(get_current_principal),
):
    limit = min(max(limit, 1), 200)
    stmt = select(StudentCache)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(or_(StudentCache.name.ilike(like), StudentCache.ic_number.ilike(like)))
    if tingkatan is not None:
        stmt = stmt.where(StudentCache.tingkatan == tingkatan)
    if kelas:
        stmt = stmt.where(StudentCache.kelas == kelas)
    if gender:
        stmt = stmt.where(StudentCache.gender == gender)

    total = len(list(db.scalars(stmt)))
    rows = list(db.scalars(stmt.order_by(StudentCache.name).offset(offset).limit(limit)))
    return StudentListOut(
        total=total,
        items=[
            StudentOut(
                id=s.source_id,
                ic_number=s.ic_number,
                name=s.name,
                gender=s.gender,
                tingkatan=s.tingkatan,
                kelas=s.kelas,
                birth_year=s.birth_year,
                year=s.year,
            )
            for s in rows
        ],
    )


@router.get("/{source_id}", response_model=StudentOut)
def get_student(source_id: int, db: Session = Depends(get_db), _: Principal = Depends(get_current_principal)):
    student = students_service.get_student(db, source_id)
    if not student:
        raise HTTPException(status_code=404, detail="student not found")
    return StudentOut(
        id=student.source_id,
        ic_number=student.ic_number,
        name=student.name,
        gender=student.gender,
        tingkatan=student.tingkatan,
        kelas=student.kelas,
        birth_year=student.birth_year,
        year=student.year,
    )


@router.post("/sync")
def sync_students_now(db: Session = Depends(get_db), _: Principal = Depends(sync_students)):
    count = students_service.sync_students(db)
    return {"synced": count}


@router.get("/meta/tingkatan")
def tingkatan_list(db: Session = Depends(get_db), _: Principal = Depends(get_current_principal)):
    rows = db.execute(select(StudentCache.tingkatan).distinct()).all()
    return sorted({r[0] for r in rows})


@router.get("/meta/kelas")
def kelas_list(db: Session = Depends(get_db), _: Principal = Depends(get_current_principal)):
    rows = db.execute(select(StudentCache.kelas).distinct()).all()
    return sorted({r[0] for r in rows})