from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth.pengawas import hash_password
from ..config import settings
from ..database import get_db
from ..dependencies import require_roles
from ..models import PengawasAccount
from ..schemas import PengawasAccountCreate, PengawasAccountOut, Principal, ResetPasswordIn

router = APIRouter(prefix="/accounts", tags=["accounts"])

manage_accounts = require_roles("pentadbir", "super_admin")


@router.get("/pengawas", response_model=list[PengawasAccountOut])
def list_pengawas(db: Session = Depends(get_db), _: Principal = Depends(manage_accounts)):
    return list(db.scalars(select(PengawasAccount).order_by(PengawasAccount.email)))


@router.post("/pengawas", response_model=PengawasAccountOut, status_code=201)
def create_pengawas(
    payload: PengawasAccountCreate,
    db: Session = Depends(get_db),
    _: Principal = Depends(manage_accounts),
):
    existing = db.scalar(select(PengawasAccount).where(PengawasAccount.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=409, detail="email already registered")
    account = PengawasAccount(
        email=payload.email.lower(),
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.post("/pengawas/{account_id}/reset-password")
def reset_pengawas_password(
    account_id: int,
    payload: ResetPasswordIn,
    db: Session = Depends(get_db),
    _: Principal = Depends(manage_accounts),
):
    account = db.get(PengawasAccount, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="account not found")
    account.password_hash = hash_password(payload.new_password)
    account.failed_attempts = 0
    account.locked_until = None
    db.commit()
    return {"ok": True}


@router.post("/pengawas/{account_id}/lock")
def lock_pengawas(
    account_id: int,
    locked: bool,
    db: Session = Depends(get_db),
    _: Principal = Depends(manage_accounts),
):
    account = db.get(PengawasAccount, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="account not found")
    if locked:
        account.locked_until = datetime.now(timezone.utc) + timedelta(days=365)
    else:
        account.locked_until = None
        account.failed_attempts = 0
    db.commit()
    return {"ok": True}


@router.post("/pengawas/{account_id}/toggle-active")
def toggle_pengawas_active(
    account_id: int,
    db: Session = Depends(get_db),
    _: Principal = Depends(manage_accounts),
):
    account = db.get(PengawasAccount, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="account not found")
    account.active = not account.active
    db.commit()
    return {"ok": True, "active": account.active}