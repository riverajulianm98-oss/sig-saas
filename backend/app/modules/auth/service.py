"""Authentication use cases."""

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import create_access_token, hash_password, verify_password
from app.domain.auth.enums import UserRole
from app.infrastructure.models.tenant import Tenant
from app.infrastructure.models.user import User
from app.modules.auth.schemas import LoginRequest, RegisterRequest, RegisterResponse
from app.modules.auth.schemas import TenantResponse, TokenResponse, UserResponse
from app.utils.slug import unique_slug


class AuthService:
    def __init__(self, db: Session, settings: Settings) -> None:
        self._db = db
        self._settings = settings

    def register(self, payload: RegisterRequest) -> RegisterResponse:
        email = payload.admin.email.lower()
        if self._db.scalar(select(User.id).where(User.email == email)):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered.",
            )

        existing_slugs = {
            row[0]
            for row in self._db.execute(select(Tenant.slug)).all()
        }
        slug = unique_slug(payload.tenant.company_name, existing_slugs)

        tenant = Tenant(
            name=payload.tenant.company_name,
            slug=slug,
            legal_name=payload.tenant.legal_name,
            tax_id=payload.tenant.tax_id,
            plan=payload.tenant.plan,
            is_active=True,
        )
        self._db.add(tenant)
        self._db.flush()

        user = User(
            tenant_id=tenant.id,
            email=payload.admin.email.lower(),
            hashed_password=hash_password(payload.admin.password),
            full_name=payload.admin.full_name,
            role=UserRole.ADMIN_EMPRESA.value,
            is_active=True,
        )
        self._db.add(user)
        self._db.commit()
        self._db.refresh(tenant)
        self._db.refresh(user)

        token = self._build_token(user)
        return RegisterResponse(
            tenant=TenantResponse.model_validate(tenant),
            user=UserResponse.model_validate(user),
            token=token,
        )

    def login(self, payload: LoginRequest) -> TokenResponse:
        stmt = select(User).where(
            User.email == payload.email.lower(),
            User.deleted_at.is_(None),
            User.is_active.is_(True),
        )
        if payload.tenant_id:
            stmt = stmt.where(User.tenant_id == payload.tenant_id)

        users = list(self._db.scalars(stmt).all())

        if not users:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if len(users) > 1 and payload.tenant_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Multiple accounts found. Provide tenant_id.",
            )

        user = users[0]
        if not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        tenant = self._db.get(Tenant, user.tenant_id)
        if tenant is None or not tenant.is_active or tenant.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tenant is inactive.",
            )

        user.last_login_at = datetime.now(UTC)
        self._db.commit()
        self._db.refresh(user)

        return self._build_token(user)

    def get_user_by_id(self, user_id: uuid.UUID) -> User | None:
        return self._db.get(User, user_id)

    def _build_token(self, user: User) -> TokenResponse:
        access_token = create_access_token(
            subject=user.id,
            tenant_id=user.tenant_id,
            role=user.role,
            settings=self._settings,
        )
        return TokenResponse(
            access_token=access_token,
            expires_in=self._settings.access_token_expire_minutes * 60,
            tenant_id=user.tenant_id,
        )
