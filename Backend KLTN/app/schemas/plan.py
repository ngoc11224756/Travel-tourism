from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import date, time, datetime


class PlanItemCreate(BaseModel):
    place_id: UUID
    sort_order: int = 0
    visit_time: Optional[time] = None
    note: Optional[str] = None


class PlanItemOut(BaseModel):
    id: UUID
    place_id: UUID
    sort_order: int
    visit_time: Optional[time] = None
    note: Optional[str] = None

    # Thông tin địa điểm kèm theo
    place_name: Optional[str] = None
    place_address: Optional[str] = None
    place_image: Optional[str] = None

    model_config = {"from_attributes": True}


class PlanDayCreate(BaseModel):
    day_number: int
    date: Optional[date] = None
    note: Optional[str] = None
    items: list[PlanItemCreate] = []


class PlanDayOut(BaseModel):
    id: UUID
    day_number: int
    date: Optional[date] = None
    note: Optional[str] = None
    items: list[PlanItemOut] = []

    model_config = {"from_attributes": True}


class PlanCreate(BaseModel):
    """User tạo kế hoạch mới (UC5)."""
    title: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    days: list[PlanDayCreate] = []


class PlanOut(BaseModel):
    """Trả về kế hoạch (UC6)."""
    id: UUID
    title: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str
    created_at: datetime
    days: list[PlanDayOut] = []

    model_config = {"from_attributes": True}


class PlanUpdate(BaseModel):
    """User cập nhật kế hoạch (UC6)."""
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
