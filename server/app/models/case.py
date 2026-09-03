from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    seq: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    source: Mapped[str] = mapped_column(String(20))  # COMPLAINT | PREFECT_WARNING | SPOT_CHECK
    status: Mapped[str] = mapped_column(String(30), index=True)
    student_source_id: Mapped[int] = mapped_column(Integer, index=True)
    student_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    reporter_sub: Mapped[str] = mapped_column(String(255), index=True)
    reporter_name: Mapped[str] = mapped_column(String(255))
    reporter_role: Mapped[str] = mapped_column(String(30))
    points: Mapped[int] = mapped_column(Integer, default=0)
    details: Mapped[str] = mapped_column(Text, default="")
    warning_level: Mapped[str] = mapped_column(String(10), default="Pertama")
    meeting: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    offences: Mapped[list["CaseOffence"]] = relationship(
        back_populates="case", cascade="all, delete-orphan"
    )
    events: Mapped[list["CaseEvent"]] = relationship(
        back_populates="case", cascade="all, delete-orphan", order_by="CaseEvent.ts"
    )
    b02_forms: Mapped[list["B02Form"]] = relationship(
        back_populates="case", cascade="all, delete-orphan", order_by="B02Form.filled_at"
    )
    docs: Mapped[list["CaseDoc"]] = relationship(
        back_populates="case", cascade="all, delete-orphan"
    )


class CaseOffence(Base):
    __tablename__ = "case_offences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(10))
    name: Mapped[str] = mapped_column(String(255))
    points: Mapped[int] = mapped_column(Integer)

    case: Mapped[Case] = relationship(back_populates="offences")


class CaseEvent(Base):
    __tablename__ = "case_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    text: Mapped[str] = mapped_column(Text)
    by_name: Mapped[str] = mapped_column(String(255), default="")
    by_role: Mapped[str] = mapped_column(String(30), default="")

    case: Mapped[Case] = relationship(back_populates="events")


class B02Form(Base):
    __tablename__ = "b02_forms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    fill_by: Mapped[str] = mapped_column(String(255))
    fill_role: Mapped[str] = mapped_column(String(30))
    filled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    fields: Mapped[dict] = mapped_column(JSON, default=dict)

    case: Mapped[Case] = relationship(back_populates="b02_forms")


class CaseDoc(Base):
    __tablename__ = "case_docs"
    __table_args__ = (UniqueConstraint("case_id", "doc_code", name="uq_case_docs"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    doc_code: Mapped[str] = mapped_column(String(10))  # b01 | b03 | b05 | b06 | b07 | b08
    data: Mapped[dict] = mapped_column(JSON, default=dict)

    case: Mapped[Case] = relationship(back_populates="docs")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    recipient_sub: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    recipient_role: Mapped[str | None] = mapped_column(String(30), nullable=True, index=True)
    ntype: Mapped[str] = mapped_column(String(30))
    case_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    text: Mapped[str] = mapped_column(Text)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)