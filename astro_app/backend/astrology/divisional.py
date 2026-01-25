from astro_app.backend.astrology.utils import normalize_degree, get_zodiac_sign, get_nakshatra
from astro_app.backend.astrology.external_api import astrology_api_service
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

def calculate_d9_navamsa(longitude: float) -> dict:
    """
    Calculates Navamsa (D9) position.
    Formula: Each sign (30 deg) divided into 9 parts (3 deg 20 min).
    The mapping depends on the element of the sign (Fire, Earth, Air, Water).
    
    Simplified Logic:
    Navamsa = (Longitude * 9) % 360 ? No, that's continuous zodiac mapping.
    Standard Parashara:
    - Fiery signs (1,5,9): Start from Aries
    - Earthy signs (2,6,10): Start from Capricorn
    - Airy signs (3,7,11): Start from Libra
    - Watery signs (4,8,12): Start from Cancer
    """
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30) # 0 for Aries, 1 for Taurus...
    degree_in_sign = normalized_lon % 30
    
    # 9 parts per sign
    part_index = int(degree_in_sign / (30/9)) # 0 to 8
    
    # Sign number (1-12)
    sign_num = sign_index + 1
    
    # Determine starting sign index (0-11) for the sequence
    # Fire (1,5,9) -> Start Aries (0)
    # Earth (2,6,10) -> Start Capricorn (9)
    # Air (3,7,11) -> Start Libra (6)
    # Water (4,8,12) -> Start Cancer (3)
    
    remainder = sign_num % 4
    if remainder == 1: # 1, 5, 9 (Fire)
        start_sign_idx = 0
    elif remainder == 2: # 2, 6, 10 (Earth)
        start_sign_idx = 9
    elif remainder == 3: # 3, 7, 11 (Air)
        start_sign_idx = 6
    else: # 0 -> 4, 8, 12 (Water)
        start_sign_idx = 3
        
    d9_sign_idx = (start_sign_idx + part_index) % 12
    d9_sign_name = get_zodiac_sign(d9_sign_idx * 30)
    
    # Calculate exact longitude in D9 chart? 
    # Usually Divisional Charts are analyzed by Sign placement. 
    # But if we want longitude: (Longitude * 9) % 360 is strictly continuous, 
    # but the Parashara jump mapping means we place it in the new sign.
    # The degree within the D9 sign:
    # fraction of part = (degree_in_sign % (30/9)) / (30/9)
    # d9_deg = fraction_part * 30
    # absolute_d9_lon = d9_sign_idx * 30 + d9_deg
    
    part_span = 30.0 / 9.0
    fraction = (degree_in_sign % part_span) / part_span
    d9_deg = fraction * 30.0
    absolute_d9_lon = (d9_sign_idx * 30) + d9_deg
    
    return {
        "chart": "D9",
        "longitude": absolute_d9_lon,
        "zodiac_sign": d9_sign_name,
        "nakshatra": get_nakshatra(absolute_d9_lon)
    }

def calculate_d16_shodashamsa(longitude: float) -> dict:
    """
    Calculates Shodashamsa (D16) position.
    Used for vehicles, comforts.
    
    Scheme (Parashara):
    - Movable Signs (1,4,7,10): Start from Aries (1)
    - Fixed Signs (2,5,8,11): Start from Leo (5)
    - Dual Signs (3,6,9,12): Start from Sagittarius (9)
    """
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part_index = int(degree_in_sign / (30/16)) # 0 to 15
    sign_num = sign_index + 1
    
    remainder = sign_num % 3
    if remainder == 1: # 1, 4, 7, 10 (Movable)
        start_sign_idx = 0 # Aries
    elif remainder == 2: # 2, 5, 8, 11 (Fixed)
        start_sign_idx = 4 # Leo
    else: # 0 -> 3, 6, 9, 12 (Dual)
        start_sign_idx = 8 # Sagittarius
        
    d16_sign_idx = (start_sign_idx + part_index) % 12
    d16_sign_name = get_zodiac_sign(d16_sign_idx * 30)
    
    part_span = 30.0 / 16.0
    fraction = (degree_in_sign % part_span) / part_span
    d16_deg = fraction * 30.0
    absolute_d16_lon = (d16_sign_idx * 30) + d16_deg
    
    return {
        "chart": "D16",
        "longitude": absolute_d16_lon,
        "zodiac_sign": d16_sign_name,
        "nakshatra": get_nakshatra(absolute_d16_lon)
    }

async def calculate_divisional_charts(planets_d1: list, birth_details: Optional[Dict[str, Any]] = None) -> dict:
    """
    Calculates D9 and D16 for a list of planets (and Ascendant).
    If birth_details is provided, it will attempt to fetch from astrology-api.io first.
    """
    # 1. Try external API
    if birth_details:
        external_vargas = await astrology_api_service.get_shodasha_varga(birth_details)
        if external_vargas:
            logger.info("Successfully fetched Divisional charts from astrology-api.io")
            # Extract just D9 and D16 from the full shodashvarga response
            return {
                "D9": external_vargas.get("D9", {}).get("planets", []),
                "D16": external_vargas.get("D16", {}).get("planets", [])
            }

    # 2. Fallback to local calculation
    d9_chart = []
    d16_chart = []
    
    for p in planets_d1:
        name = p.get("name")
        lon = p.get("longitude")
        
        # D9
        d9_res = calculate_d9_navamsa(lon)
        d9_res["name"] = name
        d9_chart.append(d9_res)
        
        # D16
        d16_res = calculate_d16_shodashamsa(lon)
        d16_res["name"] = name
        d16_chart.append(d16_res)
        
    return {
        "D9": d9_chart,
        "D16": d16_chart
    }
