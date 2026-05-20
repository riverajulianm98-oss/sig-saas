"""S3-compatible storage (AWS S3, MinIO, Cloudflare R2)."""

from typing import Any

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import Settings
from app.infrastructure.storage.protocol import StoredObject


class S3StorageProvider:
    def __init__(self, settings: Settings) -> None:
        if not settings.storage_bucket:
            raise ValueError("STORAGE_BUCKET is required for S3 storage.")

        client_kwargs: dict[str, Any] = {
            "service_name": "s3",
            "region_name": settings.storage_region,
            "aws_access_key_id": settings.storage_access_key,
            "aws_secret_access_key": settings.storage_secret_key,
            "config": Config(signature_version="s3v4"),
        }
        if settings.storage_endpoint_url:
            client_kwargs["endpoint_url"] = settings.storage_endpoint_url

        self._client = boto3.client(**client_kwargs)
        self._bucket = settings.storage_bucket

    def put_object(self, *, storage_key: str, data: bytes, mime_type: str) -> StoredObject:
        self._client.put_object(
            Bucket=self._bucket,
            Key=storage_key,
            Body=data,
            ContentType=mime_type,
        )
        return StoredObject(storage_key=storage_key, size=len(data), mime_type=mime_type)

    def delete_object(self, *, storage_key: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=storage_key)

    def generate_download_url(
        self,
        *,
        storage_key: str,
        file_name: str,
        expires_seconds: int,
    ) -> str:
        return self._client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self._bucket,
                "Key": storage_key,
                "ResponseContentDisposition": f'attachment; filename="{file_name}"',
            },
            ExpiresIn=expires_seconds,
        )

    def object_exists(self, *, storage_key: str) -> bool:
        try:
            self._client.head_object(Bucket=self._bucket, Key=storage_key)
            return True
        except ClientError:
            return False
