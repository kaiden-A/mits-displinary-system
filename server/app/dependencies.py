from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .auth.pengawas import PW_SUB_PREFIX, decode_session_token
from .auth.zitadel import validate_staff_token
from .database import get_db
from .schemas import Principal

bearer_scheme = HTTPBearer(auto_error=False)

STAFF_ROLES = {"guru_biasa", "guru_disiplin", "pentadbir", "super_admin"}


def get_current_principal(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Principal:
    """Accepts either a Zitadel access token (staff) or a pengawas session JWT."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing token")

    token = credentials.credentials

    try:
        pengawas_claims = decode_session_token(token)
        if pengawas_claims and pengawas_claims.get("sub", "").startswith(PW_SUB_PREFIX):
            return Principal(
                auth_type="pengawas",
                sub=str(pengawas_claims["sub"]),
                name=str(pengawas_claims.get("name") or ""),
                email=str(pengawas_claims.get("email") or ""),
                roles=["pengawas"],
            )
    except Exception:
        pass

    try:
        return validate_staff_token(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"invalid token: {exc}",
        ) from exc


def require_roles(*roles: str):
    """Dependency factory — requires the principal to hold at least one of the roles."""

    def checker(principal: Principal = Depends(get_current_principal)) -> Principal:
        if not set(principal.roles).intersection(roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"requires one of roles: {', '.join(roles)}",
            )
        return principal

    return checker


def require_staff(principal: Principal = Depends(get_current_principal)) -> Principal:
    if principal.auth_type != "staff" or not set(principal.roles).intersection(STAFF_ROLES):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="staff only")
    return principal


def get_optional_db() -> Session:
    yield from get_db()