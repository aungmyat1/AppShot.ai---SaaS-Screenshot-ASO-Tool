from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.repositories.api_keys import APIKeysRepository
from app.schemas.api_keys import APIKeyCreateRequest, APIKeyCreateResponse, APIKeyOut, APIKeyRotateResponse
from app.utils.api_keys import generate_api_key

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


def default_key_rpm(subscription_tier: str) -> int:
    tier = (subscription_tier or "free").lower()
    if tier == "enterprise":
        return 6000
    if tier == "pro":
        return 600
    return settings.DEFAULT_RATE_LIMIT_PER_MINUTE


@router.get("", response_model=list[APIKeyOut])
async def list_keys(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await APIKeysRepository(db).list_for_user(user.id)


@router.post("", response_model=APIKeyCreateResponse)
async def create_key(payload: APIKeyCreateRequest, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    raw, key_hash, last4 = generate_api_key()
    rpm = default_key_rpm(user.subscription_tier)
    key = await APIKeysRepository(db).create(
        user_id=user.id,
        key_hash=key_hash,
        key_last4=last4,
        name=payload.name,
        permissions=payload.permissions,
        rate_limit=rpm,
        expires_at=payload.expires_at,
    )
    return APIKeyCreateResponse(api_key=key, secret=raw)


@router.post("/{api_key_id}/revoke", response_model=APIKeyOut)
async def revoke_key(api_key_id: str, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = APIKeysRepository(db)
    key = await repo.get_for_user(user.id, api_key_id)
    if not key:
        from app.core.exceptions import http_error

        raise http_error(404, "Not found")
    return await repo.revoke(key)


@router.post("/{api_key_id}/rotate", response_model=APIKeyRotateResponse)
async def rotate_key(api_key_id: str, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = APIKeysRepository(db)
    old = await repo.get_for_user(user.id, api_key_id)
    if not old:
        from app.core.exceptions import http_error

        raise http_error(404, "Not found")
    if old.revoked_at is None:
        await repo.revoke(old)

    raw, key_hash, last4 = generate_api_key()
    rpm = old.rate_limit
    key = await repo.create(
        user_id=user.id,
        key_hash=key_hash,
        key_last4=last4,
        name=old.name,
        permissions=old.permissions,
        rate_limit=rpm,
        expires_at=old.expires_at,
    )
    return APIKeyRotateResponse(api_key=key, secret=raw)


@router.post("/{api_key_id}/renew", response_model=APIKeyOut)
async def renew_key(api_key_id: str, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    repo = APIKeysRepository(db)
    key = await repo.get_for_user(user.id, api_key_id)
    if not key:
        from app.core.exceptions import http_error

        raise http_error(404, "Not found")
    # Simple auto-renew: extend expiry by 30 days from now.
    key.expires_at = datetime.now(timezone.utc) + timedelta(days=30)  # type: ignore[name-defined]
    await db.commit()
    await db.refresh(key)
    return key

