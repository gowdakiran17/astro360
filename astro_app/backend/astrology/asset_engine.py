from typing import Dict, List, Optional
from datetime import datetime
import swisseph as swe
from .wealth import calculate_planet_strength
from .muhurata import get_muhurata_data
from .utils import get_julian_day

# --- ASSET PLANETARY DNA ---
# Maps assets to their ruling planets
# Format: "Asset Name": ["Primary Ruler", "Secondary Ruler", "Asset Type"]
ASSET_DNA = {
    # Cryptocurrencies
    "Bitcoin": ["Saturn", "Rahu", "Crypto"],     # Structure/Restriction + Innovation/Foreign
    "Ethereum": ["Mercury", "Venus", "Crypto"],  # Contracts/Logic + Value/Network
    "Solana": ["Mercury", "Mars", "Crypto"],     # Speed/Logic + Energy/Action
    "Cardano": ["Saturn", "Jupiter", "Crypto"],  # Scientific/Slow + Philosophy
    "XRP": ["Mars", "Rahu", "Crypto"],           # Aggressive/Legal Battles + Unconventional
    "Dogecoin": ["Rahu", "Moon", "Crypto"],      # Hype/Illusion + Public Mood
    
    # Stocks - Indices
    "NIFTY": ["Jupiter", "Mercury", "Stock"],    # Economy + Trade
    "S&P 500": ["Sun", "Jupiter", "Stock"],      # Authority/USA + Expansion
    "NASDAQ": ["Mercury", "Rahu", "Stock"],      # Tech/Communication + Innovation
    
    # Stocks - Companies
    "Reliance": ["Jupiter", "Sun", "Stock"],     # Big Corp + Leadership
    "HDFC Bank": ["Jupiter", "Venus", "Stock"],  # Banking + Finance
    "Tata Motors": ["Mars", "Saturn", "Stock"],  # Engineering/Metal + Manufacturing
    "Apple": ["Venus", "Mercury", "Stock"],      # Aesthetics + Tech
    "Tesla": ["Mars", "Rahu", "Stock"],          # Engineering + Innovation/Risk
    "NVIDIA": ["Mercury", "Rahu", "Stock"],      # Computing + Future Tech
    "Google": ["Mercury", "Jupiter", "Stock"],   # Search/Data + Knowledge
    "Microsoft": ["Saturn", "Mercury", "Stock"], # Structure/OS + Software
    "Amazon": ["Mercury", "Moon", "Stock"],      # Commerce + Public/Retail
    "Meta": ["Rahu", "Venus", "Stock"]           # Social/Illusion + Connection
}

def format_jd_time(jd: float, timezone_str: str) -> str:
    """Helper to convert JD to local HH:MM string."""
    try:
        # Parse timezone
        sign = 1 if timezone_str[0] == '+' else -1
        parts = timezone_str[1:].split(':')
        offset_hours = int(parts[0]) + (int(parts[1]) / 60.0)
        offset_days = sign * (offset_hours / 24.0)
        
        # Adjust JD
        local_jd = jd + offset_days
        
        # Convert to time
        year, month, day, hour_decimal = swe.revjul(local_jd)
        hour = int(hour_decimal)
        minute = int((hour_decimal - hour) * 60)
        return f"{hour:02d}:{minute:02d}"
    except Exception:
        return "--:--"

