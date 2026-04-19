from sqlalchemy import String, Text, Float, Integer, Numeric, Boolean, TIMESTAMP, ForeignKey, Table, Column, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.core.database import Base

# Bảng trung gian nhiều-nhiều: place <-> category
place_category_map = Table(
    "place_category_map",
    Base.metadata,
    Column("place_id",    UUID(as_uuid=True), ForeignKey("places.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("place_categories.id", ondelete="CASCADE"), primary_key=True),
)


class PlaceCategory(Base):
    __tablename__ = "place_categories"

    id:        Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name:      Mapped[str]             = mapped_column(String(100), nullable=False)
    slug:      Mapped[str]             = mapped_column(String(100), unique=True, nullable=False)
    icon:      Mapped[str | None]      = mapped_column(String(50), nullable=True)
    parent_id: Mapped[uuid.UUID | None]= mapped_column(UUID(as_uuid=True), ForeignKey("place_categories.id", ondelete="SET NULL"), nullable=True)

    places: Mapped[list["Place"]] = relationship(secondary=place_category_map, back_populates="categories")


class Place(Base):
    __tablename__ = "places"

    id:           Mapped[uuid.UUID]  = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name:         Mapped[str]        = mapped_column(String(200), nullable=False)
    slug:         Mapped[str]        = mapped_column(String(200), unique=True, nullable=False)
    description:  Mapped[str | None] = mapped_column(Text, nullable=True)
    lat:          Mapped[float]      = mapped_column(Float, nullable=False)
    lng:          Mapped[float]      = mapped_column(Float, nullable=False)
    address:      Mapped[str | None] = mapped_column(Text, nullable=True)
    district:     Mapped[str | None] = mapped_column(String(100), nullable=True)
    city:         Mapped[str]        = mapped_column(String(100), nullable=False, default="Hà Nội")
    avg_rating:   Mapped[float]      = mapped_column(Numeric(3, 2), nullable=False, default=0)
    review_count: Mapped[int]        = mapped_column(Integer, nullable=False, default=0)
    status:       Mapped[str]        = mapped_column(String(20), nullable=False, default="active")
    metadata_:    Mapped[dict]       = mapped_column("metadata", JSONB, nullable=False, default=dict)
    created_at:   Mapped[object]     = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at:   Mapped[object]     = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Quan hệ
    categories: Mapped[list["PlaceCategory"]] = relationship(secondary=place_category_map, back_populates="places")
    images:     Mapped[list["PlaceImage"]]    = relationship(back_populates="place", cascade="all, delete-orphan")
    reviews:    Mapped[list["Review"]]        = relationship(back_populates="place", cascade="all, delete-orphan")


class PlaceImage(Base):
    __tablename__ = "place_images"

    id:          Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    place_id:    Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), ForeignKey("places.id", ondelete="CASCADE"), nullable=False)
    url:         Mapped[str]             = mapped_column(Text, nullable=False)
    is_primary:  Mapped[bool]            = mapped_column(Boolean, nullable=False, default=False)
    sort_order:  Mapped[int]             = mapped_column(Integer, nullable=False, default=0)
    uploaded_by: Mapped[uuid.UUID | None]= mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at:  Mapped[object]          = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    place: Mapped["Place"] = relationship(back_populates="images")
