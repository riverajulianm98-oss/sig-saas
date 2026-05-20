"""Storage provider factory."""

from app.core.config import Settings, get_settings
from app.infrastructure.storage.local import LocalStorageProvider
from app.infrastructure.storage.protocol import StorageProvider


def get_storage_provider(settings: Settings | None = None) -> StorageProvider:
    settings = settings or get_settings()
    provider = settings.storage_provider.lower()
    if provider == "local":
        return LocalStorageProvider(settings)
    if provider in {"s3", "minio", "r2"}:
        from app.infrastructure.storage.s3 import S3StorageProvider

        return S3StorageProvider(settings)
    raise ValueError(f"Unsupported storage provider: {provider}")
