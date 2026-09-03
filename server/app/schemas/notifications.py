from datetime import datetime

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    ntype: str
    case_id: int | None
    text: str
    read: bool
    created_at: datetime