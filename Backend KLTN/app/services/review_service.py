from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewStatusUpdate


async def create_review(data: ReviewCreate, user_id: str, db: AsyncSession) -> Review:
    """UC9 — User viết đánh giá."""

    # Kiểm tra đã review địa điểm này chưa
    #exists = await db.execute(
    #    select(Review).where(
    #        Review.user_id == user_id,
    #        Review.place_id == data.place_id,
    #    )
    #)
    #if exists.scalar_one_or_none():
    #
    #raise HTTPException(status_code=400, detail="Bạn đã đánh giá địa điểm này rồi")

    review = Review(
        user_id=user_id,
        place_id=data.place_id,
        rating=data.rating,
        content=data.content,
        status="approved",
    )
    db.add(review)
    return review


async def get_place_reviews(place_id: str, db: AsyncSession) -> list[dict]:
    """UC10 — Lấy danh sách đánh giá của một địa điểm."""
    result = await db.execute(
        select(Review, User.full_name, User.avatar_url)
        .join(User, Review.user_id == User.id)
        .where(Review.place_id == place_id)
        .where(Review.status == "approved")
        .order_by(Review.created_at.desc())
    )

    rows = result.all()
    return [
        {
            "id": str(r.Review.id),
            "user_id": str(r.Review.user_id),
            "user_name": r.full_name,
            "user_avatar": r.avatar_url,
            "place_id": str(r.Review.place_id),
            "rating": r.Review.rating,
            "content": r.Review.content,
            "status": r.Review.status,
            "created_at": r.Review.created_at,
        }
        for r in rows
    ]


async def get_reported_reviews(db: AsyncSession) -> list[Review]:
    """UC14 — Admin lấy danh sách đánh giá bị report."""
    result = await db.execute(
        select(Review)
        .where(Review.status == "reported")
        .order_by(Review.created_at.asc())
    )
    return result.scalars().all()


async def update_review_status(
    review_id: str, data: ReviewStatusUpdate, db: AsyncSession
) -> Review:
    """UC15 — Admin duyệt / ẩn / xóa đánh giá."""
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
    review.status = data.status
    return review
