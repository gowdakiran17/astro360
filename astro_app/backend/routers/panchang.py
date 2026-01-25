from fastapi import APIRouter, Depends, HTTPException
from astro_app.backend.schemas import PanchangRequest, MuhurataRequest, BirthDetails
from astro_app.backend.auth.router import get_current_user
from astro_app.backend.models import User
from astro_app.backend.monetization.access_control import verify_user_access, Feature
from astro_app.backend.astrology.panchang import calculate_panchang, get_panchang_data, get_lagna_journey, get_timeline_segments
from astro_app.backend.astrology.muhurata import get_muhurata_data
from astro_app.backend.astrology.shadow_planets import get_julian_day
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/panchang")
async def get_panchang(details: BirthDetails, current_user: User = Depends(get_current_user)):
    """
    Calculates the Panchang (Tithi, Nakshatra, Yoga, Karana, Vara).
    """
    # Assuming Basic Chart access covers Panchang for now
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        result = await calculate_panchang(
            details.date,
            details.time,
            details.timezone,
            details.latitude,
            details.longitude
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating panchang: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/live-panchang")
async def get_live_panchang(request: PanchangRequest, current_user: User = Depends(get_current_user)):
    """
    Returns full Live Panchang data including timelines and lagna journey.
    """
    try:
        jd = get_julian_day(request.date, request.time, request.timezone)
        
        # Current status
        current_data = get_panchang_data(jd, request.latitude, request.longitude)
        
        # Timeline for the day
        timeline = get_timeline_segments(request.date, request.timezone, request.latitude, request.longitude)
        
        # Lagna Journey for the day
        lagna_journey = get_lagna_journey(request.date, request.timezone, request.latitude, request.longitude)
        
        return {
            "current": current_data,
            "timeline": timeline,
            "lagna_journey": lagna_journey,
            "meta": {
                "date": request.date,
                "time": request.time,
                "timezone": request.timezone,
                "latitude": request.latitude,
                "longitude": request.longitude
            }
        }
    except Exception as e:
        logger.error(f"Error calculating live panchang: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/planner/moments")
async def get_planner_moments(request: MuhurataRequest, current_user: User = Depends(get_current_user)):
    """
    Returns specific Golden and Silence moments for the Planner view.
    Golden Moment = Abhijit Muhurata OR Amrit Choghadiya
    Silence Moment = Rahu Kaal OR Yamaganda
    """
    try:
        jd = get_julian_day(request.date, request.time, request.timezone)
        data = get_muhurata_data(jd, request.latitude, request.longitude)
        
        # Filter for Golden/Silence moments
        moments = []
        now_jd = jd # Approximation for current time comparison if needed, though frontend handles display logic
        
        # 1. Golden Moments
        for p in data["periods"]:
            if p["name"] == "Abhijit Muhurata":
                moments.append({
                    "title": "Golden Moment",
                    "type": "golden",
                    "start": p["start"],
                    "end": p["end"],
                    "description": "Best time for important actions (Abhijit)"
                })
            elif p["quality"] == "Excellent" and p["type"] == "Choghadiya" and "Amrit" in p["name"]:
                 moments.append({
                    "title": "Golden Moment",
                    "type": "golden",
                    "start": p["start"],
                    "end": p["end"],
                    "description": "Highly auspicious time (Amrit Choghadiya)"
                })

        # 2. Silence Moments
        for p in data["periods"]:
            if p["name"] == "Rahu Kaal":
                moments.append({
                    "title": "Silence Moment",
                    "type": "silence",
                    "start": p["start"],
                    "end": p["end"],
                    "description": "Avoid new beginnings (Rahu Kaal)"
                })
            elif p["name"] == "Yamaganda":
                 moments.append({
                    "title": "Silence Moment",
                    "type": "silence",
                    "start": p["start"],
                    "end": p["end"],
                    "description": "Time for introspection (Yamaganda)"
                })

        # Sort by start time
        moments.sort(key=lambda x: x["start"])

        return {
            "moments": moments,
            "sunrise": data["sunrise"],
            "sunset": data["sunset"]
        }
    except Exception as e:
        logger.error(f"Error getting planner moments: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/muhurata")
async def get_muhurata(request: MuhurataRequest, current_user: User = Depends(get_current_user)):
    """
    Returns full Muhurata data (Choghadiya, Hora, Vedic, Special) for a given date.
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        jd = get_julian_day(request.date, request.time, request.timezone)
        data = get_muhurata_data(jd, request.latitude, request.longitude)
        return {"success": True, "data": data}
    except Exception as e:
        logger.error(f"Error calculating muhurata: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
