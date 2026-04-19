from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Request

from app.models.user import User
from app.models.auth import LoginSession
from app.schemas.user import UserRegister, UserLogin, UserOut, LoginResponse
from app.core.security import hash_password, verify_password, create_session_token, hash_token


async def register(data: UserRegister, db: AsyncSession) -> LoginResponse:
    """UC_REGISTER — Tạo tài khoản mới."""

    # Kiểm tra phải có email hoặc SĐT
    if not data.email and not data.phone:
        raise HTTPException(status_code=400, detail="Phải nhập email hoặc số điện thoại")

    # Kiểm tra email đã tồn tại chưa
    if data.email:
        exists = await db.execute(select(User).where(User.email == data.email))
        if exists.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email đã được đăng ký")

    # Kiểm tra SĐT đã tồn tại chưa
    if data.phone:
        exists = await db.execute(select(User).where(User.phone == data.phone))
        if exists.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Số điện thoại đã được đăng ký")

    # Tạo user mới
    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    await db.flush()  # lấy id của user vừa tạo

    # Tạo session đăng nhập luôn
    token = create_session_token()
    session = LoginSession(
        user_id=user.id,
        token_hash=hash_token(token),
    )
    db.add(session)

    return LoginResponse(token=token, user=UserOut.model_validate(user))


async def login(data: UserLogin, request: Request, db: AsyncSession) -> LoginResponse:
    """UC_LOGIN — Đăng nhập bằng email hoặc SĐT."""

    # Tìm user theo email hoặc SĐT
    identifier = data.identifier.strip()
    if "@" in identifier:
        result = await db.execute(select(User).where(User.email == identifier))
    else:
        result = await db.execute(select(User).where(User.phone == identifier))

    user = result.scalar_one_or_none()

    # Kiểm tra user tồn tại và mật khẩu đúng
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email/SĐT hoặc mật khẩu không đúng")

    # Kiểm tra tài khoản không bị khóa
    if user.status != "active":
        raise HTTPException(status_code=403, detail="Tài khoản đã bị khóa")

    # Tạo session mới
    token = create_session_token()
    session = LoginSession(
        user_id=user.id,
        token_hash=hash_token(token),
        ip_address=request.client.host if request.client else None,
        device_info=request.headers.get("User-Agent"),
    )
    db.add(session)

    return LoginResponse(token=token, user=UserOut.model_validate(user))


async def logout(token: str, db: AsyncSession) -> None:
    """Đăng xuất — thu hồi session hiện tại."""
    from datetime import datetime, timezone

    result = await db.execute(
        select(LoginSession).where(LoginSession.token_hash == hash_token(token))
    )
    session = result.scalar_one_or_none()
    if session:
        session.revoked_at = datetime.now(timezone.utc)
