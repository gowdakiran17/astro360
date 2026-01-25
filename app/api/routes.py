from fastapi import APIRouter
from app.modules.horoscope.router import router as horoscope_router

api_router = APIRouter()
api_router.include_router(horoscope_router, prefix="/horoscope", tags=["horoscope"])
