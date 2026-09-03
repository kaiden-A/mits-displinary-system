from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..config import settings
from ..models import PengawasAccount

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

PW_SUB_PREFIX = "pengawas:"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(password, password_hash)
    except Exception:
        return False


def create_session_token(account: PengawasAccount) -> str:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=settings.pengawas_session_minutes)
    return jwt.encode(
        {
            "sub": f"{PW_SUB_PREFIX}{account.id}",
            "role": "pengawas",
            "name": account.full_name,
            "email": account.email,
            "exp": expires,
            "iat": now,
        },
        settings.app_secret,
        algorithm="HS256",
    )


def decode_session_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.app_secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def is_locked(account: PengawasAccount, now: datetime | None = None) -> bool:
    now = now or datetime.now(timezone.utc)
    if account.locked_until is None:
        return False
    if account.locked_until.tzinfo is None:
        account.locked_until = account.locked_until.replace(tzinfo=timezone.utc)
    return account.locked_until > now


def record_failure(db: Session, account: PengawasAccount) -> None:
    account.failed_attempts += 1
    if account.failed_attempts >= settings.pengawas_max_failed:
        account.locked_until = datetime.now(timezone.utc) + timedelta(
            minutes=settings.pengawas_lock_minutes
        )
        account.failed_attempts = 0
    db.commit()


def reset_failures(db: Session, account: PengawasAccount) -> None:
    account.failed_attempts = 0
    account.locked_until = None
    db.commit()