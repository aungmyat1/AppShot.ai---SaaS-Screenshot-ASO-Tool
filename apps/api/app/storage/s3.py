from __future__ import annotations

import io
from dataclasses import dataclass

import boto3
from botocore.client import Config

from app.core.config import settings


@dataclass
class UploadResult:
    key: str
    url: str | None


def _client():
    session = boto3.session.Session(
        aws_access_key_id=settings.STORAGE_ACCESS_KEY_ID,
        aws_secret_access_key=settings.STORAGE_SECRET_ACCESS_KEY,
        region_name=settings.STORAGE_REGION,
    )
    return session.client(
        "s3",
        endpoint_url=settings.STORAGE_ENDPOINT_URL,
        config=Config(signature_version="s3v4"),
    )


def upload_bytes(key: str, data: bytes, content_type: str) -> UploadResult:
    if not settings.STORAGE_BUCKET:
        raise RuntimeError("Missing STORAGE_BUCKET")

    c = _client()
    c.put_object(Bucket=settings.STORAGE_BUCKET, Key=key, Body=data, ContentType=content_type)
    url = f"{settings.STORAGE_PUBLIC_BASE_URL.rstrip('/')}/{key}" if settings.STORAGE_PUBLIC_BASE_URL else None
    return UploadResult(key=key, url=url)


def presign_get(key: str) -> str:
    if not settings.STORAGE_BUCKET:
        raise RuntimeError("Missing STORAGE_BUCKET")
    c = _client()
    return c.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.STORAGE_BUCKET, "Key": key},
        ExpiresIn=settings.PRESIGN_EXPIRES_SECONDS,
    )

