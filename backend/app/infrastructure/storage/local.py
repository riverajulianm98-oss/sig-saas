"""Local filesystem storage provider."""

import secrets
from pathlib import Path
from urllib.parse import urlencode

from app.core.config import Settings
from app.infrastructure.storage.paths import sanitize_filename
from app.infrastructure.storage.protocol import StoredObject


class LocalStorageProvider:
    def __init__(self, settings: Settings) -> None:
        self._root = Path(settings.storage_local_path).resolve()
        self._root.mkdir(parents=True, exist_ok=True)
        self._public_base = settings.storage_public_base_url.rstrip("/")

    def _resolve_key(self, storage_key: str) -> Path:
        key = storage_key.replace("\\", "/").lstrip("/")
        if ".." in key.split("/"):
            raise ValueError("Invalid storage key.")
        target = (self._root / key).resolve()
        if not str(target).startswith(str(self._root)):
            raise ValueError("Path traversal detected.")
        return target

    def put_object(self, *, storage_key: str, data: bytes, mime_type: str) -> StoredObject:
        path = self._resolve_key(storage_key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return StoredObject(storage_key=storage_key, size=len(data), mime_type=mime_type)

    def delete_object(self, *, storage_key: str) -> None:
        path = self._resolve_key(storage_key)
        if path.exists():
            path.unlink()

    def generate_download_url(
        self,
        *,
        storage_key: str,
        file_name: str,
        expires_seconds: int,
    ) -> str:
        _ = expires_seconds
        safe_name = sanitize_filename(file_name)
        token = secrets.token_urlsafe(24)
        query = urlencode({"key": storage_key, "token": token, "name": safe_name})
        return f"{self._public_base}/api/v1/documents/storage/download?{query}"

    def object_exists(self, *, storage_key: str) -> bool:
        return self._resolve_key(storage_key).exists()

    def read_object(self, *, storage_key: str) -> tuple[bytes, str]:
        path = self._resolve_key(storage_key)
        if not path.exists():
            raise FileNotFoundError(storage_key)
        return path.read_bytes(), ""
