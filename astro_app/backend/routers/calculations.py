from fastapi import APIRouter, Depends, HTTPException
from functools import lru_cache
from typing import List
from astro_app.backend.schemas import (
    BirthDetails, DashaRequest, DivisionalRequest, PeriodRequest,
    ShodashvargaRequest, AshtakvargaRequest, ShadbalaRequest, ShadowPlanetsRequest,
    TransitRequest, AnalysisRequest, LifeTimelineRequest, PredictionRequest, LifePredictorRequest,
    StrengthRequest, KPRequest, MatchRequest, MuhurataRequest, HoraryRequest, RectificationRequest
)
from astro_app.backend.auth.router import get_current_user
from astro_app.backend.models import User
from astro_app.backend.monetization.access_control import verify_user_access, Feature
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.astrology.dasha import calculate_vimshottari_dasha
from astro_app.backend.astrology.divisional import calculate_divisional_charts
from astro_app.backend.astrology.period_analysis import get_full_period_analysis
from astro_app.backend.astrology.sade_sati import calculate_sade_sati_details
from astro_app.backend.astrology.varga_service import get_all_shodashvargas
from astro_app.backend.astrology.ashtakvarga import calculate_ashtakvarga
from astro_app.backend.astrology.shadbala import calculate_shadbala
from astro_app.backend.astrology.basics import get_basic_details
from astro_app.backend.astrology.shadow_planets import calculate_shadow_planets, get_julian_day
from astro_app.backend.astrology.muhurata import get_muhurata_data
from astro_app.backend.astrology.utils import get_nakshatra_pada, parse_timezone
from astro_app.backend.astrology.synthesis import get_combined_analysis

