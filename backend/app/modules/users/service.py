"""User management use cases (tenant-scoped)."""

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.domain.auth.enums import UserRole
from app.domain.auth.rbac import can_assign_role, can_manage_users, parse_role
from app.domain.tenancy.context import require_current_tenant_id
from app.infrastructure.models.user import User
from app.modules.auth.schemas import UserResponse
from app.modules.users.schemas import (
    UserCreateRequest,
    UserDetailResponse,
    UserListResponse,
    UserUpdateRequest,
)


class UserService:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_users(self, *, skip: int = 0, limit: int = 20) -> UserListResponse:
        tenant_id = require_current_tenant_id()
        filters = (User.tenant_id == tenant_id, User.deleted_at.is_(None))
        total = self._db.scalar(select(func.count(User.id)).where(*filters)) or 0
        users = self._db.scalars(
            select(User)
            .where(*filters)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return UserListResponse(
            items=[UserResponse.model_validate(u) for u in users],
            total=total,
            skip=skip,
            limit=limit,
        )

    def get_user(self, user_id: uuid.UUID, *, actor: User) -> UserDetailResponse:
        user = self._get_tenant_user(user_id)
        self._ensure_can_view(actor, user)
        return UserDetailResponse.model_validate(user)

    def create_user(self, payload: UserCreateRequest, *, actor: User) -> UserDetailResponse:
        if not can_manage_users(actor.role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")
        if actor.role != UserRole.ADMIN_EMPRESA.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only company admins can create users.",
            )
        if not can_assign_role(actor.role, payload.role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot assign this role.",
            )

        tenant_id = require_current_tenant_id()
        email = payload.email.lower()
        exists = self._db.scalar(
            select(User.id).where(
                User.tenant_id == tenant_id,
                User.email == email,
                User.deleted_at.is_(None),
            )
        )
        if exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists in this company.",
            )

        user = User(
            tenant_id=tenant_id,
            email=email,
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
            role=payload.role.value,
            is_active=True,
            created_by_id=actor.id,
        )
        self._db.add(user)
        self._db.commit()
        self._db.refresh(user)
        return UserDetailResponse.model_validate(user)

    def update_user(
        self,
        user_id: uuid.UUID,
        payload: UserUpdateRequest,
        *,
        actor: User,
    ) -> UserDetailResponse:
        if not can_manage_users(actor.role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

        user = self._get_tenant_user(user_id)
        self._ensure_can_modify(actor, user)

        if payload.role is not None:
            if not can_assign_role(actor.role, payload.role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You cannot assign this role.",
                )
            user.role = payload.role.value

        if payload.full_name is not None:
            user.full_name = payload.full_name
        if payload.is_active is not None:
            if user.id == actor.id and not payload.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You cannot deactivate your own account.",
                )
            user.is_active = payload.is_active
        if payload.password is not None:
            user.hashed_password = hash_password(payload.password)

        user.updated_by_id = actor.id
        self._db.commit()
        self._db.refresh(user)
        return UserDetailResponse.model_validate(user)

    def deactivate_user(self, user_id: uuid.UUID, *, actor: User) -> None:
        if parse_role(actor.role) != UserRole.ADMIN_EMPRESA:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only company admins can deactivate users.",
            )
        user = self._get_tenant_user(user_id)
        if user.id == actor.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account.",
            )
        user.is_active = False
        user.deleted_at = datetime.now(UTC)
        user.updated_by_id = actor.id
        self._db.commit()

    def _get_tenant_user(self, user_id: uuid.UUID) -> User:
        tenant_id = require_current_tenant_id()
        user = self._db.get(User, user_id)
        if user is None or user.tenant_id != tenant_id or user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return user

    def _ensure_can_view(self, actor: User, target: User) -> None:
        if actor.id == target.id:
            return
        if can_manage_users(actor.role):
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    def _ensure_can_modify(self, actor: User, target: User) -> None:
        actor_role = parse_role(actor.role)
        target_role = parse_role(target.role)

        if actor.id == target.id:
            if actor_role != UserRole.ADMIN_EMPRESA:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update your own profile via /auth/me soon.",
                )
            return

        if actor_role == UserRole.ADMIN_EMPRESA:
            return

        if actor_role == UserRole.COORDINADOR_SIG:
            if target_role == UserRole.ADMIN_EMPRESA:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot modify company admin accounts.",
                )
            return

        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")
