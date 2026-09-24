from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class PrintOrderCreate(BaseModel):
    session_id: UUID
    document_id: UUID

    copies: int = Field(default=1, ge=1, le=100)

    color_mode: str = "black_white"
    paper_size: str = "A4"
    orientation: str = "portrait"
    duplex: bool = False

    paper_type: str = "plain"
    scaling: str = "fit"
    collation: bool = False
    photo_collage: bool = False


class PrintOrderResponse(BaseModel):
    id: UUID
    session_id: UUID
    document_id: UUID
    order_number: str

    copies: int
    color_mode: str
    paper_size: str
    orientation: str
    duplex: bool

    total_amount: Decimal
    status: str

    paper_type: str
    scaling: str
    collation: bool
    photo_collage: bool

    created_at: datetime
    updated_at: datetime