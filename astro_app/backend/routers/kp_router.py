"""
KP Astrology API Router
Provides endpoints for all KP Astrology features.
"""

from fastapi import APIRouter, Depends, HTTPException
from astro_app.backend.schemas import (
    KPChartRequest,
    KPDashaRequest,
    KPCategoryRequest,
    KPAIRequest
)
from astro_app.backend.auth.router import get_current_user
from astro_app.backend.models import User
from astro_app.backend.monetization.access_control import Feature, verify_user_access
from astro_app.backend.astrology.kp.kp_service import KPService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kp", tags=["KP Astrology"])


@router.post("/chart")
async def get_kp_chart(
    request: KPChartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Calculate complete KP chart with planets, house cusps, and significators.
    Includes Star Lord, Sub Lord, and Sub-Sub Lord for all planets and cusps.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    
    try:
        result = KPService.calculate_complete_kp_chart(
            request.birth_details.model_dump()
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating KP chart: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dasha-timeline")
async def get_dasha_timeline(
    request: KPDashaRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Calculate 5-year Dasha timeline with Mahadasha and Antardasha periods.
    Includes exact start/end dates and current running period.
    """
    verify_user_access(current_user, Feature.DASHA)
    
    try:
        result = KPService.calculate_dasha_timeline(
            request.birth_details.model_dump(),
            request.years_ahead
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating Dasha timeline: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/precision-scores")
async def get_precision_scores(
    request: KPChartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Calculate precision percentage scores for all planetary periods.
    Returns color-coded scores (Excellent/Good/Mixed/Weak) based on
    favorable vs unfavorable house significators.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    
    try:
        result = KPService.calculate_precision_scores(
            request.birth_details.model_dump()
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating precision scores: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detailed-predictions")
async def get_detailed_predictions(
    request: KPChartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate detailed predictions for current Dasha period.
    Includes house activations, key events, and caution warnings.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    
    try:
        result = KPService.analyze_detailed_predictions(
            request.birth_details.model_dump()
        )
        return result
    except Exception as e:
        logger.error(f"Error generating detailed predictions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/event-potential")
async def get_event_potential(
    request: KPChartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze potential for various life events (YES/NO).
    Checks: Job Promotion, Foreign Travel, Marriage, Property, etc.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    
    try:
        result = KPService.analyze_event_potential(
            request.birth_details.model_dump()
        )
        return result
    except Exception as e:
        logger.error(f"Error analyzing event potential: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/category-report")
async def get_category_report(
    request: KPCategoryRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate category-wise detailed report.
    Categories: career, love, finance, property, health, fame
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    
    try:
        result = KPService.generate_category_report(
            request.birth_details.model_dump(),
            request.category
        )
        return result
    except Exception as e:
        logger.error(f"Error generating category report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/complete-report")
async def get_complete_report(
    request: KPChartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate complete KP report with all features:
    - Birth Chart Analysis (Rashi + Bhav Chalit)
    - Dasha Period Timeline (5 years)
    - Detailed Predictions
    - Precision Scores
    - Event Potential
    - Category-wise Reports (all 6 categories)
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    
    try:
        result = KPService.generate_complete_report(
            request.birth_details.model_dump()
        )
        return result
    except Exception as e:
        logger.error(f"Error generating complete report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/nakshatra-nadi")
async def get_nakshatra_nadi_analysis(
    request: KPChartRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Perform a comprehensive Nakshatra Nadi analysis based on Pt. Dinesh Guruji's technique.
    Includes Power Positions, Hit Theory Success Rates, and Gender Determination.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    
    try:
        result = KPService.get_nakshatra_nadi_analysis(
            request.birth_details.model_dump()
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating Nakshatra Nadi: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai-insight")
async def get_ai_insight(
    request: KPAIRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered insights for KP/Nadi analysis.
    Supports general period overview and event-specific guidance.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    
    try:
        from astro_app.backend.services.ai_predictions import AIPredictionService
        ai_service = AIPredictionService()
        
        insight = ai_service.generate_nadi_insight(
            dasha_hierarchy=request.dasha_hierarchy,
            event_name=request.event_name,
            significators=request.significators
        )
        
        return {"insight": insight}
    except Exception as e:
        logger.error(f"Error generating AI insight: {e}", exc_info=True)
        return {"insight": "Unable to generate AI insight at this time."}
