from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..auth.zitadel import fetch_userinfo
from ..database import get_db
from ..dependencies import bearer_scheme, require_staff
from ..models import StaffUser
from ..schemas import Principal

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/sync")
def sync_current_user(
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_staff),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """Upsert the local shadow profile from the validated Zitadel token.

    `sub` is the identity key; roles are never stored here — they come from
    the token. Profile claims are taken from OIDC userinfo first (the access
    token itself usually carries no email/name), falling back to token claims.
    Empty values never clobber stored data.
    """
    info = fetch_userinfo(credentials.credentials) if credentials else {}
    email = str(info.get("email") or principal.email or "")
    full_name = str(info.get("name") or info.get("preferred_username") or principal.name or "")
    if not email and not full_name:
        return {"sub": principal.sub, "email": "", "full_name": ""}

    user = db.get(StaffUser, principal.sub)
    if user is None:
        user = StaffUser(sub=principal.sub, email=email, full_name=full_name)
        db.add(user)
    else:
        if email:
            user.email = email
        if full_name:
            user.full_name = full_name
    db.commit()
    db.refresh(user)
    return {"sub": user.sub, "email": user.email, "full_name": user.full_name}