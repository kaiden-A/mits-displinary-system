from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import B02Form, Case, CaseDoc, CaseEvent, CaseOffence
from ..schemas import CaseCreate, Principal
from ..seed import prefect_allowed
from . import email_service, workflow
from .students_service import get_student

RECORDED_SET = {
    "RECORDED", "STUDENT_ACK", "ACTION_PREPARED", "PRINCIPAL_APPROVAL",
    "EXECUTED", "PARENT_NOTIFIED", "MEETING", "CLOSED",
}


def next_seq(db: Session) -> int:
    current = db.scalar(select(func.max(Case.seq)))
    return (current or 99) + 1


def _validate_offences(db: Session, offences) -> int:
    from ..seed import offence_by_code

    total = 0
    for off in offences:
        row = offence_by_code(off.code)
        if row is None:
            raise HTTPException(status_code=422, detail=f"unknown offence code: {off.code}")
        if off.points < row[3] or off.points > row[4]:
            raise HTTPException(status_code=422, detail=f"points out of range for {off.code}")
        total += off.points
    return total


def _validate_prefect(offences) -> int:
    allowed = {row[0] for row in prefect_allowed()}
    total = 0
    for off in offences:
        if off.code not in allowed:
            raise HTTPException(status_code=422, detail=f"pengawas cannot report {off.code} (max 5 mata)")
        total += off.points
    if total > 5:
        raise HTTPException(status_code=422, detail="Kad Peringatan tidak boleh melebihi 5 mata")
    return total


def create_case(db: Session, payload: CaseCreate, principal: Principal) -> Case:
    student = get_student(db, payload.student_source_id)
    if student is None:
        raise HTTPException(status_code=404, detail="student not found in cache (run /students/sync)")

    if payload.source == "PREFECT_WARNING":
        if "pengawas" not in principal.roles and "super_admin" not in principal.roles:
            raise HTTPException(status_code=403, detail="only pengawas / super_admin may file B03")
        points = _validate_prefect(payload.offences)
        status = "REPORTED"
    elif payload.source == "COMPLAINT":
        if not set(principal.roles).intersection({"guru_biasa", "guru_disiplin", "pentadbir", "super_admin"}):
            raise HTTPException(status_code=403, detail="role may not file B01")
        points = _validate_offences(db, payload.offences)
        status = "RECORDED" if points <= 5 else "REPORTED"
    else:  # SPOT_CHECK
        if not set(principal.roles).intersection({"guru_disiplin", "pentadbir", "super_admin"}):
            raise HTTPException(status_code=403, detail="only discipline staff may file spot check")
        points = _validate_offences(db, payload.offences)
        status = "REPORTED"

    reporter_name = payload.reporter_name_override or principal.name
    case = Case(
        seq=next_seq(db),
        source=payload.source,
        status=status,
        student_source_id=student.source_id,
        student_snapshot=snapshot_student(student),
        reporter_sub=principal.sub,
        reporter_name=reporter_name,
        reporter_role=principal.roles[0] if principal.roles else "unknown",
        points=points,
        details=payload.details,
    )
    case.offences = [CaseOffence(code=o.code, name=o.name, points=o.points) for o in payload.offences]
    for doc_code, data in (payload.docs or {}).items():
        case.docs.append(CaseDoc(doc_code=doc_code, data=data))

    first_event = {
        "COMPLAINT": (
            f"Aduan (B01) diterima daripada {reporter_name} dan direkod terus dalam B04."
            if points <= 5
            else f"Aduan (B01) diterima daripada {reporter_name} — menunggu siasatan (B02)."
        ),
        "PREFECT_WARNING": f"Kad Peringatan (B03) dikeluarkan oleh {reporter_name} — menunggu semakan.",
        "SPOT_CHECK": f"Kesalahan dikesan melalui spot check oleh {reporter_name}.",
    }[payload.source]
    case.events.append(CaseEvent(text=first_event, by_name=reporter_name, by_role=case.reporter_role))

    db.add(case)
    db.commit()
    db.refresh(case)

    email_service.notify_case_created(
        {
            "id": case_id_label(case),
            "status": case.status,
            "student_name": case.student_snapshot.get("name", ""),
            "points": case.points,
        },
        payload.source,
    )
    return case


def add_b02(db: Session, case_id: int, fields: dict, principal: Principal) -> B02Form:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not workflow.needs_b02(case.source, case.points):
        raise HTTPException(status_code=422, detail="case does not require B02")
    if not set(principal.roles).intersection({"guru_biasa", "guru_disiplin", "pentadbir", "super_admin"}):
        raise HTTPException(status_code=403, detail="role may not fill B02")

    form = B02Form(fill_by=principal.name, fill_role=principal.roles[0] if principal.roles else "", fields=fields)
    case.b02_forms.append(form)
    case.events.append(
        CaseEvent(text=f"Borang Siasatan (B02) diisi oleh {principal.name} ({case.reporter_role}).", by_name=principal.name)
    )
    db.commit()
    db.refresh(form)
    return form


def advance(db: Session, case_id: int, action: str, principal: Principal) -> Case:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    try:
        transition = workflow.validate_transition(case, action, principal.roles)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    case.status = transition["to"]
    case.events.append(CaseEvent(text=transition["text"], by_name=principal.name, by_role=principal.roles[0] if principal.roles else ""))
    db.commit()
    db.refresh(case)
    return case


def patch_doc(db: Session, case_id: int, doc_code: str, data: dict, principal: Principal) -> CaseDoc:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not set(principal.roles).intersection({"guru_disiplin", "pentadbir", "super_admin"}):
        raise HTTPException(status_code=403, detail="role may not edit case documents")
    doc = next((d for d in case.docs if d.doc_code == doc_code), None)
    if doc is None:
        doc = CaseDoc(doc_code=doc_code, data=data)
        case.docs.append(doc)
    else:
        doc.data = data
    db.commit()
    db.refresh(doc)
    return doc


def can_view_case(case: Case, principal: Principal) -> bool:
    if set(principal.roles).intersection({"guru_disiplin", "pentadbir", "super_admin"}):
        return True
    if "guru_biasa" in principal.roles:
        return case.reporter_sub == principal.sub
    return False


def case_visible_query(principal: Principal):
    """Filter for list queries: own cases for guru_biasa, all for managers."""
    from ..models import Case as CaseModel

    if set(principal.roles).intersection({"guru_disiplin", "pentadbir", "super_admin"}):
        return select(CaseModel)
    return select(CaseModel).where(CaseModel.reporter_sub == principal.sub)


def recorded_cases(db: Session) -> list[Case]:
    return list(db.scalars(select(Case).where(Case.status.in_(RECORDED_SET)).order_by(Case.created_at)))


def case_id_label(case: Case) -> str:
    return f"K-{case.seq}"


def snapshot_student(student) -> dict:
    from .students_service import snapshot_of

    return snapshot_of(student)