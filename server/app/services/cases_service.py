from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import false, func, select
from sqlalchemy.orm import Session, selectinload

from ..models import B02Form, Case, CaseDoc, CaseEvent, CaseOffence, Notification
from ..schemas import CaseCreate, Principal
from ..seed import prefect_allowed
from . import email_service, workflow
from .students_service import get_student

MANAGER_ROLES = {"guru_disiplin", "pentadbir", "super_admin"}
ROLE_LABELS = {
    "guru_biasa": "Guru",
    "guru_disiplin": "Guru disiplin",
    "pentadbir": "Pentadbir",
    "super_admin": "Super admin",
    "pengawas": "Pengawas",
}
CASE_DOCUMENT_CODES = ("b01", "b03", "b05", "b06", "b07", "b08")
RECORDED_SET = {
    "RECORDED", "STUDENT_ACK", "ACTION_PREPARED", "PRINCIPAL_APPROVAL",
    "EXECUTED", "PARENT_NOTIFIED", "MEETING", "CLOSED",
}


def is_manager(principal: Principal) -> bool:
    return bool(set(principal.roles).intersection(MANAGER_ROLES))


def principal_role(principal: Principal, source: str | None = None) -> str:
    """Return a stable role instead of relying on token role ordering."""
    preferred = {
        "PREFECT_WARNING": ("super_admin", "pengawas"),
        "COMPLAINT": ("super_admin", "pentadbir", "guru_disiplin", "guru_biasa"),
        "SPOT_CHECK": ("super_admin", "pentadbir", "guru_disiplin"),
    }.get(source, ("super_admin", "pentadbir", "guru_disiplin", "guru_biasa", "pengawas"))
    roles = set(principal.roles)
    return next((role for role in preferred if role in roles), "unknown")


def _document_payloads(payload: CaseCreate) -> dict:
    """Accept both the legacy docs map and named structured document fields."""
    documents = dict(payload.docs or {})
    for code in CASE_DOCUMENT_CODES:
        data = getattr(payload, code, None)
        if data is not None:
            documents[code] = data
    return documents


def _add_notifications(
    db: Session,
    case: Case,
    ntype: str,
    text: str,
    *,
    roles: tuple[str, ...] = (),
    notify_reporter: bool = False,
) -> None:
    recipients: set[tuple[str | None, str | None]] = set()
    if notify_reporter and case.reporter_sub:
        recipients.add((case.reporter_sub, None))
    recipients.update((None, role) for role in roles)
    db.add_all(
        [
            Notification(
                recipient_sub=recipient_sub,
                recipient_role=recipient_role,
                ntype=ntype,
                case_id=case.id,
                text=text,
            )
            for recipient_sub, recipient_role in recipients
        ]
    )


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
    reporter_role = principal_role(principal, payload.source)
    case = Case(
        seq=next_seq(db),
        source=payload.source,
        status=status,
        student_source_id=student.source_id,
        student_snapshot=snapshot_student(student),
        reporter_sub=principal.sub,
        reporter_name=reporter_name,
        reporter_role=reporter_role,
        points=points,
        details=payload.details,
    )
    case.offences = [CaseOffence(code=o.code, name=o.name, points=o.points) for o in payload.offences]
    for doc_code, data in _document_payloads(payload).items():
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
    db.flush()
    _add_notifications(
        db,
        case,
        "CASE_CREATED",
        f"Kes baharu K-{case.seq} telah diwujudkan ({case.status}).",
        roles=("guru_disiplin", "pentadbir", "super_admin"),
    )
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
    if not can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
    if not workflow.needs_b02(case.source, case.points):
        raise HTTPException(status_code=422, detail="case does not require B02")
    if case.status not in {"REPORTED", "INVESTIGATING"}:
        raise HTTPException(status_code=422, detail="B02 may only be added while case is reported or investigating")
    if not set(principal.roles).intersection({"guru_biasa", "guru_disiplin", "pentadbir", "super_admin"}):
        raise HTTPException(status_code=403, detail="role may not fill B02")

    fill_role = principal_role(principal)
    fields = dict(fields or {})
    fields["disediakanOleh"] = principal.name
    fields["disediakanJawatan"] = ROLE_LABELS.get(fill_role, fill_role)
    fields["disediakanTarikh"] = datetime.now().date().isoformat()

    form = B02Form(fill_by=principal.name, fill_role=fill_role, fields=fields)
    case.b02_forms.append(form)
    case.events.append(
        CaseEvent(
            text=f"Borang Siasatan (B02) diisi oleh {principal.name} ({form.fill_role}).",
            by_name=principal.name,
            by_role=form.fill_role,
        )
    )
    db.commit()
    db.refresh(form)
    return form


