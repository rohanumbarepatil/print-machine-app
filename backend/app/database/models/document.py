from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import BigInteger, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("print_sessions.id"),
        nullable=False,
    )

    original_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    stored_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    file_path: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
    )

    file_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    page_count: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="uploaded",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
