from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class StaffUser(Base):
    """Local shadow profile for Zitadel staff, keyed by the Zitadel `sub`.

    Roles stay in the Zitadel token — this table holds profile data only,
    synced from the validated access token on each login.
    """

    __tablename__ = "staff_users"

    sub: Mapped[str] = mapped_column(String(255), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), default="")
    full_name: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )