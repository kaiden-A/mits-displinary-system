from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

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
    MeetingPatch,
    OffenceIn,
    Principal,
    TransitionIn,
)
from ..services import cases_service, workflow
from ..services.students_service import mask_ic_number
from ..seed import tier_for

router = APIRouter(prefix="/cases", tags=["cases"])


def _safe_snapshot(case, principal: Principal | None) -> dict:
    snapshot = dict(case.student_snapshot or {})
    if principal is not None and not cases_service.is_manager(principal):
        snapshot["ic_number"] = mask_ic_number(snapshot.get("ic_number"))
    return snapshot


def _structured_docs(case) -> dict[str, dict | None]:
    return {
        code: next(
            (doc.data for doc in case.docs if doc.doc_code == code and isinstance(doc.data, dict)),
            None,
        )
        for code in cases_service.CASE_DOCUMENT_CODES
    }


def _to_detail(case, principal: Principal | None = None) -> CaseDetailOut:
    structured = _structured_docs(case)
    return CaseDetailOut(
        id=case.id,
        seq=case.seq,
        source=case.source,
        status=case.status,
        student_source_id=case.student_source_id,
        student_snapshot=_safe_snapshot(case, principal),
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
        tier=tier_for(case.points)["tier"],
        tier_label=tier_for(case.points)["label"],
        counselling=case.counselling or [],
        punishment=case.punishment,
        **structured,
    )


def _to_out(case, principal: Principal | None = None) -> CaseOut:
    return CaseOut(
        id=case.id,
        seq=case.seq,
        source=case.source,
        status=case.status,
        student_source_id=case.student_source_id,
        student_snapshot=_safe_snapshot(case, principal),
        reporter_name=case.reporter_name,
        reporter_role=case.reporter_role,
        points=case.points,
        details=case.details,
        warning_level=case.warning_level,
        meeting=case.meeting,
        created_at=case.created_at,
        updated_at=case.updated_at,
        offences=[OffenceIn(code=o.code, name=o.name, points=o.points) for o in case.offences],
        tier=tier_for(case.points)["tier"],
        tier_label=tier_for(case.points)["label"],
        counselling=case.counselling or [],
        punishment=case.punishment,
    )


@router.post("", status_code=201)
def create_case(payload: CaseCreate, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = cases_service.create_case(db, payload, principal)
    return _to_out(case, principal)


@router.get("")
def list_cases(
    q: str | None = None,
    source: str | None = None,
    status: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    principal: Principal = Depends(get_current_principal),
):
    stmt = cases_service.case_visible_query(principal).options(selectinload(cases_service.Case.offences))
    if q:
        like = f"%{q}%"
        snapshot = cases_service.Case.student_snapshot
        stmt = stmt.where(
            or_(
                snapshot["name"].as_string().ilike(like),
                snapshot["source_id"].as_string().ilike(like),
                snapshot["id"].as_string().ilike(like),
                cases_service.Case.details.ilike(like),
            )
        )
    if source:
        stmt = stmt.where(cases_service.Case.source == source)
    if status:
        stmt = stmt.where(cases_service.Case.status == status)
    rows = list(
        db.scalars(
            stmt.order_by(cases_service.Case.seq.desc()).offset(offset).limit(limit)
        )
    )
    return [_to_out(c, principal) for c in rows if c]


@router.get("/recorded")
def recorded_register(db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    if not set(principal.roles).intersection({"guru_disiplin", "pentadbir", "super_admin"}):
        raise HTTPException(status_code=403, detail="B04 register is for discipline staff")
    return [_to_out(c, principal) for c in cases_service.recorded_cases(db)]


@router.get("/{case_id}", response_model=CaseDetailOut)
def get_case(case_id: int, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = db.get(cases_service.Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not cases_service.can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
    return _to_detail(case, principal)


@router.post("/{case_id}/b02", response_model=B02Out)
def add_b02(case_id: int, payload: B02In, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    form = cases_service.add_b02(db, case_id, payload.fields, principal)
    return B02Out(id=form.id, fill_by=form.fill_by, fill_role=form.fill_role, filled_at=form.filled_at, fields=form.fields)


@router.post("/{case_id}/b02/{form_id}/review", response_model=B02Out)
def review_b02(case_id: int, form_id: int, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    form = cases_service.review_b02(db, case_id, form_id, principal)
    return B02Out(id=form.id, fill_by=form.fill_by, fill_role=form.fill_role, filled_at=form.filled_at, fields=form.fields)


@router.post("/{case_id}/transitions")
def transition(case_id: int, payload: TransitionIn, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = cases_service.advance(db, case_id, payload.action, principal)
    return {"id": case.id, "status": case.status, "label": workflow.status_label(case.status)}


@router.patch("/{case_id}/docs")
def patch_doc(case_id: int, payload: DocPatch, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    doc = cases_service.patch_doc(db, case_id, payload.doc_code, payload.data, principal)
    return CaseDocOut(doc_code=doc.doc_code, data=doc.data)


@router.patch("/{case_id}/meeting")
def patch_meeting(case_id: int, payload: MeetingPatch, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = cases_service.patch_meeting(db, case_id, payload.meeting, principal)
    return {"id": case.id, "meeting": case.meeting}


@router.post("/{case_id}/counselling")
def add_counselling(case_id: int, payload: MeetingPatch, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = cases_service.add_counselling_session(db, case_id, payload.meeting, principal)
    return {"id": case.id, "counselling": case.counselling or []}


@router.patch("/{case_id}/punishment")
def patch_punishment(case_id: int, payload: MeetingPatch, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = cases_service.set_punishment(db, case_id, payload.meeting, principal)
    return {"id": case.id, "punishment": case.punishment}


@router.get("/{case_id}/steps")
def steps(case_id: int, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    case = db.get(cases_service.Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not cases_service.can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
    has_b02 = len(case.b02_forms) > 0
    needs_b07 = any(o.code in {"D02", "D03", "J01", "J06", "L09", "L13", "L15"} for o in case.offences)
    return workflow.next_steps(case.source, case.points, case.status, has_b02, needs_b07)
