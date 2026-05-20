"""Authentication HTTP routes."""

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import get_auth_service, get_current_user
from app.infrastructure.models.user import User
from app.modules.auth.schemas import (
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenPairResponse,
    UserResponse,
)
from app.modules.auth.service import AuthService
from app.schemas.common import APIMessage

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register company and admin user",
)
def register(
    payload: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> RegisterResponse:
    return auth_service.register(payload)


@router.post("/login", response_model=TokenPairResponse, summary="Login")
def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenPairResponse:
    return auth_service.login(payload)


@router.post("/refresh", response_model=TokenPairResponse, summary="Refresh tokens")
def refresh_tokens(
    payload: RefreshRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenPairResponse:
    return auth_service.refresh(payload.refresh_token)


@router.post("/logout", response_model=APIMessage, summary="Revoke refresh token")
def logout(
    payload: LogoutRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> APIMessage:
    auth_service.logout(payload.refresh_token)
    return APIMessage(message="Logged out successfully.")


@router.post(
    "/token",
    response_model=TokenPairResponse,
    include_in_schema=False,
    summary="OAuth2 password flow (Swagger)",
)
def login_oauth2(
    form: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenPairResponse:
    return auth_service.login(
        LoginRequest(email=form.username, password=form.password),
    )


@router.get("/me", response_model=UserResponse, summary="Current user profile")
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