import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/birth")
async def get_birth_chart(details: BirthDetails, current_user: User = Depends(get_current_user)):
    """
    Calculates the Birth Chart (Rasi D1). Requires Basic Chart access.
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        result = calculate_chart(
            details.date,
            details.time,
            details.timezone,
            details.latitude,
            details.longitude
        )
        
        # Calculate Avasthas for 7 main planets
        from astro_app.backend.astrology.avasthas import calculate_all_avasthas
        for p in result["planets"]:
            if p["name"] not in ["Rahu", "Ketu", "Ascendant", "Uranus", "Neptune", "Pluto"]:
                p["avasthas"] = calculate_all_avasthas(p["name"], p["longitude"])
                
        # Calculate Special Points
        from astro_app.backend.astrology.utils import calculate_special_points
        
        # Extract needed longitudes
        asc_lon = result["ascendant"]["longitude"]
        sun_lon = next((p["longitude"] for p in result["planets"] if p["name"] == "Sun"), 0)
        moon_lon = next((p["longitude"] for p in result["planets"] if p["name"] == "Moon"), 0)
        rahu_lon = next((p["longitude"] for p in result["planets"] if p["name"] == "Rahu"), 0)
        
        # Determine day/night birth involves calculating sunrise/sunset which calculate_chart might not strictly return
        # But we can infer or default. Ideally integrate `sunrise` in chart result.
        # Check if Sun is in houses 7-12 (Day) or 1-6 (Night) approx relative to Asc.
        # Or just use simple 6am-6pm logic if time available? No, house position is better.
        # House = int((Sun - Asc) / 30). If 7,8,9,10,11,12 -> Day?
        # Actually: Houses 7 to 12 are above horizon (Day), 1 to 6 below (Night).
        # Relative Longitude:
        diff_sun_asc = (sun_lon - asc_lon) % 360
        is_day = 180 < diff_sun_asc < 360 
        
        result["special_points"] = calculate_special_points(asc_lon, sun_lon, moon_lon, rahu_lon, is_day)

        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error calculating birth chart: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/dasha")
async def get_dasha_details(request: DashaRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates Vimshottari Mahadasha. Requires Mahadasha access.
    """
    verify_user_access(current_user, Feature.MAHADASHA)
    try:
        result = await calculate_vimshottari_dasha(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude,
            moon_longitude=request.moon_longitude,
            ayanamsa=request.ayanamsa or "LAHIRI"
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating dasha: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/divisional")
async def get_divisional_charts(request: DivisionalRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates Divisional Charts (D9, D16). Requires Premium Access.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    try:
        # Convert Pydantic list to list of dicts for the service
        planets_data = [{"name": p.name, "longitude": p.longitude} for p in request.planets]
        birth_dict = request.birth_details.model_dump() if request.birth_details else None
        result = await calculate_divisional_charts(planets_data, birth_dict)
        return result
    except Exception as e:
        logger.error(f"Error calculating divisional charts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/period-analysis")
async def get_period_analysis(
    request: PeriodRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive period analysis for a month
    Uses new VedAstro-based orchestrator with event detection and scoring
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        # Import new orchestrator
        from astro_app.backend.astrology.period_analysis.orchestrator import (
            PeriodAnalysisOrchestrator
        )
        
        # Create orchestrator
        orchestrator = PeriodAnalysisOrchestrator(
            birth_details=request.birth_details.model_dump(), # Use model_dump() for Pydantic v2
            moon_longitude=request.moon_longitude
        )
        
        # Analyze month
        analysis_result = orchestrator.analyze_month(
            year=request.year,
            month=request.month
        )
        
        return analysis_result
        
    except ValueError as e:
        logger.error(f"Validation error in period analysis: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error in period analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/period/overview")
async def get_period_overview(
    request: AnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get Period Analysis Dashboard Overview (Vimsopaka, Shadbala, Dasha, Today's details).
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        # 1. Calculate Moon Longitude (since AnalysisRequest doesn't have it)
        # We can use calculate_chart to get it
        chart_result = calculate_chart(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude
        )
        # Extract Moon Longitude
        moon_lon = 0.0
        for p in chart_result["planets"]:
            if p["name"] == "Moon":
                moon_lon = p["longitude"]
                break
        
        # 2. Initialize Orchestrator
        from astro_app.backend.astrology.period_analysis.orchestrator import PeriodAnalysisOrchestrator
        
        orchestrator = PeriodAnalysisOrchestrator(
            birth_details=request.birth_details.model_dump(),
            moon_longitude=moon_lon
        )
        
        # 3. Get Overview
        result = await orchestrator.get_dashboard_overview(
            target_date_str=request.analysis_date
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error in period dashboard overview: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/period/month")
async def get_period_month(
    request: PeriodRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get Period Analysis for a full month (Day-by-day scores).
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        # 1. Determine Moon Longitude if missing
        moon_lon = request.moon_longitude
        if moon_lon is None:
            chart_result = calculate_chart(
                request.birth_details.date,
                request.birth_details.time,
                request.birth_details.timezone,
                request.birth_details.latitude,
                request.birth_details.longitude
            )
            for p in chart_result["planets"]:
                if p["name"] == "Moon":
                    moon_lon = p["longitude"]
                    break
        
        # 2. Initialize Orchestrator
        from astro_app.backend.astrology.period_analysis.orchestrator import PeriodAnalysisOrchestrator
        
        orchestrator = PeriodAnalysisOrchestrator(
            birth_details=request.birth_details.model_dump(),
            moon_longitude=moon_lon
        )
        
        # 3. Analyze Month
        result = orchestrator.analyze_month(
            month=request.month,
            year=request.year,
            use_parallel=False # Use sync for simplicity/safety
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error in period month analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/period/life-timeline")
async def get_life_timeline(
    request: LifeTimelineRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get multi-year life timeline with VedAstro predictions.
    Returns planetary influences, dasha periods, and major events.
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        from astro_app.backend.services.vedastro_predictor import VedAstroPredictorClient
        from astro_app.backend.astrology.period_analysis.life_predictor import LifePredictorEngine
        from astro_app.backend.astrology.chart import calculate_chart
        
        # 1. Get Moon longitude and Ascendant
        chart_result = calculate_chart(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude
        )
        
        moon_lon = 0.0
        for p in chart_result["planets"]:
            if p["name"] == "Moon":
                moon_lon = p["longitude"]
                break
        
        ascendant_sign = int(chart_result["ascendant"]["longitude"] / 30)
        
        # 2. Get VedAstro Dasha Timeline
        start_date = f"01/01/{request.start_year}"
        end_date = f"31/12/{request.end_year}"
        
        vedastro_timeline = VedAstroPredictorClient.get_dasha_timeline(
            request.birth_details.model_dump(),
            start_date,
            end_date
        )
        
        # 3. Generate Life Predictor Timeline (fallback/enhancement)
        predictor = LifePredictorEngine(
            request.birth_details.model_dump(),
            moon_lon,
            ascendant_sign
        )
        
        life_timeline = await predictor.generate_life_timeline(
            request.start_year,
            request.end_year
        )
        
        # 4. Merge VedAstro and internal predictions
        return {
            "vedastro_timeline": vedastro_timeline,
            "life_timeline": life_timeline["timeline"],
            "major_events": life_timeline["events"],
            "narrative": life_timeline["narrative"],
            "start_year": request.start_year,
            "end_year": request.end_year
        }
        
    except Exception as e:
        logger.error(f"Error generating life timeline: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/period/predictions")
async def get_life_predictions(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get VedAstro life predictions for specific categories.
    Returns probability scores and timing for major life events.
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        from astro_app.backend.services.vedastro_predictor import VedAstroPredictorClient
        
        # Get predictions from VedAstro
        predictions = VedAstroPredictorClient.get_life_predictions(
            request.birth_details.model_dump(),
            request.categories
        )
        
        return {
            "predictions": predictions,
            "birth_details": {
                "date": request.birth_details.date,
                "time": request.birth_details.time,
                "location": f"{request.birth_details.latitude}, {request.birth_details.longitude}"
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching life predictions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/shodashvarga")
async def get_shodashvargas(request: ShodashvargaRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates all 16 Divisional Charts (Shodashvarga). Requires Premium Access.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    try:
        # 1. Calculate Birth Chart (D1) first
        d1_result = calculate_chart(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude
        )
        
        # 2. Extract planets with longitudes
        planets_d1 = [{"name": p["name"], "longitude": p["longitude"]} for p in d1_result["planets"]]
        # Add Ascendant as a planet for varga calculation
        planets_d1.append({"name": "Ascendant", "longitude": d1_result["ascendant"]["longitude"]})
        
        # 3. Calculate all vargas
        result = await get_all_shodashvargas(planets_d1, request.birth_details.model_dump())
        
        # 4. Include D1 data for convenience
        return {
            "vargas": result,
            "d1_data": d1_result
        }
    except Exception as e:
        logger.error(f"Error calculating shodashvargas: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/ashtakvarga")
async def get_ashtakvarga_strength(request: AshtakvargaRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates Ashtakvarga Strength (BAV & SAV).
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS) # Using same feature flag for now
    try:
        # 1. Calculate Birth Chart (D1)
        d1_result = calculate_chart(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude
        )
        
        # 2. Extract planets and ascendant
        planets_d1 = [{"name": p["name"], "longitude": p["longitude"]} for p in d1_result["planets"]]
        ascendant_sign_idx = int(d1_result["ascendant"]["longitude"] / 30)
        
        # 3. Calculate Ashtakvarga
        ashtakvarga_data = calculate_ashtakvarga(planets_d1, ascendant_sign_idx)
        
        return ashtakvarga_data
    except Exception as e:
        logger.error(f"Error calculating ashtakvarga: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/shadbala")
async def get_shadbala_energy(request: ShadbalaRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates Shadbala Strength (6 Sources of Energy).
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    try:
        # 1. Calculate Birth Chart (D1)
        d1_result = calculate_chart(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude
        )
        
        # 2. Extract planets and ascendant
        planets_d1 = [{"name": p["name"], "longitude": p["longitude"]} for p in d1_result["planets"]]
        ascendant_sign_idx = int(d1_result["ascendant"]["longitude"] / 30)
        
        # 3. Calculate Shadbala
        shadbala_data = await calculate_shadbala(planets_d1, ascendant_sign_idx, request.birth_details.model_dump())
        
        # 4. Calculate Bhava Bala (House Strength)
        from astro_app.backend.astrology.strength import calculate_bhava_bala
        bhava_data = calculate_bhava_bala(d1_result, shadbala_data)
        
        return {
            "shadbala": shadbala_data,
            "bhava_bala": bhava_data
        }
    except Exception as e:
        logger.error(f"Error calculating shadbala: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/muhurata")
async def get_muhurata(request: ShadbalaRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates Muhurata (Choghadiya, Hora, etc.).
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        jd = get_julian_day(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone
        )
        # Use robust parse_timezone
        # tz_offset = parse_timezone(request.birth_details.timezone)
        
        result = get_muhurata_data(
            jd, 
            request.birth_details.latitude, 
            request.birth_details.longitude
        )
        return {"data": result}
    except Exception as e:
        logger.error(f"Error calculating muhurata: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/shadow-planets")
async def get_shadow_planets(request: ShadowPlanetsRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates the 11 Shadow Planets (Aprakasha and Upagrahas).
    Requires Divisional Charts access.
    """
    verify_user_access(current_user, Feature.DIVISIONAL_CHARTS)
    try:
        jd = get_julian_day(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone
        )
        # Use robust parse_timezone
        tz_offset = parse_timezone(request.birth_details.timezone)
        
        shadow_planets = calculate_shadow_planets(
            jd, 
            request.birth_details.latitude, 
            request.birth_details.longitude,
            tz_offset
        )
        return shadow_planets
    except Exception as e:
        logger.error(f"Error calculating shadow planets: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/basics")
async def get_basic_details_route(details: BirthDetails, current_user: User = Depends(get_current_user)):
    """
    Calculates Basic Details (Person, Avkahada, Favourable, Ghatak).
    Requires Basic Chart access.
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        # Convert Pydantic model to dict
        result = get_basic_details(details.model_dump())
        return result
    except Exception as e:
        logger.error(f"Error calculating basic details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/transits")
async def get_transits(request: TransitRequest, current_user: User = Depends(get_current_user)):
    """
    Calculates the current planetary transits for a given time and location.
    Includes Nakshatra Padas and Retrograde status.
    """
    try:
        # We can reuse calculate_chart as it already handles Lahiri sidereal calculations
        result = calculate_chart(
            request.date,
            request.time,
            request.timezone,
            request.latitude,
            request.longitude
        )
        
        # Add Pada information to planets
        for p in result["planets"]:
            p["pada"] = get_nakshatra_pada(p["longitude"])
            
        result["location_details"] = {
            "name": request.location_name,
            "latitude": request.latitude,
            "longitude": request.longitude
        }
        
        return result
    except Exception as e:
        logger.error(f"Error calculating transits: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/comprehensive-analysis")
async def get_comprehensive_analysis(request: AnalysisRequest, current_user: User = Depends(get_current_user)):
    """
    Generates a comprehensive astrological analysis combining Vimshottari Dasha and Transits.
    Requires Detailed Interpretation access.
    """
    verify_user_access(current_user, Feature.DETAILED_INTERPRETATION)
    try:
        result = await get_combined_analysis(
            request.birth_details.model_dump(),
            request.analysis_date,
            ayanamsa=request.ayanamsa or "LAHIRI"
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating comprehensive analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")



@router.post("/sade-sati")
async def get_sade_sati(details: BirthDetails, current_user: User = Depends(get_current_user)):
    """
    Calculates detailed Sade Sati analysis including phases and timelines.
    Requires Basic Chart access.
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        # 1. Calculate Birth Chart to get Moon Sign
        chart_result = calculate_chart(
            details.date,
            details.time,
            details.timezone,
            details.latitude,
            details.longitude
        )
        
        # 2. Find Moon's Longitude and Sign Index
        moon_lon = 0.0
        for p in chart_result["planets"]:
            if p["name"] == "Moon":
                moon_lon = p["longitude"]
                break
        
        moon_sign_index = int(moon_lon / 30)
        
        # 3. Calculate Sade Sati Details
        # Note: calculate_sade_sati_details expects a datetime object for birth_date
        # We need to construct it from the input string
        from datetime import datetime
        try:
            birth_dt = datetime.strptime(f"{details.date} {details.time}", "%d/%m/%Y %H:%M")
        except ValueError:
             # Fallback or try ISO format if needed, but assuming schema validation holds
             # If format differs, we might need robust parsing. 
             # Let's try standard format first.
             birth_dt = datetime.now() # Fallback to avoid crash, but should handle error

        result = calculate_sade_sati_details(birth_dt, moon_sign_index)
        return result
    except Exception as e:
        logger.error(f"Error calculating Sade Sati: {e}", exc_info=True)
        result = calculate_sade_sati_details(birth_dt, moon_sign_index)
        return result
    except Exception as e:
        logger.error(f"Error calculating Sade Sati: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# Import new schemas
from astro_app.backend.schemas import MuhurtaSearchRequest, IngressRequest

@router.post("/muhurata/find")
async def find_muhurata_moments(request: MuhurtaSearchRequest, current_user: User = Depends(get_current_user)):
    """
    Search for auspicious Muhurta moments in a date range.
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        from astro_app.backend.astrology.muhurata import find_muhurata
        
        # Default target quality if not provided
        quality = request.target_quality if request.target_quality else ["Excellent", "Good"]
        
        results = find_muhurata(
            request.date, 
            request.end_date, 
            request.latitude, 
            request.longitude,
            quality
        )
        return {"results": results}
    except Exception as e:
        logger.error(f"Error searching muhurta: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/transits/ingress")
async def check_transit_ingress(request: IngressRequest, current_user: User = Depends(get_current_user)):
    """
    Check for Nakshatra Ingress (change) for a planet around a date.
    """
    verify_user_access(current_user, Feature.BASIC_CHART) # Check plan level
    try:
        from astro_app.backend.astrology.transits import check_nakshatra_ingress
        
        shifts = check_nakshatra_ingress(
            request.planet,
            request.current_date,
            request.timezone,
            request.window_days
        )
        return {"shifts": shifts if shifts else []}
    except Exception as e:
        logger.error(f"Error checking ingress: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/life-predictor")
async def get_life_predictor(
    request: LifePredictorRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get Advanced Life Predictor timeline with daily favorability and moments.
    Combines VedAstro long-term predictions with high-granularity local scoring.
    """
    verify_user_access(current_user, Feature.BASIC_CHART)
    try:
        from astro_app.backend.services.vedastro_predictor import VedAstroPredictorClient
        from datetime import datetime, timedelta
        
        # 1. Parse dates and details
        start_date = request.start_date
        if start_date is None:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
        end_date = request.end_date
        if end_date is None:
            end_date = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
        
        # Prepare birth details for Engine
        birth_dict = {
            "date": request.birth_details.date,
            "time": request.birth_details.time,
            "timezone": request.birth_details.timezone,
            "latitude": request.birth_details.latitude,
            "longitude": request.birth_details.longitude,
            "location": getattr(request.birth_details, "location", "Unknown"),
            "gender": getattr(request.birth_details, "gender", "male")
        }

        # 2. Initialize Local Engine
        # We need natal Moon and Ascendant
        natal_chart = calculate_chart(
            birth_dict["date"], birth_dict["time"], birth_dict["timezone"],
            birth_dict["latitude"], birth_dict["longitude"]
        )
        moon_long = natal_chart["ascendant"]["longitude"] # Defaulting? No, let's find Moon.
        for p in natal_chart["planets"]:
            if p["name"] == "Moon":
                moon_long = p["longitude"]
                break
        asc_sign = int(natal_chart["ascendant"]["longitude"] / 30)
        
        engine = LifePredictorEngine(natal_chart, moon_long, asc_sign)
        
        # 3. Generate Local Predictions
        # Timeline (Monthly)
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        local_timeline = await engine.generate_life_timeline(start_dt.year, end_dt.year)
        
        # Advanced Today (Daily Moments)
        today_prediction = await engine.get_advanced_day_prediction(datetime.now())

        # 4. Fetch VedAstro Timeline (Optional/Secondary)
        try:
            vedastro_result = VedAstroPredictorClient.get_life_predictor_timeline(
                birth_dict, start_date, end_date, None
            )
        except:
            vedastro_result = {"status": "error"}

        # 5. Merge and Return
        return {
            "status": "success",
            "timeline": local_timeline["timeline"],
            "events": local_timeline["events"],
            "today_advanced": today_prediction,
            "narrative": local_timeline["narrative"],
            "vedastro_raw": vedastro_result.get("Payload") if vedastro_result.get("status") == "success" else None,
            "metadata": {
                "start_date": start_date,
                "end_date": end_date,
                "natal_asc": natal_chart["ascendant"]["zodiac_sign"],
                "natal_moon_nak": [p["nakshatra"] for p in natal_chart["planets"] if p["name"] == "Moon"][0]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating life predictor: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

