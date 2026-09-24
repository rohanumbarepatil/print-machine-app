from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models.printer import Printer
from app.database.models.print_session import PrintSession
from app.schemas.session import PrintSessionCreate, PrintSessionResponse


router = APIRouter(
    prefix="/sessions",
    tags=["Print Sessions"],
)


@router.post(
    "",
    response_model=PrintSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_print_session(
    payload: PrintSessionCreate,
    db: Session = Depends(get_db),
):
    printer = db.scalar(
        select(Printer).where(
            Printer.id == payload.printer_id,
            Printer.is_active.is_(True),
        )
    )

    if printer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Printer not found or inactive",
        )

    session = PrintSession(
        printer_id=printer.id,
        session_token=secrets.token_urlsafe(32),
        status="active",
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None)
        + timedelta(minutes=30),
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session