def review_b02(db: Session, case_id: int, form_id: int, principal: Principal) -> B02Form:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
    if not is_manager(principal):
        raise HTTPException(status_code=403, detail="role may not review B02")

    form = next((f for f in case.b02_forms if f.id == form_id), None)
    if not form:
        raise HTTPException(status_code=404, detail="B02 form not found")

    fill_role = principal_role(principal)
    fields = dict(form.fields or {})
    fields["disemakOleh"] = principal.name
    fields["disemakJawatan"] = ROLE_LABELS.get(fill_role, fill_role)
    fields["disemakTarikh"] = datetime.now().date().isoformat()
    form.fields = fields
    case.events.append(
        CaseEvent(
            text=f"Borang Siasatan (B02-{form.id}) disemak oleh {principal.name} ({fill_role}).",
            by_name=principal.name,
            by_role=fill_role,
        )
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

    if action == "close" and 11 <= case.points <= 40 and not (case.counselling or []):
        raise HTTPException(
            status_code=422,
            detail="Rekod sesi kaunseling belum diisi sebelum kes ditutup (wajib untuk Peringkat 3-5).",
        )

    text = transition["text"]
    if action == "close" and case.points >= 41:
        text = f"{text} Murid dinasihatkan berpindah sekolah (Peringkat 6)."

    case.status = transition["to"]
    actor_role = principal_role(principal)
    case.events.append(CaseEvent(text=text, by_name=principal.name, by_role=actor_role))
    _add_notifications(
        db,
        case,
        "CASE_TRANSITION",
        f"Kes K-{case.seq}: {text}",
        roles=("guru_disiplin", "pentadbir", "super_admin"),
        notify_reporter=True,
    )
    if action == "ack":
        _record_b05_acknowledgement(case, principal, actor_role)
    db.commit()
    db.refresh(case)
    return case


def _record_b05_acknowledgement(case: Case, principal: Principal, actor_role: str) -> None:
    """Auto-create the B05 (Pengakuan Murid) record when the acknowledgment
    action is taken. The printed B05 is signed physically by the student and
    two witnesses; this record captures the acknowledgment data and audit trail."""
    doc = next((d for d in case.docs if d.doc_code == "b05"), None)
    if doc is None:
        doc = CaseDoc(doc_code="b05", data={})
        case.docs.append(doc)
    data = dict(doc.data or {})
    data.setdefault("perbuatan", ", ".join(o.name for o in case.offences))
    data.setdefault("tarikhPengakuan", datetime.now().date().isoformat())
    data.setdefault("masaPengakuan", datetime.now().strftime("%H:%M"))
    if not data.get("tempat"):
        tempat = next(
            (d.data.get("lokasi") for d in case.docs if d.doc_code == "b01" and isinstance(d.data, dict) and d.data.get("lokasi")),
            "",
        )
        data["tempat"] = tempat
    data["acknowledged_by"] = principal.name
    data["acknowledged_role"] = actor_role
    data["recorded_at"] = datetime.utcnow().isoformat()
    doc.data = data


def add_counselling_session(db: Session, case_id: int, session_fields: dict, principal: Principal) -> Case:
    """Append one counselling session record. Mandatory for tiers 3-5 (11-40 mata)."""
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
    if not is_manager(principal):
        raise HTTPException(status_code=403, detail="role may not record counselling sessions")
    if case.points < 11:
        raise HTTPException(status_code=422, detail="counselling is only required from Peringkat 3 (11 mata)")

    session_fields = dict(session_fields)
    session_fields["recorded_by"] = principal.name
    session_fields["recorded_at"] = datetime.utcnow().isoformat()
    sessions = list(case.counselling or [])
    sessions.append(session_fields)
    case.counselling = sessions
    case.events.append(
        CaseEvent(
            text=f"Sesi kaunseling direkod oleh {principal.name}.",
            by_name=principal.name,
            by_role=principal_role(principal),
        )
    )
    db.commit()
    db.refresh(case)
    return case


def set_punishment(db: Session, case_id: int, punishment: dict, principal: Principal) -> Case:
    """Record the tier-5 punishment (gantung asrama / gantung sekolah / rotan)."""
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
    if not is_manager(principal):
        raise HTTPException(status_code=403, detail="role may not record punishment")
    if not 31 <= case.points <= 40:
        raise HTTPException(status_code=422, detail="punishment record is only for Peringkat 5 (31-40 mata)")

    punishment = dict(punishment)
    punishment["recorded_by"] = principal.name
    punishment["recorded_at"] = datetime.utcnow().isoformat()
    case.punishment = punishment
    case.events.append(
        CaseEvent(
            text=f"Hukuman Peringkat 5 direkod oleh {principal.name}: {punishment.get('jenis', '')}.",
            by_name=principal.name,
            by_role=principal_role(principal),
        )
    )
    db.commit()
    db.refresh(case)
    return case


def patch_doc(db: Session, case_id: int, doc_code: str, data: dict, principal: Principal) -> CaseDoc:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
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


def patch_meeting(db: Session, case_id: int, meeting: dict, principal: Principal) -> Case:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="case not found")
    if not can_view_case(case, principal):
        raise HTTPException(status_code=403, detail="not your case")
    if not is_manager(principal):
        raise HTTPException(status_code=403, detail="role may not edit meeting records")
    case.meeting = meeting
    case.events.append(
        CaseEvent(
            text=f"Rekod pertemuan ibu bapa dikemas kini oleh {principal.name}.",
            by_name=principal.name,
            by_role=principal_role(principal),
        )
    )
    db.commit()
    db.refresh(case)
    return case


def can_view_case(case: Case, principal: Principal) -> bool:
    if is_manager(principal):
        return True
    if "guru_biasa" in principal.roles:
        return case.reporter_sub == principal.sub
    return False


def case_visible_query(principal: Principal):
    """Filter for list queries: own cases for guru_biasa, all for managers."""
    from ..models import Case as CaseModel

    if is_manager(principal):
        return select(CaseModel)
    if "guru_biasa" in principal.roles:
        return select(CaseModel).where(CaseModel.reporter_sub == principal.sub)
    return select(CaseModel).where(false())


def recorded_cases(db: Session) -> list[Case]:
    return list(
        db.scalars(
            select(Case)
            .options(selectinload(Case.offences))
            .where(Case.status.in_(RECORDED_SET), Case.status != "DISMISSED")
            .order_by(Case.created_at)
        )
    )


def case_id_label(case: Case) -> str:
    return f"K-{case.seq}"


def snapshot_student(student) -> dict:
    from .students_service import snapshot_of

    return snapshot_of(student)
