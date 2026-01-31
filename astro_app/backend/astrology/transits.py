import swisseph as swe
from datetime import datetime
from astro_app.backend.astrology.utils import (
    validate_coordinates, validate_date, validate_time, validate_timezone,
    normalize_degree, get_zodiac_sign, get_nakshatra, ZODIAC_SIGNS
)
import math

def calculate_transits(date_str: str, time_str: str, timezone_str: str, latitude: float, longitude: float, ayanamsa: str = "LAHIRI"):
    """
    Calculates planetary positions for a specific transit date/time.
    """
    
    # 1. Validation (Reuse basic validations)
    if not validate_date(date_str):
        raise ValueError("Invalid date format. Use DD/MM/YYYY")
    if not validate_time(time_str):
        raise ValueError("Invalid time format. Use HH:MM")
    
    # 2. Parse Date and Time
    dt_str = f"{date_str} {time_str}"
    try:
        naive_dt = datetime.strptime(dt_str, "%d/%m/%Y %H:%M")
    except ValueError:
        # Fallback if format is different (though validation should catch it)
        naive_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")

    # Parse offset
    sign = 1 if timezone_str.startswith("+") else -1
    parts = timezone_str.strip("+-").split(":")
    hours = int(parts[0])
    minutes = int(parts[1]) if len(parts) > 1 else 0
    offset_minutes = sign * (hours * 60 + minutes)
    
    # Calculate Decimal Hour in UTC
    decimal_hour_local = naive_dt.hour + naive_dt.minute / 60.0 + naive_dt.second / 3600.0
    decimal_hour_utc = decimal_hour_local - (offset_minutes / 60.0)
    
    year = naive_dt.year
    month = naive_dt.month
    day = naive_dt.day
    
    # 3. Calculate Julian Day (UT)
    jd_ut = swe.julday(year, month, day, decimal_hour_utc)
    
    # 4. Set Sidereal Mode (Ayanamsa)
    # Map ayanamsa string to Swiss Ephemeris constant
    ayanamsa_map = {
        "LAHIRI": swe.SIDM_LAHIRI,
        "RAMAN": swe.SIDM_RAMAN,
        "KP": swe.SIDM_KRISHNAMURTI,
        "FAGAN_BRADLEY": swe.SIDM_FAGAN_BRADLEY,
        "TROPICAL": None # Tropical doesn't use sidereal mode
    }
    
    swe_ayanamsa = ayanamsa_map.get(ayanamsa.upper(), swe.SIDM_LAHIRI)
    
    if swe_ayanamsa is not None:
        swe.set_sid_mode(swe_ayanamsa, 0, 0)
    else:
        # For Tropical, we might need to handle differently or just not set sidereal mode
        pass
    
    # 5. Calculate Planets
    planets_map = {
        "Sun": swe.SUN,
        "Moon": swe.MOON,
        "Mars": swe.MARS,
        "Mercury": swe.MERCURY,
        "Jupiter": swe.JUPITER,
        "Venus": swe.VENUS,
        "Saturn": swe.SATURN,
        "Rahu": swe.TRUE_NODE 
    }
    
    planets_data = []
    
    for p_name, p_id in planets_map.items():
        # Calculate Sidereal position
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        if swe_ayanamsa is not None:
            flags |= swe.FLG_SIDEREAL
        
        res = swe.calc_ut(jd_ut, p_id, flags)
        lon = res[0][0]
        speed = res[0][3]
        is_retro = speed < 0
        
        if p_name == "Rahu":
            # Add Rahu
            rahu_data = {
                "name": "Rahu",
                "longitude": lon,
                "degrees": lon % 30.0,
                "zodiac_sign": get_zodiac_sign(lon),
                "nakshatra": get_nakshatra(lon),
                "is_retrograde": is_retro
            }
            planets_data.append(rahu_data)
            
            # Calculate Ketu
            ketu_lon = normalize_degree(lon + 180)
            ketu_data = {
                "name": "Ketu",
                "longitude": ketu_lon,
                "degrees": ketu_lon % 30.0,
                "zodiac_sign": get_zodiac_sign(ketu_lon),
                "nakshatra": get_nakshatra(ketu_lon),
                "is_retrograde": is_retro
            }
            planets_data.append(ketu_data)

        else:
            p_data = {
                "name": p_name,
                "longitude": lon,
                "degrees": lon % 30.0,
                "zodiac_sign": get_zodiac_sign(lon),
                "nakshatra": get_nakshatra(lon),
                "is_retrograde": is_retro
            }
            planets_data.append(p_data)

    return planets_data

