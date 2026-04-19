from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin
from app.schemas.review import ReviewCreate, ReviewOut, ReviewStatusUpdate
from app.services import review_service

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/place/{place_id}")
async def get_place_reviews(place_id: str, db: AsyncSession = Depends(get_db)):
    """UC10 — Xem đánh giá của một địa điểm."""
    return await review_service.get_place_reviews(place_id, db)


@router.post("/")
async def create_review(
    data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """UC9 — User viết đánh giá."""
    return await review_service.create_review(data, str(current_user.id), db)


@router.get("/pending")
async def get_reported_reviews(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC15 — Admin lấy danh sách đánh giá chờ duyệt."""
    return await review_service.get_reported_reviews(db)


@router.patch("/{review_id}/status")
async def update_review_status(
    review_id: str,
    data: ReviewStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC15 — Admin duyệt / ẩn / xóa đánh giá."""
    return await review_service.update_review_status(review_id, data, db)
