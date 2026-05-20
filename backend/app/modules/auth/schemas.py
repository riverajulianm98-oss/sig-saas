"""Auth API schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.domain.auth.enums import UserRole


class TenantRegister(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    legal_name: str | None = Field(default=None, max_length=255)
    tax_id: str | None = Field(default=None, max_length=50)
    plan: str = Field(default="trial", max_length=50)


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)


class RegisterRequest(BaseModel):
    tenant: TenantRegister
    admin: UserRegister


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_id: uuid.UUID | None = Field(
        default=None,
        description="Required when the same email exists in multiple tenants.",
    )


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_expires_in: int
    tenant_id: uuid.UUID


# Backward-compatible alias
TokenResponse = TokenPairResponse


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    last_login_at: datetime | None


class TenantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    legal_name: str | None
    tax_id: str | None
    is_active: bool
    plan: str


class RegisterResponse(BaseModel):
    tenant: TenantResponse
    user: UserResponse
    token: TokenPairResponse
