from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin
from app.schemas.place import PlaceOut, PlaceDetail, PlaceCreate, PlaceUpdate, PlaceSearchParams
from app.services import place_service

router = APIRouter(prefix="/places", tags=["Places"])


@router.get("/map", response_model=list[PlaceOut])
async def get_map_places(
    city: str = Query(default="Ha Noi"),
    db: AsyncSession = Depends(get_db),
):
    """UC1 — Lấy địa điểm hiển thị trên bản đồ."""
    return await place_service.get_map_places(city, db)


@router.get("/search", response_model=list[PlaceOut])
async def search_places(
    keyword: Optional[str] = None,
    category_slug: Optional[str] = None,
    city: Optional[str] = None,
    min_rating: Optional[float] = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """UC2 — Tìm kiếm địa điểm."""
    params = PlaceSearchParams(
        keyword=keyword,
        category_slug=category_slug,
        city=city,
        min_rating=min_rating,
        page=page,
        limit=limit,
    )
    return await place_service.search_places(params, db)


@router.get("/{place_id}", response_model=PlaceDetail)
async def get_place_detail(place_id: str, db: AsyncSession = Depends(get_db)):
    """UC3 — Xem chi tiết địa điểm."""
    return await place_service.get_place_detail(place_id, db)


@router.post("/", response_model=PlaceDetail)
async def create_place(
    data: PlaceCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC12 — Admin tạo địa điểm mới."""
    return await place_service.create_place(data, db)


@router.put("/{place_id}", response_model=PlaceDetail)
async def update_place(
    place_id: str,
    data: PlaceUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC12 — Admin cập nhật địa điểm."""
    return await place_service.update_place(place_id, data, db)


@router.delete("/{place_id}")
async def delete_place(
    place_id: str,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin),
):
    """UC12 — Admin xóa địa điểm."""
    await place_service.delete_place(place_id, db)
    return {"message": "Đã xóa địa điểm"}
