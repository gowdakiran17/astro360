"""
KP Core Calculations
Implements fundamental KP Astrology calculations including:
- 249 sub-divisions (27 Nakshatras × 9 subs)
- Star Lord (Nakshatra Lord) calculation
- Sub Lord calculation based on Vimshottari Dasha
- Sub-Sub Lord calculation
- House cusps with Placidus system
"""

from typing import Dict, List, Tuple, Optional
import math

# 27 Nakshatras with their lords
NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "start": 0.0, "end": 13.333333},
    {"name": "Bharani", "lord": "Venus", "start": 13.333333, "end": 26.666667},
    {"name": "Krittika", "lord": "Sun", "start": 26.666667, "end": 40.0},
    {"name": "Rohini", "lord": "Moon", "start": 40.0, "end": 53.333333},
    {"name": "Mrigashira", "lord": "Mars", "start": 53.333333, "end": 66.666667},
    {"name": "Ardra", "lord": "Rahu", "start": 66.666667, "end": 80.0},
    {"name": "Punarvasu", "lord": "Jupiter", "start": 80.0, "end": 93.333333},
    {"name": "Pushya", "lord": "Saturn", "start": 93.333333, "end": 106.666667},
    {"name": "Ashlesha", "lord": "Mercury", "start": 106.666667, "end": 120.0},
    {"name": "Magha", "lord": "Ketu", "start": 120.0, "end": 133.333333},
    {"name": "Purva Phalguni", "lord": "Venus", "start": 133.333333, "end": 146.666667},
    {"name": "Uttara Phalguni", "lord": "Sun", "start": 146.666667, "end": 160.0},
    {"name": "Hasta", "lord": "Moon", "start": 160.0, "end": 173.333333},
    {"name": "Chitra", "lord": "Mars", "start": 173.333333, "end": 186.666667},
    {"name": "Swati", "lord": "Rahu", "start": 186.666667, "end": 200.0},
    {"name": "Vishakha", "lord": "Jupiter", "start": 200.0, "end": 213.333333},
    {"name": "Anuradha", "lord": "Saturn", "start": 213.333333, "end": 226.666667},
    {"name": "Jyeshtha", "lord": "Mercury", "start": 226.666667, "end": 240.0},
    {"name": "Mula", "lord": "Ketu", "start": 240.0, "end": 253.333333},
    {"name": "Purva Ashadha", "lord": "Venus", "start": 253.333333, "end": 266.666667},
    {"name": "Uttara Ashadha", "lord": "Sun", "start": 266.666667, "end": 280.0},
    {"name": "Shravana", "lord": "Moon", "start": 280.0, "end": 293.333333},
    {"name": "Dhanishta", "lord": "Mars", "start": 293.333333, "end": 306.666667},
    {"name": "Shatabhisha", "lord": "Rahu", "start": 306.666667, "end": 320.0},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "start": 320.0, "end": 333.333333},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "start": 333.333333, "end": 346.666667},
    {"name": "Revati", "lord": "Mercury", "start": 346.666667, "end": 360.0},
]

# Vimshottari Dasha periods (in years) - used for sub-division
VIMSHOTTARI_YEARS = {
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17,
    "Ketu": 7,
    "Venus": 20
}

# Sub-division sequence (same as Vimshottari Dasha order)
SUB_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

# Total Vimshottari cycle
TOTAL_YEARS = 120


def get_nakshatra_info(longitude: float) -> Dict:
    """
    Get Nakshatra information for a given longitude.
    
    Args:
        longitude: Longitude in degrees (0-360)
        
    Returns:
        Dict with nakshatra name, lord, pada, and position within nakshatra
    """
    # Normalize longitude to 0-360
    longitude = longitude % 360
    
    # Find the nakshatra
    for nak in NAKSHATRAS:
        if nak["start"] <= longitude < nak["end"]:
            # Calculate pada (1-4)
            nak_span = nak["end"] - nak["start"]  # 13.333333 degrees
            position_in_nak = longitude - nak["start"]
            pada = int(position_in_nak / (nak_span / 4)) + 1
            
            return {
                "name": nak["name"],
                "lord": nak["lord"],
                "pada": pada,
                "position_in_nakshatra": position_in_nak,
                "nakshatra_span": nak_span
            }
    
    # Fallback (should never reach here)
    return NAKSHATRAS[0]


def calculate_sub_lord(longitude: float) -> Dict:
    """
    Calculate the Sub Lord for a given longitude.
    Each Nakshatra (13°20') is divided into 9 unequal parts based on Vimshottari Dasha.
    
    Formula: Span of Sub = (Vimshottari Years / 120) × 800 minutes (13°20')
    
    Args:
        longitude: Longitude in degrees (0-360)
        
    Returns:
        Dict with sub_lord, star_lord, and detailed position info
    """
    # Get nakshatra info
    nak_info = get_nakshatra_info(longitude)
    star_lord = nak_info["lord"]
    position_in_nak = nak_info["position_in_nakshatra"]
    
    # Convert position to minutes (13°20' = 800 minutes)
    position_in_minutes = position_in_nak * 60  # degrees to minutes
    
    # Calculate sub-divisions
    # Each nakshatra is 800 minutes, divided proportionally by Vimshottari years
    cumulative_minutes = 0.0
    sub_lord = None
    
    # Find which sub-lord's starting planet matches the nakshatra lord
    # The sub sequence starts from the nakshatra lord
    start_index = SUB_SEQUENCE.index(star_lord)
    
    for i in range(9):
        planet_index = (start_index + i) % 9
        planet = SUB_SEQUENCE[planet_index]
        years = VIMSHOTTARI_YEARS[planet]
        
        # Calculate span of this sub in minutes
        sub_span_minutes = (years / TOTAL_YEARS) * 800
        
        if cumulative_minutes <= position_in_minutes < cumulative_minutes + sub_span_minutes:
            sub_lord = planet
            sub_position = position_in_minutes - cumulative_minutes
            break
        
        cumulative_minutes += sub_span_minutes
    
    # Fallback
    if sub_lord is None:
        sub_lord = star_lord
    
    return {
        "star_lord": star_lord,
        "sub_lord": sub_lord,
        "nakshatra": nak_info["name"],
        "pada": nak_info["pada"],
        "position_in_nakshatra_degrees": position_in_nak,
        "position_in_nakshatra_minutes": position_in_minutes
    }


