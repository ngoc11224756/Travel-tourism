from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from openai import AsyncOpenAI

from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatMessageIn
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """Bạn là trợ lý du lịch thông minh chuyên về du lịch Việt Nam.
Hãy tư vấn địa điểm, ẩm thực, lịch trình và các thông tin du lịch hữu ích.
Trả lời bằng tiếng Việt, ngắn gọn và thân thiện."""


async def send_message(data: ChatMessageIn, user_id: str, db: AsyncSession) -> dict:
    """UC8 — Gửi tin nhắn và nhận phản hồi từ AI chatbot."""

    # Lấy hoặc tạo session chat
    if data.session_id:
        session = await db.get(ChatSession, data.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Không tìm thấy cuộc hội thoại")
    else:
        session = ChatSession(
            user_id=user_id,
            title=data.content[:50],  # lấy 50 ký tự đầu làm tiêu đề
        )
        db.add(session)
        await db.flush()

    # Lưu tin nhắn của user
    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=data.content,
    )
    db.add(user_message)

    # Lấy lịch sử hội thoại để gửi lên AI (tối đa 10 tin gần nhất)
    history = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
    )
    messages = list(reversed(history.scalars().all()))

    # Gọi OpenAI API
    ai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in messages:
        ai_messages.append({"role": msg.role, "content": msg.content})

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=ai_messages,
        max_tokens=500,
    )

    ai_reply = response.choices[0].message.content

    # Lưu phản hồi của AI
    ai_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=ai_reply,
    )
    db.add(ai_message)

    return {
        "session_id": str(session.id),
        "message": {
            "role": "assistant",
            "content": ai_reply,
        }
    }


async def get_chat_history(session_id: str, user_id: str, db: AsyncSession) -> ChatSession:
    """Lấy lịch sử hội thoại."""
    session = await db.get(ChatSession, session_id)
    if not session or str(session.user_id) != str(user_id):
        raise HTTPException(status_code=404, detail="Không tìm thấy cuộc hội thoại")
    return session
