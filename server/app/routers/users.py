from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_staff
from ..models import StaffUser
from ..schemas import Principal

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/sync")
def sync_current_user(
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_staff),
):
    """Upsert the local shadow profile from the validated Zitadel token.

    `sub` is the identity key; roles are never stored here — they come from
    the token. Empty claim values never clobber stored data.
    """
    user = db.get(StaffUser, principal.sub)
    if user is None:
        user = StaffUser(sub=principal.sub, email=principal.email, full_name=principal.name)
        db.add(user)
    else:
        if principal.email:
            user.email = principal.email
        if principal.name:
            user.full_name = principal.name
    db.commit()
    db.refresh(user)
    return {"sub": user.sub, "email": user.email, "full_name": user.full_name}