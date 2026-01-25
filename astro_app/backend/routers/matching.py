from fastapi import APIRouter, Depends, HTTPException
from astro_app.backend.schemas import MatchingRequest, CompatibilityRequest
from astro_app.backend.auth.router import get_current_user
from astro_app.backend.models import User
from astro_app.backend.monetization.access_control import verify_user_access, Feature
from astro_app.backend.astrology.matching import calculate_match_score, calculate_business_match
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/ashtakoot")
async def match_horoscopes(request: MatchingRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates Kundli Matching score (Ashtakoot Guna Milan).
    """
    # Matching might be a Premium feature, or Basic. Let's make it Basic for now to test.
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        # Convert Pydantic models to dicts
        boy_data = request.boy.model_dump()
        girl_data = request.girl.model_dump()
        
        result = await calculate_match_score(boy_data, girl_data)
        return result
    except Exception as e:
        logger.error(f"Error calculating match score: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/compatibility")
async def get_compatibility(request: CompatibilityRequest, current_user: User = Depends(get_current_user)):
    """
    Returns Ashtakoot Milan compatibility score and details.
    """
    try:
        data = await calculate_match_score(request.boy, request.girl)
        return data
    except Exception as e:
        logger.error(f"Error calculating compatibility: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/business")
async def get_business_compatibility(request: CompatibilityRequest, current_user: User = Depends(get_current_user)):
    """
    Returns Business Partnership Compatibility score and details.
    """
    try:
        data = await calculate_business_match(request.boy, request.girl)
        return data
    except Exception as e:
        logger.error(f"Error calculating business compatibility: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
