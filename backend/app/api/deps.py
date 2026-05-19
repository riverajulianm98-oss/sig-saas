"""Shared FastAPI dependencies."""

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.domain.tenancy.context import get_current_tenant_id, set_current_tenant_id
from app.infrastructure.models.user import User
from app.modules.auth.service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_auth_service(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> AuthService:
    return AuthService(db, settings)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    payload = decode_access_token(token, settings)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(payload["sub"])
        tenant_id = uuid.UUID(payload["tenant_id"])
    except (KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        ) from exc

    # Align request tenant context with JWT when header is absent
    if get_current_tenant_id() is None:
        set_current_tenant_id(tenant_id)
    elif get_current_tenant_id() != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant header does not match token.",
        )

    user = db.get(User, user_id)
    if (
        user is None
        or user.tenant_id != tenant_id
        or not user.is_active
        or user.deleted_at is not None
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    return user


def require_tenant_id(
    settings: Settings = Depends(get_settings),
) -> uuid.UUID:
    """Dependency for routes that require an active tenant context."""
    tenant_id = get_current_tenant_id()
    if tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing or invalid tenant header: {settings.tenant_header}",
        )
    return tenant_id
