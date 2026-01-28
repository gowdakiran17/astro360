import swisseph as swe
from datetime import datetime
from astro_app.backend.astrology.utils import (
    validate_coordinates, validate_date, validate_time, validate_timezone,
    normalize_degree, get_zodiac_sign, get_nakshatra, ZODIAC_SIGNS, parse_timezone
)

ZODIAC_LORDS = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
}

def calculate_chart(date_str: str, time_str: str, timezone_str: str, latitude: float, longitude: float):
    """
    Calculates the astrological chart using pyswisseph (Swiss Ephemeris).
    Returns structured JSON with Ascendant, Planets, and Houses.
    """
    
    # 1. Validation
    if not validate_date(date_str):
        raise ValueError("Invalid date format. Use DD/MM/YYYY")
    if not validate_time(time_str):
        raise ValueError("Invalid time format. Use HH:MM")
    if not validate_timezone(timezone_str):
        raise ValueError("Invalid timezone format. Use +HH:MM or -HH:MM")
    if not validate_coordinates(latitude, longitude):
        raise ValueError("Invalid coordinates.")

    # 2. Parse Date and Time
    dt_str = f"{date_str} {time_str}"
    naive_dt = datetime.strptime(dt_str, "%d/%m/%Y %H:%M")
    
    # Parse offset using robust utility
    tz_offset = parse_timezone(timezone_str, naive_dt)
    
    decimal_hour_local = naive_dt.hour + naive_dt.minute / 60.0 + naive_dt.second / 3600.0
    decimal_hour_utc = decimal_hour_local - tz_offset
    
    year = naive_dt.year
    month = naive_dt.month
    day = naive_dt.day
    
    # 3. Calculate Julian Day (UT)
    jd_ut = swe.julday(year, month, day, decimal_hour_utc)
    
    # 4. Set Sidereal Mode (Lahiri Ayanamsa)
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    
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
    
    # Get Ayanamsa for this time
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)
    
    # Store planet longitudes for house calculation
    planet_longitudes = {}

    for p_name, p_id in planets_map.items():
        # Calculate Sidereal position
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
        
        res = swe.calc_ut(jd_ut, p_id, flags)
        # res is ((lon, lat, dist, speed_lon, speed_lat, speed_dist), ret_flag)
        
        lon = res[0][0]
        speed = res[0][3]
        is_retro = speed < 0
        
        if p_name == "Rahu":
            # Add Rahu
            rahu_data = {
                "name": "Rahu",
                "longitude": lon,
                "zodiac_sign": get_zodiac_sign(lon),
                "nakshatra": get_nakshatra(lon),
                "is_retrograde": is_retro,
                "house": 0 # Will be filled later
            }
            planets_data.append(rahu_data)
            planet_longitudes["Rahu"] = lon
            
            # Calculate Ketu (Always opposite to Rahu)
            ketu_lon = normalize_degree(lon + 180)
            ketu_data = {
                "name": "Ketu",
                "longitude": ketu_lon,
                "zodiac_sign": get_zodiac_sign(ketu_lon),
                "nakshatra": get_nakshatra(ketu_lon),
                "is_retrograde": is_retro,
                "house": 0 # Will be filled later
            }
            planets_data.append(ketu_data)
            planet_longitudes["Ketu"] = ketu_lon

        else:
            p_data = {
                "name": p_name,
                "longitude": lon,
                "zodiac_sign": get_zodiac_sign(lon),
                "nakshatra": get_nakshatra(lon),
                "is_retrograde": is_retro,
                "house": 0 # Will be filled later
            }
            planets_data.append(p_data)
            planet_longitudes[p_name] = lon

    # 6. Calculate Ascendant (Lagna)
    res_houses = swe.houses(jd_ut, latitude, longitude, b'P') 
    ascendant_tropical = res_houses[1][0]
    ascendant_nirayana = normalize_degree(ascendant_tropical - ayanamsa)
    
    ascendant_data = {
        "longitude": ascendant_nirayana,
        "zodiac_sign": get_zodiac_sign(ascendant_nirayana),
        "nakshatra": get_nakshatra(ascendant_nirayana)
    }

    # 7. Calculate Houses (Whole Sign System) & Planets
    asc_sign_index = int(ascendant_nirayana / 30)
    
    houses_data = [] 
    houses_dict = {}

    for i in range(12):
        house_num = i + 1
        sign_index = (asc_sign_index + i) % 12
        sign_start_deg = sign_index * 30
        
        h_obj = {
            "house_number": house_num,
            "zodiac_sign": ZODIAC_SIGNS[sign_index],
            "longitude_start": float(sign_start_deg),
            "longitude_end": float(sign_start_deg + 30),
            "lord": ZODIAC_LORDS.get(ZODIAC_SIGNS[sign_index], "Unknown")
        }
        houses_data.append(h_obj)
        houses_dict[str(house_num)] = h_obj

    # Assign Houses to Planets
    for p in planets_data:
        p_lon = p["longitude"]
        p_sign_index = int(p_lon / 30)
        
        diff = p_sign_index - asc_sign_index
        if diff < 0: diff += 12
        house_num = diff + 1
        
        p["house"] = house_num
        
    # 8. Construct Final Response
    result = {
        "birth_details": {
            "date": date_str,
            "time": time_str,
            "timezone": timezone_str,
            "latitude": latitude,
            "longitude": longitude
        },
        "ascendant": ascendant_data,
        "planets": planets_data, # Return List for Frontend compatibility
        "houses": houses_data # Return List for Frontend compatibility
    }
    
    return result
