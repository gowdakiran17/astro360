from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from astro_app.backend.auth.router import get_current_user
from astro_app.backend.models import User
from astro_app.backend.vastu.astro_vastu import (
    get_astro_vastu_guidance, 
    get_vastu_remedies,
    get_advanced_remedies,
    get_personal_direction_strength,
    analyze_home_energy,
    get_daily_vastu_action,
    get_upcoming_luck_windows
)

router = APIRouter()

class AstroVastuRequest(BaseModel):
    ascendant_sign: str
    current_mahadasha_lord: str

class RemedyRequest(BaseModel):
    defect_type: str
    zone: str

# New Models for Full Analysis
class PlanetData(BaseModel):
    name: str
    zodiac_sign: Optional[str] = None
    house: Optional[int] = None

class ZoneData(BaseModel):
    direction: str
    type: str # Toilet, Kitchen, Bedroom, Entrance, Cut, Extension

class HomeAnalysisRequest(BaseModel):
    planets: List[PlanetData]
    ascendant_sign: str
    moon_sign: str
    dasha_lord: str
    zones: List[ZoneData]
    property_type: Optional[str] = "Residential" # Residential, Office, Shop, Factory, etc.
    custom_weights: Optional[Dict[str, float]] = None

@router.post("/guidance")
async def get_vastu_guidance(request: AstroVastuRequest, current_user: User = Depends(get_current_user)):
    """
    Get personalized Vastu guidance based on Ascendant and Mahadasha.
    """
    try:
        guidance = get_astro_vastu_guidance(request.ascendant_sign, request.current_mahadasha_lord)
        return guidance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/remedies")
async def get_remedy_suggestions(request: RemedyRequest, current_user: User = Depends(get_current_user)):
    """
    Get specific remedies for Vastu defects.
    """
    try:
        # Use advanced remedies for richer data
        advanced = get_advanced_remedies(request.defect_type, request.zone)
        # Fallback to basic if no advanced remedies found (or merge them)
        basic = get_vastu_remedies(request.defect_type, request.zone)
        
        return {
            "defect": basic.get("defect"),
            "simple_remedies": basic.get("remedies"),
            "advanced_remedies": advanced,
            "mantra": basic.get("mantra"),
            "yantra": basic.get("yantra")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analysis")
async def get_home_analysis(request: HomeAnalysisRequest, current_user: User = Depends(get_current_user)):
    """
    Comprehensive Astro-Vastu Home Analysis.
    Combines Chart, Dasha, and Floor Plan Zones.
    """
    try:
        # 1. Calculate Personal Direction Strengths
        # Convert Pydantic models to dicts for internal function
        planets_list = [p.model_dump() for p in request.planets]
        direction_strengths = get_personal_direction_strength(planets_list, request.dasha_lord)
        
        # 2. Analyze Home Energy (Scores & Blocks)
        zones_list = [z.model_dump() for z in request.zones]
        energy_analysis = analyze_home_energy(
            zones_list, 
            direction_strengths, 
            request.property_type,
            request.custom_weights
        )
        
        # 3. Get Daily Action
        daily_action = get_daily_vastu_action(request.moon_sign)
        
        # 4. Get Current Period Guidance
        period_guidance = get_astro_vastu_guidance(request.ascendant_sign, request.dasha_lord)
        
        # 5. Get Upcoming Luck Windows
        luck_windows = get_upcoming_luck_windows(request.moon_sign)
        
        return {
            "success": True,
            "summary": {
                "overall_score": energy_analysis["overall_score"],
                "scores": energy_analysis["scores"],
                "blocks": energy_analysis["blocks"]
            },
            "zone_details": energy_analysis.get("zone_details", []),
            "directions": direction_strengths,
            "daily_action": daily_action,
            "period_guidance": period_guidance,
            "luck_windows": luck_windows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
