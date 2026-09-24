from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class PrintOption(Base):
    __tablename__ = "print_options"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    order_id: Mapped[UUID] = mapped_column(
        ForeignKey("print_orders.id"),
        nullable=False,
        unique=True,
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

    paper_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="plain",
    )

    orientation: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="portrait",
    )

    scaling: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="fit",
    )

    collation: Mapped[bool] = mapped_column("collation_enabled",
        Boolean,
        nullable=False,
        default=False,
    )

    photo_collage: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    copies: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
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
