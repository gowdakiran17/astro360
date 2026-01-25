from typing import Dict, List, Optional
from datetime import datetime

def calculate_gmri(transits: Dict, market_volatility: float = 50.0) -> Dict:
    """
    Calculates Global Market Risk Index (0-100).
    
    Formula:
    GMRI = 0.30 * Moon_Vol + 0.20 * Mercury_Status + 0.20 * Mars_Saturn_Stress + 0.20 * Rahu_Inf + 0.10 * Market_Vol
    """
    planets = {p['name']: p for p in transits['planets']}
    
    # 1. Moon Volatility (0-100)
    # Fire/Air signs are more volatile. Water/Earth are more stable (but Water can be emotional panic).
    moon = planets.get('Moon', {})
    moon_sign = moon.get('zodiac_sign', '')
    moon_nak = moon.get('nakshatra', '')
    
    moon_vol = 40.0 # Base
    if moon_sign in ['Aries', 'Leo', 'Sagittarius']: # Fire - Impulsive
        moon_vol += 30
    elif moon_sign in ['Gemini', 'Libra', 'Aquarius']: # Air - Erratic
        moon_vol += 20
    elif moon_sign == 'Scorpio': # Debilitated - Fear
        moon_vol += 40
        
    # 2. Mercury Status (0-100)
    # Retrograde = High Risk (100). Direct = Low (20).
    mercury = planets.get('Mercury', {})
    mercury_status = 80.0 if mercury.get('is_retrograde') else 20.0
    
    # 3. Mars-Saturn Stress (0-100)
    # Conjunction (same sign) or Opposition (7th house away - simplified by sign axis)
    mars = planets.get('Mars', {})
    saturn = planets.get('Saturn', {})
    
    mars_saturn_stress = 30.0 # Base
    
    # Simple aspect check by sign index diff
    # (Need sign index map, but let's just check if same sign for now or simple opposite)
    if mars.get('zodiac_sign') == saturn.get('zodiac_sign'):
        mars_saturn_stress = 90.0 # Conjunction - War/Conflict
    
    # Check retrograde malefics
    if mars.get('is_retrograde') or saturn.get('is_retrograde'):
        mars_saturn_stress += 20.0
        
    # 4. Rahu Influence (0-100)
    # Rahu in Fire signs or conjunct Jupiter (Guru Chandal)
    rahu = planets.get('Rahu', {})
    rahu_inf = 40.0
    if rahu.get('zodiac_sign') in ['Aries', 'Leo', 'Sagittarius']:
        rahu_inf += 30
    
    # GMRI Calculation
    gmri = (0.30 * moon_vol) + \
           (0.20 * mercury_status) + \
           (0.20 * mars_saturn_stress) + \
           (0.20 * rahu_inf) + \
           (0.10 * market_volatility)
           
    gmri = min(100.0, gmri)
    
    level = "Stable"
    if gmri > 60: level = "Dangerous"
    elif gmri > 30: level = "Uncertain"
    
    return {
        "score": round(gmri, 1),
        "level": level,
        "components": {
            "moon_volatility": moon_vol,
            "mercury_risk": mercury_status,
            "planetary_stress": mars_saturn_stress
        }
    }

