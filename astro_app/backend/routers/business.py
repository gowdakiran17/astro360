from fastapi import APIRouter, HTTPException, Query, Depends
from datetime import datetime, timedelta, timezone
import pytz
from typing import List, Optional
from pydantic import BaseModel
import time

from ..astrology.chart import calculate_chart
from ..astrology.utils import get_zodiac_sign, get_nakshatra, parse_timezone
from ..astrology.wealth import analyze_wealth_profile
from ..astrology.market_engine import get_market_overlay
from ..astrology.gann_engine import (
    get_gann_intelligence,
    analyze_gann_market_timing,
    analyze_personal_overlay,
    derive_market_signal_for_date,
    derive_personalized_signal,
    backtest_gann_time_windows,
)
from ..astrology.performance_engine import PerformanceEngine, get_performance_engine
from ..astrology.asset_engine import get_asset_intelligence, ASSET_DNA
from ..services.live_data import LiveDataService
from ..database import get_db
from ..models import MarketSignal, User
from ..auth.router import get_current_user
from ..monetization.access_control import verify_user_access, Feature
from sqlalchemy.orm import Session
import logging
import os
import json

# Import AI Providers
try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    import openai
except ImportError:
    openai = None

from ..astrology.external_api import astrology_api_service

# Setup Logger
logger = logging.getLogger(__name__)

router = APIRouter()
live_service = LiveDataService()

class FinancialProfileRequest(BaseModel):
    date: str
    time: str
    location: str
    latitude: float
    longitude: float
    timezone: str

class AssetAnalysisRequest(BaseModel):
    user_profile: dict
    asset_name: str
    latitude: float = 40.7128
    longitude: float = -74.0060
    timezone: str = "+00:00"

class FinancialProfileResponse(BaseModel):
    persona: dict
    scores: dict
    traits: dict
    insights: List[str]
    wealth_engine: dict
    recommendation: dict

