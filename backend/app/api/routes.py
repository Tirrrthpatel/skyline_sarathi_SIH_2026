from fastapi import APIRouter
from .prediction import router as prediction_router
from .analytics import router as analytics_router

api_router = APIRouter()
api_router.include_router(prediction_router)
api_router.include_router(analytics_router)
