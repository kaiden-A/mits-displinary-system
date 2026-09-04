from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import dev as dev_auth  # DEV ONLY — delete after testing
from ..auth import pengawas as pw
from ..database import get_db
from ..dependencies import get_current_principal
from ..models import DevUser, PengawasAccount  # DevUser DEV ONLY — delete after testing
from ..schemas import PengawasLoginIn, Principal

router = APIRouter(prefix="/auth", tags=["auth"])


# DEV ONLY — local staff login to simulate roles. DELETE AFTER TESTING.
@router.post("/dev/login")
def dev_login(payload: PengawasLoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(DevUser).where(DevUser.email == payload.email.lower()))
    if not user or not pw.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")
    token = dev_auth.create_dev_token(user)
    return {
        "token": token,
        "expires_in": 8 * 60 * 60,
        "user": {"name": user.full_name, "email": user.email, "roles": [user.role]},
    }


@router.post("/pengawas/login")
def pengawas_login(payload: PengawasLoginIn, db: Session = Depends(get_db)):
    account = db.scalar(select(PengawasAccount).where(PengawasAccount.email == payload.email.lower()))
    if not account or not account.active:
        raise HTTPException(status_code=401, detail="invalid credentials")
    if pw.is_locked(account):
        raise HTTPException(status_code=423, detail="account locked, try again later")
    if not pw.verify_password(payload.password, account.password_hash):
        pw.record_failure(db, account)
        raise HTTPException(status_code=401, detail="invalid credentials")

    pw.reset_failures(db, account)
    token = pw.create_session_token(account)
    return {
        "token": token,
        "expires_in": 60 * 15,
        "session_minutes": 15,
        "user": {"name": account.full_name, "email": account.email, "role": "pengawas"},
    }


@router.post("/pengawas/logout")
def pengawas_logout():
    return {"ok": True}


@router.get("/me")
def me(principal: Principal = Depends(get_current_principal)):
    return {
        "auth_type": principal.auth_type,
        "sub": principal.sub,
        "name": principal.name,
        "email": principal.email,
        "roles": principal.roles,
    }