from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

import fitz
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models.document import Document
from app.database.models.print_session import PrintSession
from app.schemas.document import DocumentResponse


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


UPLOAD_DIR = Path("storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".pdf",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    session_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    session = db.scalar(
        select(PrintSession).where(
            PrintSession.id == session_id,
            PrintSession.status == "active",
        )
    )

    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active print session not found",
        )

    original_name = file.filename or "unknown"

    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported currently",
        )

    file_data = await file.read()

    if not file_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 10 MB limit",
        )

    try:
        pdf = fitz.open(stream=file_data, filetype="pdf")
        page_count = pdf.page_count
        pdf.close()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or corrupted PDF file",
        )

    stored_name = f"{uuid4()}{extension}"
    file_path = UPLOAD_DIR / stored_name

    file_path.write_bytes(file_data)

    document = Document(
        session_id=session.id,
        original_name=original_name,
        stored_name=stored_name,
        file_path=str(file_path),
        file_type=file.content_type or "application/pdf",
        file_size=len(file_data),
        page_count=page_count,
        status="uploaded",
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document