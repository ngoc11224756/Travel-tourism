from sqlalchemy import String, Text, TIMESTAMP, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.core.database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id:         Mapped[uuid.UUID]       = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:    Mapped[uuid.UUID | None]= mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title:      Mapped[str | None]      = mapped_column(String(200), nullable=True)
    created_at: Mapped[object]          = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    # Quan hệ
    user:     Mapped["User"]              = relationship(back_populates="chat_sessions")
    messages: Mapped[list["ChatMessage"]] = relationship(back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id:         Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role:       Mapped[str]       = mapped_column(String(20), nullable=False)   # 'user' | 'assistant' | 'system'
    content:    Mapped[str]       = mapped_column(Text, nullable=False)
    created_at: Mapped[object]    = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    # Quan hệ
    session: Mapped["ChatSession"] = relationship(back_populates="messages")