def calculate_asset_strength(transits: Dict, market_trends: Dict) -> Dict:
    """
    Calculates Crypto Market Strength (CMS) and Stock Market Strength (SMS).
    """
    planets = {p['name']: p for p in transits['planets']}
    
    # --- Crypto Market Strength (CMS) ---
    # Uses: Mars (Energy), Rahu (Innovation/Speculation), Moon (Sentiment)
    mars = planets.get('Mars', {})
    rahu = planets.get('Rahu', {})
    moon = planets.get('Moon', {})
    
    cms_score = 50.0 # Base
    
    # Mars: Exalted/Own sign is good. Debilitated/Retro is bad.
    if mars.get('zodiac_sign') in ['Capricorn', 'Aries', 'Scorpio']:
        cms_score += 15
    elif mars.get('zodiac_sign') == 'Cancer':
        cms_score -= 10
        
    # Rahu: Fire/Air signs good for crypto bubbles
    if rahu.get('zodiac_sign') in ['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius']:
        cms_score += 15
        
    # Moon: Waxing/Waning (Proxy via Sun-Moon distance not avail directly, use sign logic)
    # Fire/Air Moon good for volume
    if moon.get('zodiac_sign') in ['Aries', 'Gemini', 'Leo', 'Libra', 'Sagittarius', 'Aquarius']:
        cms_score += 10
        
    # Trend Bonus (from market data)
    if market_trends.get('crypto_trend') == 'Bull':
        cms_score += 20
    elif market_trends.get('crypto_trend') == 'Bear':
        cms_score -= 20
        
    cms_score = max(0, min(100, cms_score))
    
    # --- Stock Market Strength (SMS) ---
    # Uses: Jupiter (Economy), Saturn (Stability), Sun (Authority)
    jupiter = planets.get('Jupiter', {})
    saturn = planets.get('Saturn', {})
    sun = planets.get('Sun', {})
    
    sms_score = 50.0
    
    # Jupiter: Growth
    if jupiter.get('zodiac_sign') in ['Cancer', 'Sagittarius', 'Pisces']:
        sms_score += 15
    elif jupiter.get('is_retrograde'):
        sms_score -= 10
        
    # Saturn: Stability (Exalted/Own is good for steady growth)
    if saturn.get('zodiac_sign') in ['Libra', 'Capricorn', 'Aquarius']:
        sms_score += 10
    elif saturn.get('is_retrograde'):
        sms_score -= 15 # Structural fears
        
    # Sun: Confidence
    if sun.get('zodiac_sign') == 'Aries':
        sms_score += 10
    elif sun.get('zodiac_sign') == 'Libra':
        sms_score -= 10
        
    # Trend Bonus
    if market_trends.get('stock_trend') == 'Bull':
        sms_score += 20
    elif market_trends.get('stock_trend') == 'Bear':
        sms_score -= 20
        
    sms_score = max(0, min(100, sms_score))
    
    return {
        "crypto_strength": cms_score,
        "stock_strength": sms_score
    }

def get_signal(alignment_score: float) -> str:
    if alignment_score > 70: return "Strong Buy"
    if alignment_score >= 50: return "Buy"
    if alignment_score >= 30: return "Hold"
    if alignment_score >= 10: return "Reduce"
    return "Avoid"

def get_market_overlay(user_profile: Dict, transits: Dict, market_data: Dict = None) -> Dict:
    """
    Main Engine Function.
    Overlays User Suitability + Market Conditions + Planetary Cycles.
    """
    
    # Default Mock Market Data if None
    if not market_data:
        market_data = {
            "volatility": 40.0,
            "crypto_trend": "Bull", # Mock
            "stock_trend": "Range"  # Mock
        }
        
    # 1. GMRI
    gmri_data = calculate_gmri(transits, market_data.get('volatility', 50))
    gmri = gmri_data['score']
    
    # 2. Asset Market Strength
    market_strength = calculate_asset_strength(transits, market_data)
    cms = market_strength['crypto_strength']
    sms = market_strength['stock_strength']
    
    # 3. Personal Alignment
    # Extract User Scores (normalized 0-100)
    user_scores = user_profile.get('scores', {})
    crypto_suit = user_scores.get('crypto', 50)
    stock_suit = user_scores.get('stocks', 50)
    
    # Formula:
    # Crypto_Alignment = 0.50 * Crypto_Suit + 0.50 * CMS - GMRI * 0.5
    # (Note: GMRI penalty seems high in user prompt "GMRI * 0.5". Let's verify logic.
    # If GMRI is 100 (Dangerous), penalty is 50. Max possible score = 50 + 50 - 50 = 50.
    # So in dangerous markets, max is "Hold" or "Buy" (if 70 is Strong Buy). seems correct.)
    
    crypto_align = (0.50 * crypto_suit) + (0.50 * cms) - (gmri * 0.5)
    stock_align = (0.50 * stock_suit) + (0.50 * sms) - (gmri * 0.3) # Stocks less affected by GMRI?
    
    crypto_align = max(0, min(100, crypto_align))
    stock_align = max(0, min(100, stock_align))
    
    # 4. Signals
    crypto_signal = get_signal(crypto_align)
    stock_signal = get_signal(stock_align)
    
    # 5. Best Asset Logic
    best_asset = "Cash"
    if crypto_align > stock_align and crypto_align > 40:
        best_asset = "Crypto"
    elif stock_align > crypto_align and stock_align > 40:
        best_asset = "Stocks"
    
    return {
        "gmri": gmri_data,
        "market_strength": market_strength,
        "alignment": {
            "crypto": {
                "score": round(crypto_align, 1),
                "signal": crypto_signal
            },
            "stocks": {
                "score": round(stock_align, 1),
                "signal": stock_signal
            }
        },
        "best_asset_today": best_asset,
        "message": f"Market Risk is {gmri_data['level']}. Best asset for you: {best_asset}."
    }
