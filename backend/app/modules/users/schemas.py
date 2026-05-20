"""User management API schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.domain.auth.enums import UserRole
from app.modules.auth.schemas import UserResponse


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)
    role: UserRole = UserRole.USUARIO


class UserUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserDetailResponse(UserResponse):
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[UserResponse]
    total: int
    skip: int
    limit: int
