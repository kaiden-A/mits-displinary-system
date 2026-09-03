from pydantic import BaseModel

from .cases import CaseOut


class OffenceOut(BaseModel):
    code: str
    name: str
    min_points: int
    max_points: int
    action: str = ""


class LadderTierOut(BaseModel):
    tier: int
    up_to: int
    label: str
    steps: list[str]


class StudentOut(BaseModel):
    id: int
    ic_number: str
    name: str
    gender: str
    tingkatan: int
    kelas: str
    birth_year: int
    year: int


class StudentListOut(BaseModel):
    total: int
    items: list[StudentOut]


class StudentSummaryOut(BaseModel):
    student: StudentOut
    cases: list[CaseOut]
    recorded_cases: list[CaseOut]
    historical_points: int
