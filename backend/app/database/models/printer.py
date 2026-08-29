from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Printer(Base):
    __tablename__ = "printers"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    system_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    connection_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="windows",
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="offline",
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