@router.post("/financial-profile", response_model=FinancialProfileResponse)
async def get_financial_profile(data: FinancialProfileRequest):
    """
    Generate a personal financial personality profile based on birth chart.
    Uses external API if available for high-precision business data.
    """
    try:
        # 1. Try external API fallback first
        external_profile = await astrology_api_service.get_financial_profile(data.model_dump())
        if external_profile:
            logger.info("Successfully fetched financial profile from astrology-api.io")
            return external_profile

        # 2. Fallback to local calculation
        # Calculate Birth Chart
        chart = calculate_chart(data.date, data.time, data.timezone, data.latitude, data.longitude)
        
        # Analyze Wealth Profile
        profile = analyze_wealth_profile(chart)
        
        return profile
    except Exception as e:
        logger.error(f"Error in get_financial_profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


class IntelligenceCard(BaseModel):
    title: str
    status: str # "active", "neutral", "risk", "opportunity"
    message: str
    details: List[str]

class MarketTimingResponse(BaseModel):
    date: str
    transits: List[dict]
    insights: List[dict]
    summary: str

@router.get("/market-timing", response_model=MarketTimingResponse)
async def get_market_timing(
    lat: float = 40.7128, # Default to New York
    lon: float = -74.0060,
    timezone: str = "-05:00"
):
    """
    Get market timing intelligence based on current planetary transits.
    Defaults to New York coordinates for 'Market' time.
    Uses external API for high-precision panchang data if available.
    """
    
    # Get current time in the requested timezone
    offset_hours = parse_timezone(timezone)
    utc_now = datetime.now(pytz.utc)
    local_now = utc_now + timedelta(hours=offset_hours)
    
    date_str = local_now.strftime("%d/%m/%Y")
    time_str = local_now.strftime("%H:%M")
    
    # 1. Try external API for Panchang/Sentiment first
    date_details = {
        "date": date_str,
        "latitude": lat,
        "longitude": lon,
        "timezone": timezone
    }
    
    external_panchang = await astrology_api_service.get_panchang(date_details)
    
    # Calculate Transit Chart
    try:
        transit_chart = calculate_chart(date_str, time_str, timezone, lat, lon)
    except Exception as e:
        logger.error(f"Error calculating transit chart: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    # Analyze Transits for Market Signals
    insights = []
    summary_points = []
    
    # If we have external panchang, use it to enhance insights
    if external_panchang:
        logger.info("Successfully fetched panchang from astrology-api.io for market timing")
        # Add Tithi, Yoga, Karana insights if available
        tithi = external_panchang.get("tithi", {}).get("name")
        if tithi:
            insights.append({
                "type": "info",
                "title": f"Tithi: {tithi}",
                "description": f"The lunar day {tithi} influences the overall market mood.",
                "intensity": "medium"
            })

    planets = {p['name']: p for p in transit_chart['planets']}
    
    # 1. Mercury Analysis (Communication, Contracts, Trading Volume)
    mercury = planets.get('Mercury')
    if mercury:
        if mercury['is_retrograde']:
            insights.append({
                "type": "risk",
                "title": "Mercury Retrograde",
                "description": "High volatility expected. Algorithms may misfire. Avoid signing major long-term deals.",
                "intensity": "high"
            })
            summary_points.append("Caution: Mercury Retrograde")
        else:
            insights.append({
                "type": "neutral",
                "title": "Mercury Direct",
                "description": "Normal trading communications.",
                "intensity": "low"
            })

    # 2. Jupiter Analysis (Expansion, Optimism, Bull Markets)
    jupiter = planets.get('Jupiter')
    if jupiter:
        sign = jupiter['zodiac_sign']
        insights.append({
            "type": "opportunity",
            "title": f"Jupiter in {sign}",
            "description": f"Market sentiment leans towards {sign} themes.",
            "intensity": "medium"
        })
        if not jupiter['is_retrograde']:
             summary_points.append("Bullish underlying sentiment")

    # 3. Saturn Analysis (Restriction, Fear, Regulation)
    saturn = planets.get('Saturn')
    if saturn:
        if saturn['is_retrograde']:
             insights.append({
                "type": "risk",
                "title": "Saturn Retrograde",
                "description": "Regulatory reviews and structural market corrections likely.",
                "intensity": "medium"
            })

    # 4. Moon Analysis (Daily Sentiment)
    moon = planets.get('Moon')
    if moon:
        nakshatra = moon['nakshatra']
        insights.append({
            "type": "info",
            "title": f"Moon in {nakshatra}",
            "description": f"Daily sentiment colored by {nakshatra} energy.",
            "intensity": "low"
        })

    # 5. Rahu/Ketu (Innovation vs Confusion)
    rahu = planets.get('Rahu')
    if rahu and rahu['zodiac_sign'] in ['Aries', 'Leo', 'Sagittarius']: # Fire signs
        insights.append({
            "type": "opportunity",
            "title": "Rahu in Fire Sign",
            "description": "Aggressive growth in tech and crypto sectors.",
            "intensity": "high"
        })

    summary = " | ".join(summary_points) if summary_points else "Market conditions are neutral."

    return {
        "date": local_now.isoformat(),
        "transits": transit_chart['planets'],
        "insights": insights,
        "summary": summary
    }

import random
import math

# ... (existing imports)

class AssetData(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    trend: str

class LiveFeedResponse(BaseModel):
    timestamp: str
    assets: List[AssetData]
    volatility_index: float # 0-100 based on astrology
    market_mood: str # "Bullish", "Bearish", "Volatile", "Neutral"
    active_signals: List[dict]

def calculate_cosmic_volatility(planets: dict) -> float:
    """
    Calculate a volatility index (0-100) based on planetary positions.
    """
    volatility = 40.0 # Base volatility
    
    # Mercury Retrograde adds significant volatility
    if planets.get('Mercury', {}).get('is_retrograde'):
        volatility += 20
        
    # Moon in Fire Signs (Aries, Leo, Sagittarius) -> Impulsive/Volatile
    moon_sign = planets.get('Moon', {}).get('zodiac_sign', '')
    if moon_sign in ['Aries', 'Leo', 'Sagittarius']:
        volatility += 15
    elif moon_sign in ['Scorpio']: # Emotional intensity
        volatility += 10
        
    # Rahu influences (Unpredictability)
    # Simplified: If Rahu is in Fire/Air signs
    rahu_sign = planets.get('Rahu', {}).get('zodiac_sign', '')
    if rahu_sign in ['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius']:
        volatility += 10
        
    # Saturn Aspect (Restriction/Fear) - Reduces volatility or causes crashes
    # For simplicity, if Saturn is Retrograde -> Structural instability
    if planets.get('Saturn', {}).get('is_retrograde'):
        volatility += 10
        
    return min(100.0, volatility)

def get_market_mood(planets: dict) -> str:
    """
    Determine general market sentiment.
    """
    jupiter = planets.get('Jupiter', {})
    saturn = planets.get('Saturn', {})
    moon = planets.get('Moon', {})
    
    score = 0
    
    # Jupiter = Optimism
    if jupiter.get('zodiac_sign') in ['Sagittarius', 'Pisces', 'Cancer', 'Aries', 'Leo']:
        score += 2
    if not jupiter.get('is_retrograde'):
        score += 1
        
    # Saturn = Pessimism/Caution
    if saturn.get('zodiac_sign') in ['Capricorn', 'Aquarius', 'Libra']:
        score -= 1 # Stable/Realistic
    else:
        score -= 2 # Harsh
        
    # Moon Phase (Waxing = Growth, Waning = Caution)
    # We don't have phase explicitly in this simplified dict, use Nakshatra or Sign proxy
    # Fire/Air Moon -> Bullish/Active
    if moon.get('zodiac_sign') in ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius']:
        score += 1
    else:
        score -= 1
        
    if score >= 2: return "Bullish"
    if score <= -2: return "Bearish"
    if planets.get('Mercury', {}).get('is_retrograde'): return "Volatile"
    return "Neutral"

@router.get("/live-feed", response_model=LiveFeedResponse)
def get_realtime_feed(
    lat: float = 40.7128,
    lon: float = -74.0060,
    timezone: str = "-05:00",
    symbols: List[str] = Query(["BTC-USD", "^GSPC"]),
    db: Session = Depends(get_db)
):
    """
    Get real-time market prediction feed based on live astrological transits AND live market data.
    """
    
    # Get current time in the requested timezone
    offset_hours = parse_timezone(timezone)
    utc_now = datetime.now(pytz.utc)
    local_now = utc_now + timedelta(hours=offset_hours)
    
    date_str = local_now.strftime("%d/%m/%Y")
    time_str = local_now.strftime("%H:%M")
    
    logger.info(f"Live Feed Request: lat={lat}, lon={lon}, symbols={symbols}")

    try:
        # 1. Calculate Astrology Factors
        transit_chart = calculate_chart(date_str, time_str, timezone, lat, lon)
        planets = {p['name']: p for p in transit_chart['planets']}
        
        cosmic_volatility = calculate_cosmic_volatility(planets)
        mood = get_market_mood(planets)
        
        # 2. Fetch Live Market Data
        assets_data = []
        
        # Helper map for display names
        name_map = {
            "BTC-USD": "Bitcoin",
            "^GSPC": "S&P 500",
            "ETH-USD": "Ethereum",
            "SOL-USD": "Solana",
            "AAPL": "Apple",
            "TSLA": "Tesla",
            "NVDA": "NVIDIA",
            "MSFT": "Microsoft",
            "GOOGL": "Google",
            "AMZN": "Amazon",
            "META": "Meta",
            "AMD": "AMD",
            "^IXIC": "Nasdaq",
            "GC=F": "Gold",
            "SI=F": "Silver"
        }

        for symbol in symbols:
            try:
                # Simple heuristic for asset type
                asset_type = "Crypto" if "-" in symbol and ("USD" in symbol or "USDT" in symbol) else "Stock"
                
                data = live_service.get_market_data(symbol, asset_type)
                
                assets_data.append(AssetData(
                    symbol=symbol,
                    name=name_map.get(symbol, symbol),
                    price=data['price'],
                    change=data['change_percent'],
                    trend=data['trend']
                ))
            except Exception as e:
                logger.error(f"Failed to fetch data for {symbol}: {e}")
                # Add placeholder/error state if needed, or just skip
                assets_data.append(AssetData(
                    symbol=symbol,
                    name=name_map.get(symbol, symbol),
                    price=0.0,
                    change=0.0,
                    trend="Error"
                ))

        # 3. Generate Signals
        signals = []
        
        transit_aspects = transit_chart.get('aspects', [])
        for aspect in transit_aspects:
            p1, p2 = aspect['p1'], aspect['p2']
            angle = aspect['angle']
            
            # Simple Astrological Signals
            if "Jupiter" in [p1, p2] and "Venus" in [p1, p2] and abs(angle - 120) < 5:
                signals.append({
                    "title": "Jupiter Trine Venus",
                    "type": "Bullish",
                    "description": "Excellent aspect for wealth and expansion."
                })
            
            if "Mars" in [p1, p2] and "Saturn" in [p1, p2] and abs(angle - 90) < 5:
                signals.append({
                    "title": "Mars Square Saturn",
                    "type": "Bearish",
                    "description": "Frustration and restriction. Caution advised."
                })
            
            if "Mercury" in [p1, p2] and "Uranus" in [p1, p2] and abs(angle - 0) < 5:
                signals.append({
                    "title": "Mercury Conjunct Uranus",
                    "type": "Volatile",
                    "description": "Sudden news and erratic market movements."
                })

        return {
            "timestamp": utc_now.isoformat(),
            "assets": assets_data,
            "volatility_index": float(cosmic_volatility),
            "market_mood": mood,
            "active_signals": signals
        }
        
    except Exception as e:
        logger.error(f"Critical error in live-feed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crypto-signals")
def get_crypto_signals():
    # Placeholder for Crypto Intelligence
    return {
        "bitcoin_phase": "Accumulation",
        "altcoin_season": False,
        "volatility_index": "High",
        "fear_greed": "Fear"
    }

@router.post("/market-overlay")
def get_personal_overlay(data: FinancialProfileRequest):
    """
    Generates a Live Market Overlay combining User Suitability + Market State + Planetary Cycles.
    """
    try:
        # 1. User Profile (Static Suitability)
        user_chart = calculate_chart(data.date, data.time, data.timezone, data.latitude, data.longitude)
        user_profile = analyze_wealth_profile(user_chart)
        
        # 2. Current Transits (Dynamic)
        # Use current time at user's location for "My Time" perspective
        now = datetime.now() # Server time (local), but we need accurate transits.
        # Ideally we use UTC or User's Local Time. 
        # Let's assume we want "Now" relative to the request.
        # We'll use the server's current UTC time converted to User's timezone if possible, 
        # or just use User's provided lat/lon with current UTC.
        
        # Using UTC for transits is safest.
        now_utc = datetime.utcnow()
        date_str = now_utc.strftime("%d/%m/%Y")
        time_str = now_utc.strftime("%H:%M")
        
        # Transits for User's Location (affects Ascendant/Houses if we used them, but mostly Planet signs are global)
        transit_chart = calculate_chart(date_str, time_str, "+00:00", data.latitude, data.longitude)
        
        # 3. Market Data (Mock/Live)
        # Construct from global MARKET_STATE + Volatility Logic
        # We can reuse calculate_cosmic_volatility to get "Market Volatility" input
        transit_planets = {p['name']: p for p in transit_chart['planets']}
        cosmic_vol = calculate_cosmic_volatility(transit_planets)
        mood = get_market_mood(transit_planets)
        
        # Determine Trends based on Mood (Simulated for now, would come from live API)
        crypto_trend = "Range"
        stock_trend = "Range"
        if mood == "Bullish":
            crypto_trend = "Bull"
            stock_trend = "Bull"
        elif mood == "Bearish":
            crypto_trend = "Bear"
            stock_trend = "Bear"
            
        # Fetch Live Prices with Fallback
        try:
            btc_price = live_service.get_market_data("Bitcoin", "Crypto").get('price', 50000)
        except Exception:
            btc_price = 50000

        try:
            spx_price = live_service.get_market_data("S&P 500", "Stock").get('price', 4000)
        except Exception:
            spx_price = 4000

        market_data = {
            "volatility": cosmic_vol, # Use cosmic volatility as proxy for market vol
            "crypto_trend": crypto_trend,
            "stock_trend": stock_trend,
            "btc_price": btc_price,
            "spx_price": spx_price
        }
        
        # 4. Run Engine
        overlay = get_market_overlay(user_profile, transit_chart, market_data)
        
        return overlay
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance-stats")
def get_performance_stats(db: Session = Depends(get_db)):
    """
    Returns the audited performance metrics of the Astro Engine.
    """
    engine = PerformanceEngine(db)
    stats_data = engine.get_stats()
    trust_msg = engine.get_trust_message()
    
    # engine.get_stats() returns a dict with 'metrics', 'validation', etc.
    # We want to return those top-level keys directly.
    return {
        "metrics": stats_data.get("metrics", {}),
        "ai_explanation": trust_msg,
        "validation": stats_data.get("validation", {
            "high_suitability_win_rate": 0,
            "low_suitability_win_rate": 0
        }),
        "control_group_win_rate": stats_data.get("control_group_win_rate", 0),
        "alpha_vs_control": stats_data.get("alpha_vs_control", 0)
    }

@router.get("/assets/list")
def get_available_assets():
    """
    Returns list of supported assets for the selector.
    """
    assets = list(ASSET_DNA.keys())
    return {"assets": sorted(assets)}

@router.post("/asset-analysis")
def analyze_asset(
    data: AssetAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Runs the deep-dive Asset Intelligence Engine.
    """
    # Enforce Subscription
    verify_user_access(current_user, Feature.ASSET_INTELLIGENCE)

    logger.info(f"Asset Analysis Request: User={current_user.email}, Asset={data.asset_name}")

    try:
        # Get Current Transits
        now_utc = datetime.utcnow()
        date_str = now_utc.strftime("%d/%m/%Y")
        time_str = now_utc.strftime("%H:%M")
        
        transit_chart = calculate_chart(date_str, time_str, "+00:00", data.latitude, data.longitude)
        
        # Fetch Live Market Data for the Asset
        live_data = None
        try:
            # Determine asset type from name (simple heuristic or lookup)
            # For now, check ASSET_DNA keys or default to Stock
            asset_type = "Stock"
            if data.asset_name in ["Bitcoin", "Ethereum", "Solana", "Cardano", "XRP", "Dogecoin"]:
                asset_type = "Crypto"
                
            market_info = live_service.get_market_data(data.asset_name, asset_type)
            live_data = {
                "live_price": market_info.get("price"),
                "live_change": market_info.get("change_percent"),
                "trend": market_info.get("trend", "Neutral")
            }
        except Exception as e:
            logger.warning(f"Failed to fetch live data for {data.asset_name}: {e}")
        
        result = get_asset_intelligence(data.user_profile, transit_chart, data.asset_name, live_market_data=live_data)
        
        logger.info(f"Asset Analysis Result for {data.asset_name}: {result.get('recommendation', {}).get('status')}")
        return result
        
    except Exception as e:
        logger.error(f"Asset Analysis Failed for {data.asset_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class GannAnalysisResponse(BaseModel):
    # Backward compatibility
    signatures: Optional[List[dict]] = None
    gann_levels: Optional[dict] = None
    planetary_harmonics: Optional[List[dict]] = None
    date: str
    
    # New Fields
    asset: Optional[str] = None
    trend: Optional[str] = None
    phase: Optional[str] = None
    trade_type: Optional[str] = None
    next_turn: Optional[dict] = None
    next_breakout: Optional[dict] = None
    crash_risk: Optional[dict] = None
    windows: Optional[List[dict]] = None
    triggers: Optional[List[dict]] = None
    accuracy: Optional[dict] = None
    personal_overlay: Optional[dict] = None
    as_of_date: Optional[str] = None
    base_signal: Optional[dict] = None
    personalized_signal: Optional[dict] = None
    timings_ms: Optional[dict] = None

class GannAIChatRequest(BaseModel):
    question: str
    asset: str
    gann_data: dict
    birth_details: Optional[dict] = None

@router.get("/gann-intelligence", response_model=GannAnalysisResponse)
async def get_gann_analysis(
    lat: float = 40.7128,
    lon: float = -74.0060,
    timezone: str = "-05:00",
    price: Optional[float] = None,
    asset: Optional[str] = None,
    market_type: str = "Crypto",
    as_of_date: Optional[str] = None,
    include_timings: bool = False,
    birth_date: Optional[str] = None,
    birth_time: Optional[str] = None,
    birth_timezone: Optional[str] = None,
    birth_lat: Optional[float] = None,
    birth_lon: Optional[float] = None
):
    """
    Get specialized Gann Trading Intelligence:
    - Support/Resistance Levels (Square of 9)
    - Planetary Harmonics (Price = Time)
    - Cycle Signatures (Retrogrades, Ingress, Mars-Saturn)
    - [NEW] Time-Based Market Timing Analysis
    """
    
    # Get current time in the requested timezone
    offset_hours = parse_timezone(timezone)
    
    if as_of_date:
        try:
            # as_of_date is YYYY-MM-DD
            target_dt = datetime.strptime(as_of_date, "%Y-%m-%d")
            # Use midday for as_of_date calculations if time not provided
            date_str = target_dt.strftime("%d/%m/%Y")
            time_str = "12:00"
            local_now_iso = target_dt.isoformat()
        except Exception:
            utc_now = datetime.now(pytz.utc)
            local_now = utc_now + timedelta(hours=offset_hours)
            date_str = local_now.strftime("%d/%m/%Y")
            time_str = local_now.strftime("%H:%M")
            local_now_iso = local_now.isoformat()
    else:
        utc_now = datetime.now(pytz.utc)
        local_now = utc_now + timedelta(hours=offset_hours)
        date_str = local_now.strftime("%d/%m/%Y")
        time_str = local_now.strftime("%H:%M")
        local_now_iso = local_now.isoformat()
    
    try:
        timings = {} if include_timings else None
        t0 = time.perf_counter() if include_timings else None
        transit_chart = calculate_chart(date_str, time_str, timezone, lat, lon)
        if include_timings:
            timings["calculate_chart"] = round((time.perf_counter() - t0) * 1000, 2)
        planets = transit_chart['planets']
        
        # Base Gann Data (Price/Cycle)
        t1 = time.perf_counter() if include_timings else None
        gann_data = get_gann_intelligence(planets, price)
        if include_timings:
            timings["get_gann_intelligence"] = round((time.perf_counter() - t1) * 1000, 2)
        gann_data['date'] = local_now_iso
        gann_data["as_of_date"] = as_of_date or datetime.now().strftime("%Y-%m-%d")
        
        # Enhanced Time Analysis (if asset is provided, or default)
        if asset:
            t2 = time.perf_counter() if include_timings else None
            time_analysis = analyze_gann_market_timing(asset, market_type)
            gann_data.update(time_analysis)
            if include_timings:
                timings["analyze_gann_market_timing"] = round((time.perf_counter() - t2) * 1000, 2)
            
        # Personal Overlay (if birth details provided)
        if birth_date and birth_time:
            trend = gann_data.get("trend", "Neutral")
            t3 = time.perf_counter() if include_timings else None
            overlay = await analyze_personal_overlay(
                birth_date, 
                birth_time, 
                birth_timezone or timezone, 
                birth_lat or lat, 
                birth_lon or lon, 
                trend, 
                planets,
                market_type=market_type,
                asset=asset
            )
            gann_data['personal_overlay'] = overlay
            if include_timings:
                timings["analyze_personal_overlay"] = round((time.perf_counter() - t3) * 1000, 2)

        base = derive_market_signal_for_date(gann_data["as_of_date"], gann_data.get("windows"), gann_data.get("next_turn"))
        gann_data["base_signal"] = base
        personal_score = None
        if isinstance(gann_data.get("personal_overlay"), dict):
            personal_score = gann_data["personal_overlay"].get("score")
        gann_data["personalized_signal"] = derive_personalized_signal(base.get("signal"), personal_score)

        if include_timings:
            gann_data["timings_ms"] = timings
        
        return gann_data
        
    except Exception as e:
        logger.error(f"Gann Analysis Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gann-intelligence/backtest")
def gann_intelligence_backtest(
    asset: str = "Bitcoin",
    market_type: str = "Crypto",
    lookback_days: int = 365,
    horizon_days: int = 5
):
    tickers = {
        "Bitcoin": "BTC-USD",
        "Ethereum": "ETH-USD",
        "Solana": "SOL-USD",
        "XRP": "XRP-USD",
        "Dogecoin": "DOGE-USD",
        "S&P 500": "^GSPC",
        "Nasdaq": "^IXIC",
        "Dow Jones": "^DJI",
        "NIFTY 50": "^NSEI",
        "Apple": "AAPL",
        "Tesla": "TSLA",
        "NVIDIA": "NVDA",
        "Reliance": "RELIANCE.NS",
        "TCS": "TCS.NS"
    }
    ticker = tickers.get(asset, asset)
    try:
        return backtest_gann_time_windows(
            ticker=ticker,
            market_type=market_type,
            lookback_days=lookback_days,
            horizon_days=horizon_days
        )
    except Exception as e:
        logger.error(f"Gann Backtest Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gann-ai-chat")
async def gann_ai_chat(request: GannAIChatRequest):
    """
    AI Chat specialized for Gann Trading Intelligence.
    Integrates Gann cycle data, market signals, and personal birth details.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # Construct context-rich prompt
    gann_ctx = {
        "asset": request.asset,
        "trend": request.gann_data.get("trend"),
        "phase": request.gann_data.get("phase"),
        "signals": request.gann_data.get("signatures", []),
        "levels": request.gann_data.get("gann_levels", {}),
        "windows": request.gann_data.get("windows", [])[:3], # Only top 3 windows
        "personal": request.gann_data.get("personal_overlay", {})
    }
    
    prompt = (
        f"You are a specialized Gann Trading AI Analyst. "
        f"The user is asking about {request.asset}.\n\n"
        f"Market Context:\n{json.dumps(gann_ctx, indent=2)}\n\n"
        f"User Question: {request.question}\n\n"
        f"Instructions:\n"
        f"1. Provide a professional, concise analysis based on Gann theory (time cycles, price levels, harmonics).\n"
        f"2. If personal data is provided, explain how the market timing aligns with their natal chart.\n"
        f"3. Use a clear, confident but cautious tone (trading involves risk).\n"
        f"4. Keep response to 2-3 short paragraphs.\n"
        f"5. Focus on WHEN (time cycles) and WHERE (price levels)."
    )

    # 1. Try Gemini
    if gemini_key and genai:
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('models/gemini-flash-latest')
            response = await model.generate_content_async(prompt)
            return {"answer": response.text}
        except Exception as e:
            logger.error(f"Gemini Gann Chat Failed: {e}")

    # 2. Try OpenAI
    if openai_key and openai:
        try:
            client = openai.AsyncOpenAI(api_key=openai_key)
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )
            return {"answer": response.choices[0].message.content}
        except Exception as e:
            logger.error(f"OpenAI Gann Chat Failed: {e}")

    # 3. Mock Fallback
    return {
        "answer": f"I've analyzed {request.asset} using Gann cycles. The current {gann_ctx['phase']} phase suggests "
                  f"potential support near {gann_ctx['levels'].get('support', ['N/A'])[0] if gann_ctx['levels'].get('support') else 'N/A'}. "
                  f"Your personal alignment is {gann_ctx['personal'].get('status', 'Neutral')}. "
                  f"(Note: AI API key missing, providing mock insight)."
    }