def get_asset_intelligence(
    user_profile: Dict, 
    transit_chart: Dict, 
    asset_name: str,
    latitude: float = 40.7128,
    longitude: float = -74.0060,
    timezone: str = "+00:00",
    live_market_data: Optional[Dict] = None
) -> Dict:
    """
    Generates the 'Asset Intelligence Card' tailored to the user.
    """
    
    # 1. Get Asset DNA
    dna = ASSET_DNA.get(asset_name)
    if not dna:
        return {
            "error": "Asset not found in database.",
            "available_assets": list(ASSET_DNA.keys())
        }
        
    ruler1, ruler2, asset_type = dna
    
    # 2. Calculate Asset Strength Today (Market Side)
    # How strong are the rulers in the sky right now?
    r1_strength = calculate_planet_strength(ruler1, transit_chart)
    r2_strength = calculate_planet_strength(ruler2, transit_chart)
    
    asset_strength = (r1_strength * 0.6) + (r2_strength * 0.4)
    asset_strength = max(0, min(100, asset_strength))
    
    # Determine Market Trend based on Strength
    astrology_trend = "Neutral"
    if asset_strength > 75:
        astrology_trend = "Strong Bullish"
    elif asset_strength > 60:
        astrology_trend = "Bullish"
    elif asset_strength < 40:
        astrology_trend = "Bearish"
    elif asset_strength < 25:
        astrology_trend = "Strong Bearish"

    # Integrate Live Market Data if available
    market_trend = astrology_trend
    live_price = None
    live_change = None
    
    if live_market_data:
        live_price = live_market_data.get('price')
        live_change = live_market_data.get('change_percent')
        real_trend = live_market_data.get('trend', 'Neutral')
        
        # Logic: Convergence or Divergence?
        if "Bullish" in astrology_trend and "Bearish" in real_trend:
            market_trend = "Bullish Divergence (Buy Dip)"
        elif "Bearish" in astrology_trend and "Bullish" in real_trend:
            market_trend = "Bearish Divergence (Sell Rally)"
        elif "Bullish" in astrology_trend and "Bullish" in real_trend:
            market_trend = "Strong Momentum (Ride)"
        elif "Bearish" in astrology_trend and "Bearish" in real_trend:
            market_trend = "Free Fall (Avoid)"
        
    # Check for Afflictions (Simple check if rulers are Retrograde or Debilitated)
    # We can infer from strength score (low score usually means bad placement),
    # but let's check explicitly for Retrograde to add nuance.
    transit_planets = {p['name']: p for p in transit_chart['planets']}
    is_r1_retro = transit_planets.get(ruler1, {}).get('is_retrograde', False)
    is_r2_retro = transit_planets.get(ruler2, {}).get('is_retrograde', False)
    
    warnings = []
    if is_r1_retro: warnings.append(f"{ruler1} is Retrograde")
    if is_r2_retro: warnings.append(f"{ruler2} is Retrograde")
    
    # 3. Calculate Personal Fit (User Side)
    # Does this asset match the user's Wealth DNA?
    
    user_scores = user_profile.get('scores', {})
    user_traits = user_profile.get('traits', {})
    risk_profile = user_profile.get('persona', {}).get('type', 'Balanced')
    
    # Base Fit Score
    if asset_type == "Crypto":
        suitability = user_scores.get('crypto', 50)
    else:
        suitability = user_scores.get('stocks', 50)
        
    # Adjust for specific Rulers matching User's Strong Planets?
    # (Advanced feature: If User has strong Saturn, and BTC is Saturn ruled -> Good Fit)
    # For now, we stick to the main Suitability Score + Risk logic.
    
    personal_fit_score = suitability
    
    # Risk Adjustment
    # If Asset is volatile (Rahu/Mars ruled) and User is Conservative -> Lower Fit
    is_volatile_asset = "Rahu" in [ruler1, ruler2] or "Mars" in [ruler1, ruler2]
    
    if is_volatile_asset and risk_profile == "Conservative":
        personal_fit_score -= 15
        warnings.append("High volatility asset vs Conservative profile")
    elif is_volatile_asset and risk_profile == "Speculative":
        personal_fit_score += 10
        
    personal_fit_score = max(0, min(100, personal_fit_score))
    
    fit_label = "Neutral"
    if personal_fit_score > 75: fit_label = "Excellent"
    elif personal_fit_score > 60: fit_label = "Good"
    elif personal_fit_score < 40: fit_label = "Weak"
    elif personal_fit_score < 25: fit_label = "Poor"
    
    # 4. Generate Final Advice
    # Matrix: Market Trend vs Personal Fit
    
    status = "Hold"
    color = "yellow"
    advice_text = ""
    
    if market_trend in ["Bullish", "Strong Bullish"]:
        if fit_label in ["Good", "Excellent"]:
            status = "Buy"
            color = "green"
            advice_text = f"{asset_name} is strong and fits your chart perfectly. Green light."
        else:
            status = "Avoid" # Market good, User bad -> FOMO Trap
            color = "orange"
            advice_text = f"{asset_name} is bullish, but not for YOU. High risk of mis-timing."
    elif market_trend in ["Bearish", "Strong Bearish"]:
        if fit_label in ["Good", "Excellent"]:
            status = "Wait" # Market bad, User good -> Buy the dip later
            color = "blue"
            advice_text = f"You are suited for {asset_name}, but the trend is weak. Wait for a dip."
        else:
            status = "Avoid"
            color = "red"
            advice_text = "Weak market and weak personal fit. Stay away."
    else: # Neutral Market
        if fit_label in ["Good", "Excellent"]:
            status = "Accumulate"
            color = "blue"
            advice_text = "Market is quiet. Good time for you to accumulate slowly."
        else:
            status = "Ignore"
            color = "gray"
            advice_text = "No clear signal and low suitability. Look elsewhere."
            
    # 5. Timing Window (Real-time based on Muhurata/Hora)
    # Get current UTC time for calculation context
    now_utc = datetime.utcnow()
    date_str = now_utc.strftime("%d/%m/%Y")
    time_str = now_utc.strftime("%H:%M")
    
    # Calculate JD for current time
    current_jd = get_julian_day(date_str, time_str, "+00:00")
    
    # Get Muhurata Data for location
    muhurata_data = get_muhurata_data(current_jd, latitude, longitude)
    periods = muhurata_data.get('periods', [])
    
    # Filter for future/current periods
    future_periods = [p for p in periods if p['end'] > current_jd]
    
    # Find Best Buy Window (Next Excellent/Good)
    good_periods = [p for p in future_periods if p['quality'] in ['Excellent', 'Good']]
    good_periods.sort(key=lambda x: x['start'])
    
    timing_window = "Market Closed"
    if good_periods:
        next_good = good_periods[0]
        start_str = format_jd_time(max(next_good['start'], current_jd), timezone)
        end_str = format_jd_time(next_good['end'], timezone)
        timing_window = f"{start_str} – {end_str}"
        
        # Add context if it's a special yoga
        if "Amrit" in next_good['name'] or "Labh" in next_good['name']:
            timing_window += f" ({next_good['name']})"
    
    # Find Avoid After (Next Avoid/Poor)
    bad_periods = [p for p in future_periods if p['quality'] in ['Avoid', 'Poor']]
    bad_periods.sort(key=lambda x: x['start'])
    
    avoid_after = "N/A"
    if bad_periods:
        next_bad = bad_periods[0]
        avoid_time = format_jd_time(next_bad['start'], timezone)
        avoid_after = f"{avoid_time} ({next_bad['name']})"
    
    return {
        "asset_name": asset_name,
        "rulers": [ruler1, ruler2],
        "market_data": {
            "strength": int(asset_strength),
            "trend": market_trend,
            "astrology_trend": astrology_trend,
            "live_price": live_price,
            "live_change": live_change,
            "warnings": warnings
        },
        "personal_data": {
            "suitability_score": int(suitability),
            "fit_label": fit_label,
            "risk_profile": risk_profile
        },
        "recommendation": {
            "status": status,
            "color": color,
            "summary": advice_text,
            "timing_window": timing_window,
            "avoid_after": avoid_after
        }
    }
