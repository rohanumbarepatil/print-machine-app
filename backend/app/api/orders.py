from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models.document import Document
from app.database.models.print_option import PrintOption
from app.database.models.print_order import PrintOrder
from app.database.models.print_session import PrintSession
from app.schemas.order import PrintOrderCreate, PrintOrderResponse


router = APIRouter(
    prefix="/orders",
    tags=["Print Orders"],
)


def generate_order_number(db: Session) -> str:
    last_order = db.scalar(
        select(PrintOrder)
        .order_by(PrintOrder.created_at.desc())
        .limit(1)
    )

    if last_order is None:
        number = 1
    else:
        try:
            number = int(last_order.order_number.replace("PM-", "")) + 1
        except ValueError:
            number = 1

    return f"PM-{number:06d}"


@router.post(
    "",
    response_model=PrintOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_print_order(
    payload: PrintOrderCreate,
    db: Session = Depends(get_db),
):
    session = db.scalar(
        select(PrintSession).where(
            PrintSession.id == payload.session_id,
            PrintSession.status == "active",
        )
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active print session not found",
        )

    document = db.scalar(
        select(Document).where(
            Document.id == payload.document_id,
            Document.session_id == payload.session_id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found for this print session",
        )

    if document.status != "uploaded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document is not available for printing",
        )

    if payload.color_mode not in {"black_white", "color"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid color_mode",
        )

    if payload.paper_size not in {"A4", "A3", "A5"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid paper_size",
        )

    if payload.orientation not in {"portrait", "landscape"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid orientation",
        )

    if payload.paper_type not in {"plain", "glossy"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid paper_type",
        )

    if payload.scaling not in {"fit", "actual"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scaling",
        )

    order = PrintOrder(
        session_id=session.id,
        document_id=document.id,
        order_number=generate_order_number(db),
        copies=payload.copies,
        color_mode=payload.color_mode,
        paper_size=payload.paper_size,
        orientation=payload.orientation,
        duplex=payload.duplex,
        total_amount=Decimal("0.00"),
        status="payment_pending",
    )

    db.add(order)
    db.flush()

    options = PrintOption(
        order_id=order.id,
        color_mode=payload.color_mode,
        paper_size=payload.paper_size,
        paper_type=payload.paper_type,
        orientation=payload.orientation,
        scaling=payload.scaling,
        collation=payload.collation,
        photo_collage=payload.photo_collage,
        copies=payload.copies,
    )

    db.add(options)

    db.commit()
    db.refresh(order)

    return PrintOrderResponse(
        id=order.id,
        session_id=order.session_id,
        document_id=order.document_id,
        order_number=order.order_number,
        copies=order.copies,
        color_mode=order.color_mode,
        paper_size=order.paper_size,
        orientation=order.orientation,
        duplex=order.duplex,
        total_amount=order.total_amount,
        status=order.status,
        paper_type=options.paper_type,
        scaling=options.scaling,
        collation=options.collation,
        photo_collage=options.photo_collage,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )