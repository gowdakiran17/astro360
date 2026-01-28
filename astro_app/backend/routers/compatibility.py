
"""
Compatibility Router
API Endpoint for Relationship Matching (Synastry).
"""
from fastapi import APIRouter, HTTPException
from astro_app.backend.schemas import CompatibilityRequest
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.engine.core import AstrologyEngine

router = APIRouter()
engine = AstrologyEngine()

@router.post("/analyze")
async def analyze_compatibility(request: CompatibilityRequest):
    """
    Analyze compatibility between two birth charts using AstrologyEngine.
    """
    try:
        # 1. Calculate Charts
        chart1 = calculate_chart(
            request.boy.date, 
            request.boy.time, 
            request.boy.latitude, 
            request.boy.longitude, 
            request.boy.timezone
        )
        
        chart2 = calculate_chart(
            request.girl.date, 
            request.girl.time, 
            request.girl.latitude, 
            request.girl.longitude, 
            request.girl.timezone
        )
        
        # 2. Analyze Compatibility
        # Ensure charts are clean dicts
        if not chart1 or not chart2:
            raise HTTPException(status_code=500, detail="Chart calculation failed")

        result = engine.analyze_compatibility(chart1, chart2)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
