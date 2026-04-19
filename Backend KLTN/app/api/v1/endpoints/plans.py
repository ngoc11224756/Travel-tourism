from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.plan import PlanCreate, PlanOut, PlanUpdate
from app.services import plan_service

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.get("/", response_model=list[PlanOut])
async def get_my_plans(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """UC6 — Lấy danh sách kế hoạch của user."""
    return await plan_service.get_user_plans(str(current_user.id), db)


@router.get("/{plan_id}", response_model=PlanOut)
async def get_plan_detail(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """UC6 — Xem chi tiết kế hoạch."""
    return await plan_service.get_plan_detail(plan_id, str(current_user.id), db)


@router.post("/", response_model=PlanOut)
async def create_plan(
    data: PlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """UC5 — Tạo kế hoạch du lịch mới."""
    return await plan_service.create_plan(data, str(current_user.id), db)


@router.put("/{plan_id}", response_model=PlanOut)
async def update_plan(
    plan_id: str,
    data: PlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """UC6 — Cập nhật kế hoạch."""
    return await plan_service.update_plan(plan_id, data, str(current_user.id), db)


@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """UC6 — Xóa kế hoạch."""
    await plan_service.delete_plan(plan_id, str(current_user.id), db)
    return {"message": "Đã xóa kế hoạch"}
