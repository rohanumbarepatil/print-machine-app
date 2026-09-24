from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: UUID
    session_id: UUID
    original_name: str
    stored_name: str
    file_type: str
    file_size: int
    page_count: int | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)