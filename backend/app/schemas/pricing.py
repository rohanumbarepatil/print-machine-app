from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class PricingRuleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color_mode: str
    paper_size: str
    paper_type: str
    duplex: bool = False
    price_per_page: Decimal = Field(gt=0)
    is_active: bool = True


class PricingRuleResponse(BaseModel):
    id: UUID
    name: str
    color_mode: str
    paper_size: str
    paper_type: str
    duplex: bool
    price_per_page: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime
class PricingCalculationResponse(BaseModel):
    order_id: UUID
    order_number: str
    page_count: int
    copies: int
    price_per_page: Decimal
    total_amount: Decimal