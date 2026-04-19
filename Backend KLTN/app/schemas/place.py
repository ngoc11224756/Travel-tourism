from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class CategoryOut(BaseModel):
    id: UUID
    name: str
    slug: str
    icon: Optional[str] = None

    model_config = {"from_attributes": True}


class PlaceImageOut(BaseModel):
    id: UUID
    url: str
    is_primary: bool
    sort_order: int

    model_config = {"from_attributes": True}


class PlaceOut(BaseModel):
    """Trả về danh sách địa điểm (tìm kiếm, bản đồ)."""
    id: UUID
    name: str
    slug: str
    lat: float
    lng: float
    address: Optional[str] = None
    district: Optional[str] = None
    city: str
    avg_rating: float
    review_count: int
    categories: list[CategoryOut] = []
    images: list[PlaceImageOut] = []

    model_config = {"from_attributes": True}


class PlaceDetail(PlaceOut):
    """Trả về chi tiết địa điểm (UC3)."""
    description: Optional[str] = None
    metadata_: dict = {}

    model_config = {"from_attributes": True}


class PlaceCreate(BaseModel):
    """Admin tạo địa điểm mới (UC12)."""
    name: str
    description: Optional[str] = None
    lat: float
    lng: float
    address: Optional[str] = None
    district: Optional[str] = None
    city: str = "Hà Nội"
    category_ids: list[UUID] = []
    metadata_: dict = {}


class PlaceUpdate(BaseModel):
    """Admin cập nhật địa điểm (UC12)."""
    name: Optional[str] = None
    description: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    status: Optional[str] = None
    category_ids: Optional[list[UUID]] = None
    metadata_: Optional[dict] = None


class PlaceSearchParams(BaseModel):
    """Tham số tìm kiếm địa điểm (UC2)."""
    keyword: Optional[str] = None
    category_slug: Optional[str] = None
    city: Optional[str] = None
    min_rating: Optional[float] = None
    page: int = 1
    limit: int = 20
