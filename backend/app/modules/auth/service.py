"""Authentication use cases."""

import uuid
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import (
    create_access_token,
    generate_refresh_token_value,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.domain.auth.enums import UserRole
from app.infrastructure.models.refresh_token import RefreshToken
from app.infrastructure.models.tenant import Tenant
from app.infrastructure.models.user import User
from app.modules.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TenantResponse,
    TokenPairResponse,
    UserResponse,
)
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
            row[0] for row in self._db.execute(select(Tenant.slug)).all()
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
            email=email,
            hashed_password=hash_password(payload.admin.password),
            full_name=payload.admin.full_name,
            role=UserRole.ADMIN_EMPRESA.value,
            is_active=True,
        )
        self._db.add(user)
        self._db.commit()
        self._db.refresh(tenant)
        self._db.refresh(user)

        token = self._issue_token_pair(user)
        return RegisterResponse(
            tenant=TenantResponse.model_validate(tenant),
            user=UserResponse.model_validate(user),
            token=token,
        )

    def login(self, payload: LoginRequest) -> TokenPairResponse:
        user = self._authenticate(payload.email, payload.password, payload.tenant_id)
        user.last_login_at = datetime.now(UTC)
        self._db.commit()
        self._db.refresh(user)
        return self._issue_token_pair(user)

    def refresh(self, raw_refresh_token: str) -> TokenPairResponse:
        token_hash = hash_refresh_token(raw_refresh_token)
        record = self._db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        now = datetime.now(UTC)

        if record is None or record.revoked_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)

        if expires_at < now:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token.",
            )

        user = self._db.get(User, record.user_id)
        if user is None or not user.is_active or user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive.",
            )

        record.revoked_at = now
        self._db.commit()
        return self._issue_token_pair(user)

    def logout(self, raw_refresh_token: str) -> None:
        token_hash = hash_refresh_token(raw_refresh_token)
        record = self._db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        if record and record.revoked_at is None:
            record.revoked_at = datetime.now(UTC)
            self._db.commit()

    def get_user_by_id(self, user_id: uuid.UUID) -> User | None:
        return self._db.get(User, user_id)

    def _authenticate(
        self,
        email: str,
        password: str,
        tenant_id: uuid.UUID | None,
    ) -> User:
        stmt = select(User).where(
            User.email == email.lower(),
            User.deleted_at.is_(None),
            User.is_active.is_(True),
        )
        if tenant_id:
            stmt = stmt.where(User.tenant_id == tenant_id)

        users = list(self._db.scalars(stmt).all())

        if not users:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if len(users) > 1 and tenant_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Multiple accounts found. Provide tenant_id.",
            )

        user = users[0]
        if not verify_password(password, user.hashed_password):
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
        return user

    def _issue_token_pair(self, user: User) -> TokenPairResponse:
        access_token = create_access_token(
            subject=user.id,
            tenant_id=user.tenant_id,
            role=user.role,
            settings=self._settings,
        )
        raw_refresh = generate_refresh_token_value()
        expires_at = datetime.now(UTC) + timedelta(
            days=self._settings.refresh_token_expire_days
        )
        self._db.add(
            RefreshToken(
                user_id=user.id,
                token_hash=hash_refresh_token(raw_refresh),
                expires_at=expires_at,
            )
        )
        self._db.commit()

        return TokenPairResponse(
            access_token=access_token,
            refresh_token=raw_refresh,
            expires_in=self._settings.access_token_expire_minutes * 60,
            refresh_expires_in=self._settings.refresh_token_expire_days * 86400,
            tenant_id=user.tenant_id,
        )
