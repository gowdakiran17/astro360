from fastapi import APIRouter, Depends, HTTPException
from astro_app.backend.schemas import EliteVastuRequest, BirthDetails
from astro_app.backend.auth.router import get_current_user
from astro_app.backend.models import User
from astro_app.backend.monetization.access_control import verify_user_access, Feature
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.astrology.dasha import calculate_vimshottari_dasha
from astro_app.backend.astrology.transits import calculate_transits
from astro_app.backend.astrology.panchang import get_panchang_data
from astro_app.backend.astrology.utils import get_julian_day
from astro_app.backend.vastu.elite_engine import EliteAstroVastuEngine
from astro_app.backend.vastu.personal_vastu import analyze_personal_vastu
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/personal-profile")
async def get_personal_vastu_profile(birth_details: BirthDetails, current_user: User = Depends(get_current_user)):
    """
    Get Personal Astro-Vastu Profile (No Floor Plan Needed).
    Provides: Sitting Direction, Sleeping Direction, Money Corner, Good/Bad Directions.
    """
    # Assuming basic access or specific feature access
    # verify_user_access(current_user, Feature.ASTRO_VASTU) # Or a lighter feature
    
    try:
        report = analyze_personal_vastu(birth_details)
        return report
    except Exception as e:
        logger.error(f"Error in Personal Vastu Profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analysis")
async def get_elite_vastu_analysis(request: EliteVastuRequest, current_user: User = Depends(get_current_user)):
    """
    Elite Astro-Vastu Intelligence Engine Analysis.
    Correlates Person (Chart) + Space (Vastu) + Time (Dasha) to diagnose blockages.
    """
    verify_user_access(current_user, Feature.ASTRO_VASTU)
    
    try:
        # 1. Calculate Birth Chart
        chart_data = calculate_chart(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude
        )
        
        # 2. Calculate Dasha
        # Find Moon Longitude from chart data
        moon = next((p for p in chart_data["planets"] if p["name"] == "Moon"), None)
        moon_long = moon["longitude"] if moon else 0
        
        dasha_data = await calculate_vimshottari_dasha(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude,
            moon_longitude=moon_long
        )
        
        # 2b. Calculate Current Transits
        now = datetime.now()
        # Note: We use the user's birth location for transit reference relative to their chart
        # ideally we should ask for current location, but birth location is acceptable for house alignment
        transit_data = calculate_transits(
            date_str=now.strftime("%d/%m/%Y"),
            time_str=now.strftime("%H:%M"),
            timezone_str=request.birth_details.timezone,
            latitude=request.birth_details.latitude,
            longitude=request.birth_details.longitude
        )

        # 2c. Calculate Panchang Snapshot
        jd_now = get_julian_day(
            now.day, now.month, now.year, 
            now.hour + now.minute/60.0 + now.second/3600.0,
            float(request.birth_details.timezone.split(":")[0]) # Simple hour offset
        )
        panchang_data = get_panchang_data(jd_now, request.birth_details.latitude, request.birth_details.longitude)
        
        # 3. Prepare Astro Data for Engine
        astro_input = {
            "planets": chart_data["planets"],
            "ascendant": chart_data["ascendant"],
            "houses": chart_data["houses"], # Assuming chart_data includes houses list with signs
            "dasha_lord": dasha_data.get("current_mahadasha"),
            "antardasha_lord": dasha_data.get("current_antardasha"),
            "transits": transit_data,
            "panchang": panchang_data
        }
        
        # 4. Prepare Vastu Data
        vastu_input = {
            "objects": [obj.model_dump() for obj in request.vastu_objects]
        }
        
        # 5. Run Engine
        engine = EliteAstroVastuEngine(astro_input, vastu_input, request.user_intent)
        result = engine.run_analysis()
        
        return result
        
    except Exception as e:
        logger.error(f"Error in Elite Vastu Analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
