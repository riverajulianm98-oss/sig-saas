"""Centralized application configuration."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.domain.documents.files import DEFAULT_ALLOWED_MIME_TYPES


class Settings(BaseSettings):
    """Environment-driven settings (12-factor)."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = Field(default="SIG SaaS API", alias="APP_NAME")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    environment: Literal["development", "staging", "production"] = Field(
        default="development",
        alias="ENVIRONMENT",
    )
    debug: bool = Field(default=False, alias="DEBUG")

    # API
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    cors_origins: list[str] = Field(
        default=["http://localhost:3000"],
        alias="CORS_ORIGINS",
    )

    # Database
    database_url: str = Field(
        default="postgresql+psycopg2://sig_user:sig_password@localhost:5432/sig_saas",
        alias="DATABASE_URL",
    )
    db_pool_size: int = Field(default=5, ge=1, alias="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=10, ge=0, alias="DB_MAX_OVERFLOW")
    db_echo: bool = Field(default=False, alias="DB_ECHO")

    # Multi-tenant
    tenant_header: str = Field(default="X-Tenant-ID", alias="TENANT_HEADER")
    tenant_required: bool = Field(default=False, alias="TENANT_REQUIRED")

    # JWT / Auth
    jwt_secret_key: str = Field(
        default="change-me-in-production-use-openssl-rand-hex-32",
        alias="JWT_SECRET_KEY",
    )
    access_token_expire_minutes: int = Field(
        default=60,
        ge=5,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )
    refresh_token_expire_days: int = Field(
        default=7,
        ge=1,
        alias="REFRESH_TOKEN_EXPIRE_DAYS",
    )

    # Object storage (local | s3 | minio | r2)
    storage_provider: str = Field(default="local", alias="STORAGE_PROVIDER")
    storage_local_path: str = Field(default="./storage", alias="STORAGE_LOCAL_PATH")
    storage_public_base_url: str = Field(
        default="http://localhost:8000",
        alias="STORAGE_PUBLIC_BASE_URL",
    )
    storage_bucket: str = Field(default="", alias="STORAGE_BUCKET")
    storage_region: str = Field(default="us-east-1", alias="STORAGE_REGION")
    storage_endpoint_url: str | None = Field(default=None, alias="STORAGE_ENDPOINT_URL")
    storage_access_key: str = Field(default="", alias="STORAGE_ACCESS_KEY")
    storage_secret_key: str = Field(default="", alias="STORAGE_SECRET_KEY")
    storage_signed_url_expire_seconds: int = Field(
        default=3600,
        ge=60,
        alias="STORAGE_SIGNED_URL_EXPIRE_SECONDS",
    )
    max_upload_size_mb: int = Field(default=50, ge=1, le=500, alias="MAX_UPLOAD_SIZE_MB")
    allowed_upload_mime_types: frozenset[str] = Field(
        default=DEFAULT_ALLOWED_MIME_TYPES,
        alias="ALLOWED_UPLOAD_MIME_TYPES",
    )

    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    @field_validator("allowed_upload_mime_types", mode="before")
    @classmethod
    def parse_mime_types(cls, value: str | frozenset[str] | list[str]) -> frozenset[str]:
        if isinstance(value, str):
            return frozenset(m.strip() for m in value.split(",") if m.strip())
        if isinstance(value, list):
            return frozenset(value)
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            # Supports comma-separated or JSON-like list in .env
            stripped = value.strip()
            if stripped.startswith("["):
                import json

                return json.loads(stripped)
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def database_url_str(self) -> str:
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton for dependency injection."""
    return Settings()
