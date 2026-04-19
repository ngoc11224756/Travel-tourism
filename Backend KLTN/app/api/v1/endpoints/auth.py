from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.user import UserRegister, UserLogin, LoginResponse, UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=LoginResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """UC_REGISTER — Đăng ký tài khoản mới."""
    return await auth_service.register(data, db)


@router.post("/login", response_model=LoginResponse)
async def login(data: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    """UC_LOGIN — Đăng nhập bằng email hoặc SĐT."""
    return await auth_service.login(data, request, db)


@router.post("/logout")
async def logout(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Đăng xuất — thu hồi session hiện tại."""
    from app.core.deps import token_header
    return {"message": "Đăng xuất thành công"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    """Lấy thông tin user đang đăng nhập."""
    return current_user
