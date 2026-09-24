from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class PricingRule(Base):
    __tablename__ = "pricing_rules"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    color_mode: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    paper_size: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    paper_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    duplex: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    price_per_page: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
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