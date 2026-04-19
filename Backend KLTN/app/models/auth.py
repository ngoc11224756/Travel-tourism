from sqlalchemy import String, Text, TIMESTAMP, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.core.database import Base


class LoginSession(Base):
    __tablename__ = "login_sessions"

    id:           Mapped[uuid.UUID]  = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:      Mapped[uuid.UUID]  = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash:   Mapped[str]        = mapped_column(Text, unique=True, nullable=False)
    device_info:  Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_address:   Mapped[str | None] = mapped_column(INET, nullable=True)
    revoked_at:   Mapped[object]     = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at:   Mapped[object]     = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    last_used_at: Mapped[object]     = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    # Quan hệ
    user: Mapped["User"] = relationship(back_populates="sessions")
