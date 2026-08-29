from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class PrintOrder(Base):
    __tablename__ = "print_orders"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("print_sessions.id"),
        nullable=False,
    )

    document_id: Mapped[UUID] = mapped_column(
        ForeignKey("documents.id"),
        nullable=False,
    )

    order_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )

    copies: Mapped[int] = mapped_column(
        nullable=False,
        default=1,
    )

    color_mode: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="black_white",
    )

    paper_size: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="A4",
    )

    orientation: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="portrait",
    )

    duplex: Mapped[bool] = mapped_column(
        nullable=False,
        default=False,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="payment_pending",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