def get_aspects(planet1_lon: float, planet2_lon: float, orb: float = 6.0) -> str:
    """
    Calculates the aspect between two planetary longitudes.
    Returns None if no major aspect is found.
    """
    diff = abs(planet1_lon - planet2_lon)
    if diff > 180:
        diff = 360 - diff
        
    if abs(diff - 0) <= orb:
        return "Conjunction"
    elif abs(diff - 60) <= orb:
        return "Sextile"
    elif abs(diff - 90) <= orb:
        return "Square"
    elif abs(diff - 120) <= orb:
        return "Trine"
    elif abs(diff - 180) <= orb:
        return "Opposition"
    
    return None

def calculate_transit_aspects(natal_planets: list, transit_planets: list):
    """
    Identifies aspects between transit planets and natal planets.
    """
    aspects = []
    
    for t_planet in transit_planets:
        for n_planet in natal_planets:
            aspect = get_aspects(t_planet["longitude"], n_planet["longitude"])
            if aspect:
                aspects.append({
                    "transit_planet": t_planet["name"],
                    "natal_planet": n_planet["name"],
                    "aspect": aspect,
                    "transit_sign": t_planet["zodiac_sign"],
                    "natal_sign": n_planet["zodiac_sign"]
                })
                
    return aspects

def check_nakshatra_ingress(planet_name: str, date_str: str, timezone_str: str, window_days: int = 1):
    """
    Checks if a planet changes Nakshatra within a time window (+/- days).
    Returns ingress details if found.
    """
    try:
        dt = datetime.strptime(date_str, "%d/%m/%Y")
    except ValueError:
        return None
        
    # We check position at start and end of window
    # Actually just check Today vs Tomorrow to see if it changes near this date
    # Or specifically find the exact time? 
    # For now, let's detect if it changes from 'date_str' to 'date_str + 1 day'
    
    # JD for requested date (Noon)
    jd_start = calculate_transits(date_str, "12:00", timezone_str, 0, 0)[0]["longitude"] # Inefficient call pattern
    # Better: Use direct swe calls if possible, but let's reuse logic or optimize.
    # To avoid circular ref or massive refactor, let's just use swe directly here.
    
    # Helper to get lon
    def get_planet_lon(jd, p_name):
        swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
        p_map = {"Sun":0, "Moon":1, "Mars":4, "Mercury":2, "Jupiter":5, "Venus":3, "Saturn":6, "Rahu":11, "Ketu":11}
        p_id = p_map.get(p_name)
        if p_id is None: return 0
        res = swe.calc_ut(jd, p_id, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        return res[0][0]

    # Parse TZ
    try:
         # Simplified TZ parse
         sign = 1 if timezone_str.startswith("+") else -1
         parts = timezone_str.strip("+-").split(":")
         offset = sign * (int(parts[0]) + int(parts[1])/60.0) if len(parts)>1 else 0
    except:
         offset = 0
         
    # Check range t-1 to t+1
    shifts = []
    
    # Steps of 6 hours
    start_dt = dt
    for i in range(-window_days * 4, window_days * 4):
        # Calculate time
        hours_add = i * 6
        check_dt = start_dt + timedelta(hours=hours_add)
        
        # Convert to JD
        decimal_hour = check_dt.hour - offset 
        jd = swe.julday(check_dt.year, check_dt.month, check_dt.day, decimal_hour + check_dt.minute/60.0)
        
        lon = get_planet_lon(jd, planet_name)
        nak = get_nakshatra(lon)
        
        # Compare with previous step
        if i > -window_days * 4:
            if nak != prev_nak:
                shifts.append({
                    "planet": planet_name,
                    "from_nakshatra": prev_nak,
                    "to_nakshatra": nak,
                    "measure_time": check_dt.strftime("%d/%m/%Y %H:%M") + " (Approx)"
                })
        
        prev_nak = nak
        
    return shifts
