from datetime import datetime, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models.admin import Admin
from app.schemas.auth import AdminLoginRequest, AdminResponse, TokenResponse
from app.services.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

bearer_scheme = HTTPBearer()


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: AdminLoginRequest,
    db: Session = Depends(get_db),
):
    admin = db.scalar(
        select(Admin).where(Admin.email == payload.email)
    )

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive",
        )

    if not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    admin.last_login_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()

    subject = str(admin.id)

    return TokenResponse(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
    )


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Admin:
    token = credentials.credentials

    try:
        payload = decode_token(token)
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token required",
        )

    subject = payload.get("sub")

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    try:
        admin_id = subject
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    admin = db.scalar(
        select(Admin).where(Admin.id == admin_id)
    )

    if admin is None or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account not available",
        )

    return admin


@router.get(
    "/me",
    response_model=AdminResponse,
)
def get_me(
    current_admin: Admin = Depends(get_current_admin),
):
    return AdminResponse(
        id=str(current_admin.id),
        email=current_admin.email,
        name=current_admin.name,
        is_active=current_admin.is_active,
    )
