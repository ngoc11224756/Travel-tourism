from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.user import User
from app.schemas.user import UserOut


async def get_all_users(db: AsyncSession) -> list[UserOut]:
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [UserOut.model_validate(u) for u in users]


async def update_user_status(user_id: str, status: str, db: AsyncSession) -> UserOut:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")
    user.status = status
    await db.flush()
    return UserOut.model_validate(user)


async def delete_user(user_id: str, db: AsyncSession) -> None:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")
    await db.delete(user)