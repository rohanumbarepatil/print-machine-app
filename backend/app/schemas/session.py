from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PrintSessionCreate(BaseModel):
    printer_id: UUID


class PrintSessionResponse(BaseModel):
    id: UUID
    printer_id: UUID
    session_token: str
    status: str
    expires_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)