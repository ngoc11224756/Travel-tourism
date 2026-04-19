from sqlalchemy import String, Text, Enum, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id:            Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name:     Mapped[str]             = mapped_column(String(120), nullable=False)
    email:         Mapped[str | None]      = mapped_column(String(255), unique=True, nullable=True)
    phone:         Mapped[str | None]      = mapped_column(String(15),  unique=True, nullable=True)
    password_hash: Mapped[str]             = mapped_column(Text, nullable=False)
    avatar_url:    Mapped[str | None]      = mapped_column(Text, nullable=True)
    role:          Mapped[str]             = mapped_column(String(20), nullable=False, default="user")
    status:        Mapped[str]             = mapped_column(String(20), nullable=False, default="active")
    preferences:   Mapped[dict]            = mapped_column(JSONB, nullable=False, default=dict)
    created_at:    Mapped[object]          = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at:    Mapped[object]          = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Quan hệ
    sessions:      Mapped[list["LoginSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    reviews:       Mapped[list["Review"]]       = relationship(back_populates="user", cascade="all, delete-orphan")
    travel_plans:  Mapped[list["TravelPlan"]]   = relationship(back_populates="user", cascade="all, delete-orphan")
    chat_sessions: Mapped[list["ChatSession"]]  = relationship(back_populates="user")
