from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.schemas.user import UserOut
from app.services import user_service
from sqlalchemy import func
from app.models.review import Review
from app.models.plan import TravelPlan
from app.models.place import Place
from app.models.user import User
from sqlalchemy import func
from sqlalchemy.future import select

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserOut])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC14 — Admin lấy danh sách users."""
    return await user_service.get_all_users(db)


@router.patch("/{user_id}/status", response_model=UserOut)
async def update_user_status(
    user_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC14 — Admin khoá / mở khoá user."""
    return await user_service.update_user_status(user_id, status, db)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC14 — Admin xoá user."""
    await user_service.delete_user(user_id, db)
    return {"message": "Đã xoá user"}

@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC16 — Thống kê hệ thống."""
    total_users   = await db.scalar(select(func.count()).select_from(User))
    total_reviews = await db.scalar(select(func.count()).select_from(Review))
    total_places = await db.scalar(select(func.count()).select_from(Place))
    reported_reviews = await db.scalar(
        select(func.count()).select_from(Review).where(Review.status == "reported")
    )
    return {
        "total_users":       total_users,
        "total_reviews":     total_reviews,
        "total_places": total_places,
        "reported_reviews":  reported_reviews,
    }
