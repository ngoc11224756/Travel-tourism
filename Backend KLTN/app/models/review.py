from sqlalchemy import SmallInteger, Text, String, TIMESTAMP, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id:         Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:    Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    place_id:   Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("places.id", ondelete="CASCADE"), nullable=False)
    rating:     Mapped[int]       = mapped_column(SmallInteger, nullable=False)
    content:    Mapped[str | None]= mapped_column(Text, nullable=True)
    status:     Mapped[str]       = mapped_column(String(20), nullable=False, default="pending")
    created_at: Mapped[object]    = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[object]    = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("user_id", "place_id"),)

    # Quan hệ
    user:  Mapped["User"]  = relationship(back_populates="reviews")
    place: Mapped["Place"] = relationship(back_populates="reviews")
