from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.sessions import router as sessions_router
from app.api.documents import router as documents_router
from app.api.orders import router as orders_router
from app.api.pricing import router as pricing_router

api_router = APIRouter()


api_router.include_router(auth_router)
api_router.include_router(sessions_router)
api_router.include_router(documents_router)
api_router.include_router(orders_router)
api_router.include_router(pricing_router)