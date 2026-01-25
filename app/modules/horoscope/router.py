from fastapi import APIRouter, HTTPException
from app.modules.horoscope.models import BirthDetails, HoroscopeResponse
from app.modules.horoscope.service import HoroscopeService

router = APIRouter()

@router.post("/calculate", response_model=HoroscopeResponse)
async def calculate_horoscope(birth_details: BirthDetails):
    try:
        return HoroscopeService.calculate_horoscope(birth_details)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
