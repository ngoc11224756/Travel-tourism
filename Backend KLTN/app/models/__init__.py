# Import tất cả models để Alembic nhận diện khi tạo migration
from app.models.user import User
from app.models.auth import LoginSession
from app.models.place import Place, PlaceCategory, PlaceImage
from app.models.review import Review
from app.models.plan import TravelPlan, PlanDay, PlanItem
from app.models.chat import ChatSession, ChatMessage
