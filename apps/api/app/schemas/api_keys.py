from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class APIKeyCreateRequest(BaseModel):
    name: str | None = Field(default=None, max_length=64)
    permissions: dict = Field(default_factory=dict)
    expires_at: datetime | None = None


class APIKeyOut(BaseModel):
    id: UUID
    name: str | None
    key_last4: str
    permissions: dict
    rate_limit: int
    expires_at: datetime | None
    revoked_at: datetime | None
    last_used_at: datetime | None
    created_at: datetime


class APIKeyCreateResponse(BaseModel):
    api_key: APIKeyOut
    secret: str


class APIKeyRotateResponse(BaseModel):
    api_key: APIKeyOut
    secret: str

