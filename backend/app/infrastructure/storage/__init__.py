from app.infrastructure.storage.factory import get_storage_provider
from app.infrastructure.storage.protocol import StorageProvider, StoredObject

__all__ = ["StorageProvider", "StoredObject", "get_storage_provider"]
