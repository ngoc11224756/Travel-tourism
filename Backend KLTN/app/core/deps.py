from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.core.security import hash_token

# Lấy token từ header "Authorization"
token_header = APIKeyHeader(name="Authorization", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(token_header),
    db: AsyncSession = Depends(get_db),
):
    """
    Kiểm tra mã xác thực gửi lên từ client.
    Nếu hợp lệ → trả về thông tin user.
    Nếu không → báo lỗi 401.
    """
    from app.models.user import User
    from app.models.auth import LoginSession

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chưa đăng nhập",
        )

    token_hash = hash_token(token)

    # Tìm session trong DB
    result = await db.execute(
        select(LoginSession)
        .where(LoginSession.token_hash == token_hash)
        .where(LoginSession.revoked_at.is_(None))
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
        )

    # Lấy thông tin user
    user = await db.get(User, session.user_id)

    if not user or user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa",
        )

    # Cập nhật lần dùng cuối
    from datetime import datetime, timezone
    session.last_used_at = datetime.now(timezone.utc)

    return user


async def get_current_admin(
    current_user=Depends(get_current_user),
):
    """Chỉ cho phép admin truy cập."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Không có quyền truy cập",
        )
    return current_user
