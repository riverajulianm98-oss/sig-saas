"""Object storage abstraction (S3-compatible + local)."""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class StoredObject:
    storage_key: str
    size: int
    mime_type: str


class StorageProvider(Protocol):
    def put_object(
        self,
        *,
        storage_key: str,
        data: bytes,
        mime_type: str,
    ) -> StoredObject: ...

    def delete_object(self, *, storage_key: str) -> None: ...

    def generate_download_url(
        self,
        *,
        storage_key: str,
        file_name: str,
        expires_seconds: int,
    ) -> str: ...

    def object_exists(self, *, storage_key: str) -> bool: ...
