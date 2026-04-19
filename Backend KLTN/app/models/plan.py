from sqlalchemy import String, Text, SmallInteger, TIMESTAMP, ForeignKey, Date, Time, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.core.database import Base


class TravelPlan(Base):
    __tablename__ = "travel_plans"

    id:         Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:    Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title:      Mapped[str]             = mapped_column(String(200), nullable=False)
    start_date: Mapped[object]          = mapped_column(Date, nullable=True)
    end_date:   Mapped[object]          = mapped_column(Date, nullable=True)
    status:     Mapped[str]             = mapped_column(String(20), nullable=False, default="draft")
    created_at: Mapped[object]          = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[object]          = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Quan hệ
    user: Mapped["User"]          = relationship(back_populates="travel_plans")
    days: Mapped[list["PlanDay"]] = relationship(back_populates="plan", cascade="all, delete-orphan", order_by="PlanDay.day_number")


class PlanDay(Base):
    __tablename__ = "plan_days"

    id:         Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id:    Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), ForeignKey("travel_plans.id", ondelete="CASCADE"), nullable=False)
    day_number: Mapped[int]             = mapped_column(SmallInteger, nullable=False)
    date:       Mapped[object]          = mapped_column(Date, nullable=True)
    note:       Mapped[str | None]      = mapped_column(Text, nullable=True)

    __table_args__ = (UniqueConstraint("plan_id", "day_number"),)

    # Quan hệ
    plan:  Mapped["TravelPlan"]    = relationship(back_populates="days")
    items: Mapped[list["PlanItem"]]= relationship(back_populates="day", cascade="all, delete-orphan", order_by="PlanItem.sort_order")


class PlanItem(Base):
    __tablename__ = "plan_items"

    id:         Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    day_id:     Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), ForeignKey("plan_days.id", ondelete="CASCADE"), nullable=False)
    place_id:   Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), ForeignKey("places.id", ondelete="RESTRICT"), nullable=False)
    sort_order: Mapped[int]             = mapped_column(SmallInteger, nullable=False, default=0)
    visit_time: Mapped[object]          = mapped_column(Time, nullable=True)
    note:       Mapped[str | None]      = mapped_column(Text, nullable=True)

    # Quan hệ
    day:   Mapped["PlanDay"] = relationship(back_populates="items")
    place: Mapped["Place"]   = relationship()
