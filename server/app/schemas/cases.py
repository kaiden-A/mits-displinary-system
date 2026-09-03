from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class OffenceIn(BaseModel):
    code: str
    name: str
    points: int


class CaseCreate(BaseModel):
    source: str = Field(pattern="^(COMPLAINT|PREFECT_WARNING|SPOT_CHECK)$")
    student_source_id: int
    offences: list[OffenceIn] = Field(min_length=1)
    details: str = ""
    docs: dict[str, Any] = Field(default_factory=dict)
    # These named fields make document payloads convenient for clients while
    # retaining the existing docs mapping used by stored cases.
    b01: dict[str, Any] | None = None
    b03: dict[str, Any] | None = None
    b05: dict[str, Any] | None = None
    b06: dict[str, Any] | None = None
    b07: dict[str, Any] | None = None
    b08: dict[str, Any] | None = None
    reporter_name_override: str | None = None  # pengawas enters the reporting name manually


class B02In(BaseModel):
    fields: dict[str, Any] = Field(default_factory=dict)


class TransitionIn(BaseModel):
    action: str


class MeetingPatch(BaseModel):
    meeting: dict[str, Any] = Field(default_factory=dict)


class DocPatch(BaseModel):
    doc_code: str = Field(pattern="^(b01|b03|b05|b06|b07|b08)$")
    data: dict[str, Any] = Field(default_factory=dict)


class CaseDocOut(BaseModel):
    doc_code: str
    data: dict[str, Any] | None = Field(default_factory=dict)


class B02Out(BaseModel):
    id: int
    fill_by: str
    fill_role: str
    filled_at: datetime
    fields: dict[str, Any] = Field(default_factory=dict)


class CaseEventOut(BaseModel):
    ts: datetime
    text: str
    by_name: str
    by_role: str


class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seq: int
    source: str
    status: str
    student_source_id: int
    student_snapshot: dict[str, Any] = Field(default_factory=dict)
    reporter_name: str
    reporter_role: str
    points: int
    details: str
    warning_level: str
    meeting: dict | None
    created_at: datetime
    updated_at: datetime
    offences: list[OffenceIn] = Field(default_factory=list)
    tier: int = 0
    tier_label: str = ""
    counselling: list[dict[str, Any]] = Field(default_factory=list)
    punishment: dict[str, Any] | None = None


class CaseDetailOut(CaseOut):
    offences: list[OffenceIn]
    events: list[CaseEventOut]
    b02_forms: list[B02Out]
    docs: list[CaseDocOut]
    b01: dict[str, Any] | None = None
    b03: dict[str, Any] | None = None
    b05: dict[str, Any] | None = None
    b06: dict[str, Any] | None = None
    b07: dict[str, Any] | None = None
    b08: dict[str, Any] | None = None
