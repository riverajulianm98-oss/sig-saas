"""Tenant user management routes."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.rbac import require_roles
from app.db.session import get_db
from app.domain.auth.enums import UserRole
from app.infrastructure.models.user import User
from app.modules.users.schemas import (
    UserCreateRequest,
    UserDetailResponse,
    UserListResponse,
    UserUpdateRequest,
)
from app.modules.users.service import UserService
from app.schemas.common import APIMessage

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.get(
    "",
    response_model=UserListResponse,
    summary="List users in current tenant",
)
def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    _: User = Depends(
        require_roles(UserRole.ADMIN_EMPRESA, UserRole.COORDINADOR_SIG)
    ),
    service: UserService = Depends(get_user_service),
) -> UserListResponse:
    return service.list_users(skip=skip, limit=limit)


@router.get(
    "/{user_id}",
    response_model=UserDetailResponse,
    summary="Get user by id",
)
def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse:
    return service.get_user(user_id, actor=current_user)


@router.post(
    "",
    response_model=UserDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create user in current tenant",
)
def create_user(
    payload: UserCreateRequest,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA)),
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse:
    return service.create_user(payload, actor=actor)


@router.patch(
    "/{user_id}",
    response_model=UserDetailResponse,
    summary="Update user",
)
def update_user(
    user_id: uuid.UUID,
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
) -> UserDetailResponse:
    return service.update_user(user_id, payload, actor=current_user)


@router.delete(
    "/{user_id}",
    response_model=APIMessage,
    summary="Deactivate user (soft delete)",
)
def deactivate_user(
    user_id: uuid.UUID,
    actor: User = Depends(require_roles(UserRole.ADMIN_EMPRESA)),
    service: UserService = Depends(get_user_service),
) -> APIMessage:
    service.deactivate_user(user_id, actor=actor)
    return APIMessage(message="User deactivated.")
