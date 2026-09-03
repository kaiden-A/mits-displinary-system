from datetime import datetime

from sqlalchemy import DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class StudentCache(Base):
    __tablename__ = "students_cache"
    __table_args__ = (UniqueConstraint("source_id", name="uq_students_source_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_id: Mapped[int] = mapped_column(Integer, index=True)
    ic_number: Mapped[str] = mapped_column(String(15))
    name: Mapped[str] = mapped_column(String(255), index=True)
    gender: Mapped[str] = mapped_column(String(10))
    tingkatan: Mapped[int] = mapped_column(Integer)
    kelas: Mapped[str] = mapped_column(String(50))
    birth_year: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)