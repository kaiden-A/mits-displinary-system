from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_principal
from ..schemas import (
    B02In,
    B02Out,
    CaseCreate,
    CaseDetailOut,
    CaseDocOut,
    CaseEventOut,
    CaseOut,
    DocPatch,
    OffenceIn,
    Principal,
    TransitionIn,
)
from ..services import cases_service, workflow

router = APIRouter(prefix="/cases", tags=["cases"])


def _to_detail(case) -> CaseDetailOut:
    return CaseDetailOut(
        id=case.id,
        seq=case.seq,
        source=case.source,
        status=case.status,
        student_source_id=case.student_source_id,
        student_snapshot=case.student_snapshot,
        reporter_name=case.reporter_name,
        reporter_role=case.reporter_role,
        points=case.points,
        details=case.details,
        warning_level=case.warning_level,
        meeting=case.meeting,
        created_at=case.created_at,
        updated_at=case.updated_at,
        offences=[OffenceIn(code=o.code, name=o.name, points=o.points) for o in case.offences],
        events=[CaseEventOut(ts=e.ts, text=e.text, by_name=e.by_name, by_role=e.by_role) for e in case.events],
        b02_forms=[B02Out(id=f.id, fill_by=f.fill_by, fill_role=f.fill_role, filled_at=f.filled_at, fields=f.fields) for f in case.b02_forms],
        docs=[CaseDocOut(doc_code=d.doc_code, data=d.data) for d in case.docs],
    )


def _to_out(case) -> CaseOut:
    return CaseOut(
        id=case.id,
        seq=case.seq,
        source=case.source,
        status=case.status,
        student_source_id=case.student_source_id,
        student_snapshot=case.student_snapshot,
        reporter_name=case.reporter_name,
        reporter_role=case.reporter_role,
        points=case.points,
        details=case.details,
        warning_level=case.warning_level,
        meeting=case.meeting,
        created_at=case.created_at,
        updated_at=case.updated_at,
    )


@router.post("", status_code=201)
def create_case(payload: CaseCreate, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = cases_service.create_case(db, payload, principal)
    return _to_out(case)


@router.get("")
def list_cases(status: str | None = None, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    stmt = cases_service.case_visible_query(principal)
    if status:
        from ..models import Case as CaseModel

        stmt = stmt.where(CaseModel.status == status)
    rows = list(db.scalars(stmt.order_by(cases_service.Case.seq.desc())))
    return [_to_out(c) for c in rows if c]


@router.get("/recorded")
def recorded_register(db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    if not set(principal.roles).intersection({"guru_disiplin", "pentadbir", "super_admin"}):
        raise HTTPException(status_code=403, detail="B04 register is for discipline staff")
    return [_to_out(c) for c in cases_service.recorded_cases(db)]


@router.get("/{case_id}", response_model=CaseDetailOut)
def get_case(case_id: int, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = db.get(cases_service.Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not cases_service.can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
    return _to_detail(case)


@router.post("/{case_id}/b02", response_model=B02Out)
def add_b02(case_id: int, payload: B02In, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    form = cases_service.add_b02(db, case_id, payload.fields, principal)
    return B02Out(id=form.id, fill_by=form.fill_by, fill_role=form.fill_role, filled_at=form.filled_at, fields=form.fields)


@router.post("/{case_id}/transitions")
def transition(case_id: int, payload: TransitionIn, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = cases_service.advance(db, case_id, payload.action, principal)
    return {"id": case.id, "status": case.status, "label": workflow.status_label(case.status)}


@router.patch("/{case_id}/docs")
def patch_doc(case_id: int, payload: DocPatch, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    doc = cases_service.patch_doc(db, case_id, payload.doc_code, payload.data, principal)
    return CaseDocOut(doc_code=doc.doc_code, data=doc.data)


@router.get("/{case_id}/steps")
def steps(case_id: int, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = db.get(cases_service.Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    has_b02 = len(case.b02_forms) > 0
    return workflow.next_steps(case.source, case.points, case.status, has_b02)