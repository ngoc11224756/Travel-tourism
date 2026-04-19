import secrets
import hashlib
from passlib.context import CryptContext
from app.core.config import settings

# Dùng bcrypt để mã hóa mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Mã hóa mật khẩu trước khi lưu vào DB."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiểm tra mật khẩu nhập vào có khớp với mật khẩu đã mã hóa không."""
    return pwd_context.verify(plain_password, hashed_password)


def create_session_token() -> str:
    """Tạo mã xác thực ngẫu nhiên (dạng chuỗi dài, không đoán được)."""
    return secrets.token_urlsafe(64)


def hash_token(token: str) -> str:
    """Hash mã xác thực trước khi lưu vào DB (bảo mật hơn)."""
    return hashlib.sha256(token.encode()).hexdigest()
