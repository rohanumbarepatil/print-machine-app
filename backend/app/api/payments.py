from decimal import Decimal
import json

import razorpay
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.database import get_db
from app.database.models.payment import Payment
from app.database.models.payment_event import PaymentEvent
from app.database.models.print_order import PrintOrder
from app.schemas.payment import (
    CreatePaymentRequest,
    PaymentResponse,
    PaymentVerifyRequest,
)


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


def get_razorpay_client():
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay credentials are not configured",
        )

    return razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET,
        )
    )


def build_payment_response(payment: Payment) -> PaymentResponse:
    return PaymentResponse(
        id=payment.id,
        order_id=payment.order_id,
        provider=payment.provider,
        provider_order_id=payment.provider_order_id,
        provider_payment_id=payment.provider_payment_id,
        amount=payment.amount,
        currency=payment.currency,
        status=payment.status,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )


@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    payload: CreatePaymentRequest,
    db: Session = Depends(get_db),
):
    order = db.scalar(
        select(PrintOrder).where(PrintOrder.id == payload.order_id)
    )

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Print order not found",
        )

    if order.status != "payment_pending":
        raise HTTPException(
            status_code=400,
            detail=f"Order is not available for payment. Current status: {order.status}",
        )

    if order.total_amount <= Decimal("0.00"):
        raise HTTPException(
            status_code=400,
            detail="Order total amount must be greater than zero",
        )

    existing_payment = db.scalar(
        select(Payment).where(Payment.order_id == order.id)
    )

    razorpay_client = get_razorpay_client()

    if existing_payment is not None:
        if existing_payment.provider_order_id:
            return build_payment_response(existing_payment)

        payment = existing_payment

    else:
        payment = Payment(
            order_id=order.id,
            provider="razorpay",
            amount=order.total_amount,
            currency="INR",
            status="created",
        )

        db.add(payment)
        db.flush()

    amount_paise = int(
        (order.total_amount * Decimal("100")).quantize(Decimal("1"))
    )

    razorpay_order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": order.order_number,
        "payment_capture": 1,
    }

    try:
        razorpay_order = razorpay_client.order.create(
            data=razorpay_order_data
        )
    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=502,
            detail=f"Razorpay order creation failed: {str(exc)}",
        )

    payment.provider_order_id = razorpay_order["id"]
    payment.status = "created"

    db.commit()
    db.refresh(payment)

    return build_payment_response(payment)


@router.post(
    "/verify",
    response_model=PaymentResponse,
    status_code=status.HTTP_200_OK,
)
def verify_payment(
    payload: PaymentVerifyRequest,
    db: Session = Depends(get_db),
):
    payment = db.scalar(
        select(Payment).where(Payment.id == payload.payment_id)
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found",
        )

    if payment.provider != "razorpay":
        raise HTTPException(
            status_code=400,
            detail="Unsupported payment provider",
        )

    if not payment.provider_order_id:
        raise HTTPException(
            status_code=400,
            detail="Razorpay order has not been created",
        )

    # Idempotency:
    # If this payment was already verified successfully,
    # return the existing paid payment.
    if payment.status == "paid":
        return build_payment_response(payment)

    razorpay_client = get_razorpay_client()

    verification_data = {
        "razorpay_order_id": payment.provider_order_id,
        "razorpay_payment_id": payload.provider_payment_id,
        "razorpay_signature": payload.razorpay_signature,
    }

    try:
        razorpay_client.utility.verify_payment_signature(
            verification_data
        )
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay payment signature",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Razorpay payment verification failed: {str(exc)}",
        )

    # Save verified payment information.
    payment.provider_payment_id = payload.provider_payment_id
    payment.status = "paid"

    # Update associated print order.
    order = db.scalar(
        select(PrintOrder).where(PrintOrder.id == payment.order_id)
    )

    if order is None:
        db.rollback()
        raise HTTPException(
            status_code=404,
            detail="Associated print order not found",
        )

    order.status = "paid"

    # Create an audit event only once.
    existing_event = db.scalar(
        select(PaymentEvent).where(
            PaymentEvent.payment_id == payment.id,
            PaymentEvent.event_type == "payment_verified",
        )
    )

    if existing_event is None:
        payment_event = PaymentEvent(
            payment_id=payment.id,
            event_type="payment_verified",
            provider_event_id=None,
            payload=json.dumps(
                {
                    "razorpay_order_id": payment.provider_order_id,
                    "razorpay_payment_id": payload.provider_payment_id,
                    "payment_status": "paid",
                }
            ),
        )

        db.add(payment_event)

    db.commit()
    db.refresh(payment)

    return build_payment_response(payment)