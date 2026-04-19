from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Tạo engine kết nối tới PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_ENV == "development",  # in SQL ra terminal khi dev
    pool_size=10,
    max_overflow=20,
)

# Session factory — dùng để tạo session mỗi khi có request
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class cho tất cả models
class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """
    Dependency injection — FastAPI tự động gọi hàm này
    để cấp 1 session DB cho mỗi request, tự đóng khi xong.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
