import uuid

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import http_error
from app.core.security import decode_token
from app.db.session import get_db
from app.repositories.users import UsersRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        if not sub:
            raise http_error(401, "Invalid token")
        user_id = uuid.UUID(sub)
    except Exception:
        raise http_error(401, "Invalid token")

    user = await UsersRepository(db).get_by_id(user_id)
    if not user:
        raise http_error(401, "User not found")
    return user


def require_roles(*roles: str):
    async def _dep(user=Depends(get_current_user)):
        if user.role not in roles:
            raise http_error(403, "Forbidden")
        return user

    return _dep

