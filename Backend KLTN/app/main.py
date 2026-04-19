from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import router
from app.core.config import settings

app = FastAPI(
    title="Du lịch thông minh API",
    version="1.0.0",
    docs_url="/docs",       # truy cập http://localhost:8000/docs để test API
    redoc_url="/redoc",
)

# Cho phép React frontend gọi API (tránh lỗi CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký tất cả routes
app.include_router(router)


@app.get("/")
async def root():
    return {"message": "Du lịch thông minh API đang chạy!"}
