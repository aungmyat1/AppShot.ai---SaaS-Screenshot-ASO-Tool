from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.schemas.users import UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user


@router.get("", response_model=list[UserOut])
async def list_users(_: object = Depends(require_roles("admin")), db: AsyncSession = Depends(get_db)):
    # Minimal admin list (example)
    from sqlalchemy import select
    from app.models.user import User

    res = await db.execute(select(User).order_by(User.created_at.desc()).limit(100))
    return list(res.scalars().all())

