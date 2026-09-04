# DEV ONLY — local staff login for development/testing. DELETE AFTER TESTING.
from datetime import datetime, timedelta, timezone

import jwt

from ..config import settings
from ..models import DevUser

DEV_SUB_PREFIX = "dev:"


def create_dev_token(user: DevUser, *, hours: int = 8) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "sub": f"{DEV_SUB_PREFIX}{user.email}",
            "roles": [user.role],
            "name": user.full_name,
            "email": user.email,
            "exp": now + timedelta(hours=hours),
            "iat": now,
        },
        settings.app_secret,
        algorithm="HS256",
    )