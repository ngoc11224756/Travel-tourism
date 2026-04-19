from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.place import Place, PlaceCategory, PlaceImage, place_category_map
from app.schemas.place import PlaceCreate, PlaceUpdate, PlaceSearchParams


async def search_places(params: PlaceSearchParams, db: AsyncSession) -> list[Place]:
    """UC2 — Tìm kiếm địa điểm theo từ khóa, danh mục, thành phố."""
    query = select(Place).where(Place.status == "active").options(
        selectinload(Place.categories),
        selectinload(Place.images),
    )

    if params.keyword:
        query = query.where(Place.name.ilike(f"%{params.keyword}%"))
    if params.city:
        query = query.where(Place.city == params.city)
    if params.min_rating:
        query = query.where(Place.avg_rating >= params.min_rating)
    if params.category_slug:
        query = query.join(
            place_category_map, Place.id == place_category_map.c.place_id
        ).join(
            PlaceCategory, PlaceCategory.id == place_category_map.c.category_id
        ).where(PlaceCategory.slug == params.category_slug)

    offset = (params.page - 1) * params.limit
    query = query.offset(offset).limit(params.limit)

    result = await db.execute(query)
    return result.scalars().all()


async def get_place_detail(place_id: str, db: AsyncSession) -> Place:
    """UC3 — Xem chi tiết địa điểm."""
    result = await db.execute(
        select(Place)
        .where(Place.id == place_id)
        .where(Place.status != "deleted")
        .options(
            selectinload(Place.categories),
            selectinload(Place.images),
        )
    )
    place = result.scalar_one_or_none()
    if not place:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa điểm")
    return place


async def get_map_places(city: str, db: AsyncSession) -> list[Place]:
    """UC1 — Lấy tất cả địa điểm để hiển thị trên bản đồ."""
    result = await db.execute(
        select(Place)
        .where(Place.status == "active")
        .where(Place.city == city)
        .options(
            selectinload(Place.categories),
            selectinload(Place.images),
        )
    )
    return result.scalars().all()


async def create_place(data: PlaceCreate, db: AsyncSession) -> Place:
    """UC12 — Admin tạo địa điểm mới."""
    import re

    slug = re.sub(r"[^a-z0-9]+", "-", data.name.lower()).strip("-")

    place = Place(
        name=data.name,
        slug=slug,
        description=data.description,
        lat=data.lat,
        lng=data.lng,
        address=data.address,
        district=data.district,
        city=data.city,
        metadata_=data.metadata_,
    )
    db.add(place)
    await db.flush()

    if data.category_ids:
        for cat_id in data.category_ids:
            await db.execute(
                place_category_map.insert().values(place_id=place.id, category_id=cat_id)
            )

    await db.commit()

    # Reload với quan hệ đầy đủ
    result = await db.execute(
        select(Place)
        .where(Place.id == place.id)
        .options(
            selectinload(Place.categories),
            selectinload(Place.images),
        )
    )
    return result.scalar_one()


async def update_place(place_id: str, data: PlaceUpdate, db: AsyncSession) -> Place:
    """UC12 — Admin cập nhật địa điểm."""
    place = await db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa điểm")

    for field, value in data.model_dump(exclude_none=True).items():
        if field == "category_ids":
            continue
        setattr(place, field, value)

    if data.category_ids is not None:
        await db.execute(
            place_category_map.delete().where(place_category_map.c.place_id == place.id)
        )
        for cat_id in data.category_ids:
            await db.execute(
                place_category_map.insert().values(place_id=place.id, category_id=cat_id)
            )

    await db.commit()

    # Reload với quan hệ đầy đủ
    result = await db.execute(
        select(Place)
        .where(Place.id == place.id)
        .options(
            selectinload(Place.categories),
            selectinload(Place.images),
        )
    )
    return result.scalar_one()


async def delete_place(place_id: str, db: AsyncSession) -> None:
    """UC12 — Admin xóa địa điểm (soft delete)."""
    place = await db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa điểm")
    place.status = "deleted"