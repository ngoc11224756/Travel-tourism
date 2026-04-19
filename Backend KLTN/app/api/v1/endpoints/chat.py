from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.chat import ChatMessageIn
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/")
async def send_message(
    data: ChatMessageIn,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """UC8 — Gửi tin nhắn tới AI chatbot."""
    return await chat_service.send_message(data, str(current_user.id), db)


@router.get("/sessions/{session_id}")
async def get_chat_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Lấy lịch sử hội thoại."""
    return await chat_service.get_chat_history(session_id, str(current_user.id), db)
