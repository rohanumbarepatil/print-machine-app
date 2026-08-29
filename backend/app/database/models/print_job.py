from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class PrintJob(Base):
    __tablename__ = "print_jobs"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    order_id: Mapped[UUID] = mapped_column(
        ForeignKey("print_orders.id"),
        nullable=False,
    )

    printer_id: Mapped[UUID] = mapped_column(
        ForeignKey("printers.id"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="queued",
    )

    priority: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    attempts: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    error_message: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
