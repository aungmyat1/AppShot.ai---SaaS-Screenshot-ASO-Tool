import uuid

from fastapi import Depends, Request
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


async def get_principal(request: Request, db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """
    Returns a user principal from either:
    - API key middleware (request.state.user)
    - Bearer JWT token
    """
    state_user = getattr(request.state, "user", None)
    if state_user is not None:
        return state_user
    return await get_current_user(db=db, token=token)


def require_roles(*roles: str):
    async def _dep(user=Depends(get_principal)):
        if user.role not in roles:
            raise http_error(403, "Forbidden")
        return user

    return _dep

