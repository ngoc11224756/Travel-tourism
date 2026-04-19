from pydantic import BaseModel, field_validator
from uuid import UUID
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    """User viết đánh giá (UC9)."""
    place_id: UUID
    rating: int
    content: Optional[str] = None

    @field_validator("rating")
    def rating_range(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Đánh giá phải từ 1 đến 5 sao")
        return v


class ReviewOut(BaseModel):
    """Trả về đánh giá (UC10)."""
    id: UUID
    user_id: UUID
    place_id: UUID
    rating: int
    content: Optional[str] = None
    status: str
    created_at: datetime

    # Thông tin user viết đánh giá
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

    model_config = {"from_attributes": True}


class ReviewStatusUpdate(BaseModel):
    """Admin duyệt / ẩn / xóa đánh giá (UC15)."""
    status: str

    @field_validator("status")
    def valid_status(cls, v):
        if v not in ("approved", "hidden", "deleted"):
            raise ValueError("Trạng thái không hợp lệ")
        return v
