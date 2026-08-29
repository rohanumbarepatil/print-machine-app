from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class PrinterAgent(Base):
    __tablename__ = "printer_agents"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    printer_id: Mapped[UUID] = mapped_column(
        ForeignKey("printers.id"),
        nullable=False,
    )

    agent_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    machine_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
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

    last_heartbeat_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
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
