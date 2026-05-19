"""Authentication HTTP routes."""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import get_auth_service, get_current_user
from app.infrastructure.models.user import User
from app.modules.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
)
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=201,
    summary="Register company and admin user",
)
def register(
    payload: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> RegisterResponse:
    return auth_service.register(payload)


@router.post("/login", response_model=TokenResponse, summary="Login")
def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return auth_service.login(payload)


@router.post(
    "/token",
    response_model=TokenResponse,
    include_in_schema=False,
    summary="OAuth2 password flow (Swagger)",
)
def login_oauth2(
    form: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return auth_service.login(
        LoginRequest(email=form.username, password=form.password),
    )


@router.get("/me", response_model=UserResponse, summary="Current user profile")
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