def calculate_sub_sub_lord(longitude: float) -> Dict:
    """
    Calculate the Sub-Sub Lord (third level) for a given longitude.
    Each sub-division is further divided into 9 parts.
    
    Args:
        longitude: Longitude in degrees (0-360)
        
    Returns:
        Dict with star_lord, sub_lord, and sub_sub_lord
    """
    # Get sub lord info first
    sub_info = calculate_sub_lord(longitude)
    star_lord = sub_info["star_lord"]
    sub_lord = sub_info["sub_lord"]
    position_in_nak_minutes = sub_info["position_in_nakshatra_minutes"]
    
    # Find the sub-division span
    start_index = SUB_SEQUENCE.index(star_lord)
    sub_index = SUB_SEQUENCE.index(sub_lord)
    
    # Calculate where this sub starts
    cumulative_minutes = 0.0
    for i in range(9):
        planet_index = (start_index + i) % 9
        planet = SUB_SEQUENCE[planet_index]
        years = VIMSHOTTARI_YEARS[planet]
        sub_span_minutes = (years / TOTAL_YEARS) * 800
        
        if planet == sub_lord:
            break
        cumulative_minutes += sub_span_minutes
    
    # Position within this sub
    position_in_sub = position_in_nak_minutes - cumulative_minutes
    
    # Now divide this sub into 9 parts
    sub_span_minutes = (VIMSHOTTARI_YEARS[sub_lord] / TOTAL_YEARS) * 800
    cumulative_sub_sub = 0.0
    sub_sub_lord = None
    
    # Sub-sub sequence starts from the sub lord
    sub_sub_start_index = SUB_SEQUENCE.index(sub_lord)
    
    for i in range(9):
        planet_index = (sub_sub_start_index + i) % 9
        planet = SUB_SEQUENCE[planet_index]
        years = VIMSHOTTARI_YEARS[planet]
        
        # Calculate span of this sub-sub in minutes
        sub_sub_span = (years / TOTAL_YEARS) * sub_span_minutes
        
        if cumulative_sub_sub <= position_in_sub < cumulative_sub_sub + sub_sub_span:
            sub_sub_lord = planet
            break
        
        cumulative_sub_sub += sub_sub_span
    
    # Fallback
    if sub_sub_lord is None:
        sub_sub_lord = sub_lord
    
    return {
        "star_lord": star_lord,
        "sub_lord": sub_lord,
        "sub_sub_lord": sub_sub_lord,
        "nakshatra": sub_info["nakshatra"],
        "pada": sub_info["pada"]
    }


def calculate_kp_planet_details(planet_name: str, longitude: float) -> Dict:
    """
    Calculate complete KP details for a planet.
    
    Args:
        planet_name: Name of the planet
        longitude: Longitude in degrees (0-360)
        
    Returns:
        Dict with complete KP analysis
    """
    # Get sign
    sign_num = int(longitude / 30)
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    sign = signs[sign_num]
    
    # Get degree within sign
    degree_in_sign = longitude % 30
    
    # Get 3-layer script
    script = calculate_sub_sub_lord(longitude)
    
    return {
        "planet": planet_name,
        "longitude": longitude,
        "sign": sign,
        "degree_in_sign": degree_in_sign,
        "nakshatra": script["nakshatra"],
        "pada": script["pada"],
        "star_lord": script["star_lord"],
        "sub_lord": script["sub_lord"],
        "sub_sub_lord": script["sub_sub_lord"]
    }


def calculate_house_cusps_kp(ascendant_longitude: float, nirayana_cusps: Optional[List[float]] = None) -> List[Dict]:
    """
    Calculate KP house cusps.
    If nirayana_cusps is provided, uses them (typically from Placidus system).
    Otherwise, falls back to equal house system.
    
    Args:
        ascendant_longitude: Ascendant longitude in degrees
        nirayana_cusps: Optional list of 12 cusp longitudes
        
    Returns:
        List of 12 house cusps with KP details
    """
    cusps = []
    
    for house_num in range(1, 13):
        if nirayana_cusps and len(nirayana_cusps) >= house_num:
            # Handle 1-indexed (index 1 is 1st cusp if from res_houses[0]) or 0-indexed list
            if len(nirayana_cusps) == 13:
                cusp_longitude = nirayana_cusps[house_num]
            else:
                cusp_longitude = nirayana_cusps[house_num - 1]
        else:
            # Equal house system fallback: each house is 30 degrees
            cusp_longitude = (ascendant_longitude + (house_num - 1) * 30) % 360
        
        # Get KP details for this cusp
        script = calculate_sub_sub_lord(cusp_longitude)
        
        # Get sign
        sign_num = int(cusp_longitude / 30)
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        sign = signs[sign_num]
        
        cusps.append({
            "house": house_num,
            "longitude": cusp_longitude,
            "sign": sign,
            "degree_in_sign": cusp_longitude % 30,
            "nakshatra": script["nakshatra"],
            "pada": script["pada"],
            "star_lord": script["star_lord"],
            "sub_lord": script["sub_lord"],
            "sub_sub_lord": script["sub_sub_lord"]
        })
    
    return cusps
