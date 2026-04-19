from pydantic import BaseModel, EmailStr, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    """Dữ liệu nhận từ frontend khi đăng ký."""
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str

    @field_validator("password")
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Mật khẩu phải có ít nhất 6 ký tự")
        return v

    @field_validator("phone")
    def phone_format(cls, v):
        if v and not v.startswith(("0", "+84")):
            raise ValueError("Số điện thoại không hợp lệ")
        return v

    def validate_email_or_phone(self):
        if not self.email and not self.phone:
            raise ValueError("Phải nhập email hoặc số điện thoại")


class UserLogin(BaseModel):
    """Dữ liệu nhận từ frontend khi đăng nhập."""
    identifier: str   # email hoặc số điện thoại
    password: str


class UserOut(BaseModel):
    """Dữ liệu trả về cho frontend sau khi đăng nhập / lấy thông tin."""
    id: UUID
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """Dữ liệu cập nhật thông tin cá nhân."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class LoginResponse(BaseModel):
    """Trả về sau khi đăng nhập thành công."""
    token: str
    user: UserOut
