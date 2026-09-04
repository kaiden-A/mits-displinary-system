"""DEV ONLY â€” seed local staff accounts to simulate roles. DELETE AFTER TESTING.

Creates three local users (pentadbir / guru_disiplin / guru_biasa) used by the
dev login page at /login-dev. Production staff login stays on Zitadel OIDC.

Run from the server directory with uv:
    uv run python scripts/seed_dev_users.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.auth.pengawas import hash_password  # noqa: E402
from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models import DevUser  # noqa: E402

DEV_PASSWORD = "dev123456"

DEV_USERS = [
    {"email": "pentadbir@mits.edu.my", "full_name": "Dev Pentadbir", "role": "pentadbir"},
    {"email": "guru_disiplin@mits.edu.my", "full_name": "Dev Guru Disiplin", "role": "guru_disiplin"},
    {"email": "guru_biasa@mits.edu.my", "full_name": "Dev Guru Biasa", "role": "guru_biasa"},
]


def main() -> None:
    Base.metadata.create_all(engine)  # DEV ONLY table: dev_users
    with SessionLocal() as db:
        for spec in DEV_USERS:
            existing = db.scalar(select(DevUser).where(DevUser.email == spec["email"]))
            if existing:
                print(f"exists:   {spec['email']} ({spec['role']})")
                continue
            db.add(
                DevUser(
                    email=spec["email"],
                    password_hash=hash_password(DEV_PASSWORD),
                    full_name=spec["full_name"],
                    role=spec["role"],
                )
            )
            print(f"created:  {spec['email']} ({spec['role']})")
        db.commit()
    print(f"\nDev password for all users: {DEV_PASSWORD}")
    print("Dev login page: http://localhost:3000/login-dev")


if __name__ == "__main__":
    main()
