from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ChatMessageIn(BaseModel):
    """User gửi tin nhắn (UC8)."""
    content: str
    session_id: UUID | None = None   # None = tạo session mới


class ChatMessageOut(BaseModel):
    """Tin nhắn trả về."""
    id: UUID
    role: str        # 'user' | 'assistant'
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionOut(BaseModel):
    """Lịch sử hội thoại."""
    id: UUID
    title: str | None = None
    created_at: datetime
    messages: list[ChatMessageOut] = []

    model_config = {"from_attributes": True}
