from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class Principal(BaseModel):
    auth_type: str  # "staff" | "pengawas"
    sub: str
    name: str
    email: str = ""
    roles: list[str] = Field(default_factory=list)


class PengawasLoginIn(BaseModel):
    email: EmailStr
    password: str


class PengawasAccountCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=8)


class ResetPasswordIn(BaseModel):
    new_password: str = Field(min_length=8)


class LockPengawasIn(BaseModel):
    locked: bool = True


class PengawasAccountOut(BaseModel):
    id: int
    email: str
    full_name: str
    active: bool
    locked_until: datetime | None = None
    failed_attempts: int
