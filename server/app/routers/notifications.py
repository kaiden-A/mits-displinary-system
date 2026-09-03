from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_principal
from ..models import Notification
from ..schemas import NotificationOut, Principal

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def my_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    principal: Principal = Depends(get_current_principal),
):
    stmt = select(Notification).where(
        (Notification.recipient_sub == principal.sub)
        | (Notification.recipient_role.in_(principal.roles))
    )
    if unread_only:
        stmt = stmt.where(Notification.read.is_(False))
    rows = list(db.scalars(stmt.order_by(Notification.created_at.desc()).limit(50)))
    return [
        NotificationOut(id=n.id, ntype=n.ntype, case_id=n.case_id, text=n.text, read=n.read, created_at=n.created_at)
        for n in rows
    ]


@router.patch("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), principal: Principal = Depends(get_current_principal)):
    notification = db.get(Notification, notification_id)
    if not notification:
        return {"ok": False}
    if notification.recipient_sub not in (None, principal.sub):
        return {"ok": False}
    notification.read = True
    db.commit()
    return {"ok": True}