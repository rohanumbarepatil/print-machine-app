from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_admin
from app.database.database import get_db
from app.database.models.admin import Admin
from app.database.models.pricing_rule import PricingRule
from app.schemas.pricing import PricingRuleCreate, PricingRuleResponse
from app.schemas.pricing import (
    PricingRuleCreate,
    PricingRuleResponse,
    PricingCalculationResponse,
)

router = APIRouter(
    prefix="/pricing-rules",
    tags=["Pricing Rules"],
)


@router.post(
    "",
    response_model=PricingRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_pricing_rule(
    payload: PricingRuleCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    existing_rule = db.scalar(
        select(PricingRule).where(
            PricingRule.is_active.is_(True),
            PricingRule.color_mode == payload.color_mode,
            PricingRule.paper_size == payload.paper_size,
            PricingRule.paper_type == payload.paper_type,
            PricingRule.duplex == payload.duplex,
        )
    )

    if existing_rule is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An active pricing rule already exists for this configuration",
        )

    rule = PricingRule(
        name=payload.name,
        color_mode=payload.color_mode,
        paper_size=payload.paper_size,
        paper_type=payload.paper_type,
        duplex=payload.duplex,
        price_per_page=payload.price_per_page,
        is_active=payload.is_active,
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule


@router.get(
    "",
    response_model=list[PricingRuleResponse],
)
def list_pricing_rules(
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(PricingRule).order_by(PricingRule.created_at.desc())
    ).all()

from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select

from app.database.models.document import Document
from app.database.models.print_option import PrintOption
from app.database.models.print_order import PrintOrder
from app.database.models.pricing_rule import PricingRule


@router.post(
    "/calculate/{order_id}",
    response_model=PricingCalculationResponse,
)
def calculate_order_price(
    order_id: UUID,
    db: Session = Depends(get_db),
):
    order = db.scalar(
        select(PrintOrder).where(PrintOrder.id == order_id)
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Print order not found",
        )

    document = db.scalar(
        select(Document).where(Document.id == order.document_id)
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    if document.page_count is None or document.page_count <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document page count is not available",
        )

    options = db.scalar(
        select(PrintOption).where(
            PrintOption.order_id == order.id
        )
    )

    if options is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Print options not found",
        )

    rule = db.scalar(
        select(PricingRule).where(
            PricingRule.is_active.is_(True),
            PricingRule.color_mode == options.color_mode,
            PricingRule.paper_size == options.paper_size,
            PricingRule.paper_type == options.paper_type,
            PricingRule.duplex == order.duplex,
        )
    )

    if rule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active pricing rule found for this print configuration",
        )

    total_amount = (
        Decimal(document.page_count)
        * Decimal(options.copies)
        * rule.price_per_page
    )

    order.total_amount = total_amount
    db.commit()
    db.refresh(order)

    return PricingCalculationResponse(
        order_id=order.id,
        order_number=order.order_number,
        page_count=document.page_count,
        copies=options.copies,
        price_per_page=rule.price_per_page,
        total_amount=total_amount,
    )