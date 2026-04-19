from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.plan import TravelPlan, PlanDay, PlanItem
from app.schemas.plan import PlanCreate, PlanUpdate


async def _load_plan(plan_id, db: AsyncSession) -> TravelPlan:
    """Load kế hoạch kèm đầy đủ quan hệ."""
    result = await db.execute(
        select(TravelPlan)
        .where(TravelPlan.id == plan_id)
        .options(
            selectinload(TravelPlan.days).selectinload(PlanDay.items)
        )
    )
    return result.scalar_one_or_none()


async def get_user_plans(user_id: str, db: AsyncSession) -> list[TravelPlan]:
    """UC6 — Lấy danh sách kế hoạch của user."""
    result = await db.execute(
        select(TravelPlan)
        .where(TravelPlan.user_id == user_id)
        .where(TravelPlan.status != "archived")
        .order_by(TravelPlan.created_at.desc())
        .options(
            selectinload(TravelPlan.days).selectinload(PlanDay.items)
        )
    )
    return result.scalars().all()


async def get_plan_detail(plan_id: str, user_id: str, db: AsyncSession) -> TravelPlan:
    """UC6 — Xem chi tiết một kế hoạch."""
    plan = await _load_plan(plan_id, db)
    if not plan:
        raise HTTPException(status_code=404, detail="Không tìm thấy kế hoạch")
    if str(plan.user_id) != str(user_id):
        raise HTTPException(status_code=403, detail="Không có quyền xem kế hoạch này")
    return plan


async def create_plan(data: PlanCreate, user_id: str, db: AsyncSession) -> TravelPlan:
    """UC5 — Tạo kế hoạch du lịch mới."""
    plan = TravelPlan(
        user_id=user_id,
        title=data.title,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    db.add(plan)
    await db.flush()

    for day_data in data.days:
        day = PlanDay(
            plan_id=plan.id,
            day_number=day_data.day_number,
            date=day_data.date,
            note=day_data.note,
        )
        db.add(day)
        await db.flush()

        for item_data in day_data.items:
            item = PlanItem(
                day_id=day.id,
                place_id=item_data.place_id,
                sort_order=item_data.sort_order,
                visit_time=item_data.visit_time,
                note=item_data.note,
            )
            db.add(item)

    await db.commit()
    return await _load_plan(plan.id, db)


async def update_plan(
    plan_id: str, data: PlanUpdate, user_id: str, db: AsyncSession
) -> TravelPlan:
    """UC6 — Cập nhật kế hoạch."""
    plan = await get_plan_detail(plan_id, user_id, db)

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(plan, field, value)

    await db.commit()
    return await _load_plan(plan_id, db)


async def delete_plan(plan_id: str, user_id: str, db: AsyncSession) -> None:
    """UC6 — Xóa kế hoạch (chuyển sang archived)."""
    plan = await get_plan_detail(plan_id, user_id, db)
    plan.status = "archived"
    await db.commit()