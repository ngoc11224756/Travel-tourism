from fastapi import APIRouter
from app.api.v1.endpoints import auth, places, reviews, plans, chat, users

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(places.router)
router.include_router(reviews.router)
router.include_router(plans.router)
router.include_router(chat.router)
router.include_router(users.router)