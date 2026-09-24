from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class CreatePaymentRequest(BaseModel):
    order_id: UUID


class PaymentResponse(BaseModel):
    id: UUID
    order_id: UUID
    provider: str
    provider_order_id: str | None
    provider_payment_id: str | None
    amount: Decimal
    currency: str
    status: str
    created_at: datetime
    updated_at: datetime


class PaymentVerifyRequest(BaseModel):
    payment_id: UUID
    provider_payment_id: str = Field(min_length=1)
    razorpay_signature: str = Field(min_length=1)