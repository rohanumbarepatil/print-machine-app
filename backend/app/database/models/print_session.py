from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class PrintSession(Base):
    __tablename__ = "print_sessions"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    printer_id: Mapped[UUID] = mapped_column(
        ForeignKey("printers.id"),
        nullable=False,
    )

    session_token: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="active",
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
