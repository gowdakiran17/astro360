from typing import List, Dict, Any, Optional
import math
import logging
from .external_api import astrology_api_service

logger = logging.getLogger(__name__)

# Shadbala Requirement per planet (in Rupas)
# Standard Parashara requirements
SHADBALA_REQUIREMENTS = {
    "Sun": 6.5,
    "Moon": 6.0,
    "Mars": 5.0,
    "Mercury": 7.0,
    "Jupiter": 6.5,
    "Venus": 5.5,
    "Saturn": 5.0
}

# Natural Strength (Naisargika Bala) - In Virupas
NAISARGIKA_STRENGTH = {
    "Sun": 60,
    "Moon": 51.43,
    "Mars": 17.14,
    "Mercury": 25.71,
    "Jupiter": 34.29,
    "Venus": 42.86,
    "Saturn": 8.57
}

def calculate_sthana_bala(p_name: str, p_lon: float, asc_sign_idx: int) -> float:
    # Highly simplified Sthana Bala (Position strength)
    # Includes Uccha (Exaltation), Saptavargiya, etc.
    # For MVP, we'll use a base strength + random variability based on sign
    sign_idx = int(p_lon / 30)
    # Exaltation signs (0-indexed)
    exaltation = {"Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5, "Jupiter": 3, "Venus": 11, "Saturn": 6}
    
    base = 60 # Average
    if exaltation.get(p_name) == sign_idx:
        base += 60 # Exalted
    elif (exaltation.get(p_name) + 6) % 12 == sign_idx:
        base -= 30 # Debilitated
        
    return base

def calculate_dig_bala(p_name: str, p_lon: float, asc_sign_idx: int) -> float:
    # Directional Strength
    # Sun/Mars strong in 10th house
    # Jupiter/Merc strong in 1st house
    # Moon/Venus strong in 4th house
    # Saturn strong in 7th house
    
    p_sign_idx = int(p_lon / 30)
    house_idx = (p_sign_idx - asc_sign_idx) % 12 + 1
    
    base = 30
    if p_name in ["Jupiter", "Mercury"] and house_idx == 1: base = 60
    if p_name in ["Moon", "Venus"] and house_idx == 4: base = 60
    if p_name == "Saturn" and house_idx == 7: base = 60
    if p_name in ["Sun", "Mars"] and house_idx == 10: base = 60
    
    return base

def calculate_kaala_bala(p_name: str, is_day: bool) -> float:
    # Temporal Strength
    # Moon, Mars, Saturn strong at night
    # Sun, Jupiter, Venus strong during day
    # Mercury always strong
    base = 40
    if is_day:
        if p_name in ["Sun", "Jupiter", "Venus"]: base = 60
    else:
        if p_name in ["Moon", "Mars", "Saturn"]: base = 60
    
    if p_name == "Mercury": base = 60
    return base

def calculate_cheshta_bala(p_lon: float) -> float:
    # Motional Strength (Cheshta Bala)
    # Strong when retrograde or moving slowly (except Sun/Moon)
    return 45.0 # Average placeholder

def calculate_naisargika_bala(p_name: str) -> float:
    return NAISARGIKA_STRENGTH.get(p_name, 0)

def calculate_drik_bala() -> float:
    # Aspectual Strength
    return 10.0 # Small positive value for aspectual benefit

async def calculate_shadbala(planets_data: List[dict], ascendant_sign_idx: int, birth_details: Optional[dict] = None) -> dict:
    # 1. Try external API first if birth_details provided
    if birth_details:
        external_data = await astrology_api_service.get_shadbala(birth_details)
        if external_data:
            logger.info("Successfully fetched Shadbala from astrology-api.io")
            return external_data

    # 2. Fallback to local calculation
    # birth_details includes 'time' for day/night check
    time_str = birth_details.get('time', '12:00') if birth_details else '12:00'
    time_parts = time_str.split(':')
    hour = int(time_parts[0])
    is_day = 6 <= hour < 18
    
    planet_results = []
    
    for p in planets_data:
        p_name = p['name']
        if p_name not in SHADBALA_REQUIREMENTS:
            continue
            
        p_lon = p['longitude']
        
        # Calculate components (in Virupas)
        sthana = calculate_sthana_bala(p_name, p_lon, ascendant_sign_idx)
        dig = calculate_dig_bala(p_name, p_lon, ascendant_sign_idx)
        kaala = calculate_kaala_bala(p_name, is_day)
        cheshta = calculate_cheshta_bala(p_lon)
        naisargika = calculate_naisargika_bala(p_name)
        drik = calculate_drik_bala()
        
        total_virupas = sthana + dig + kaala + cheshta + naisargika + drik
        total_rupas = total_virupas / 60.0
        
        requirement = SHADBALA_REQUIREMENTS[p_name]
        percentage = (total_rupas / requirement) * 100
        
        planet_results.append({
            "name": p_name,
            "components": {
                "Sthana": round(sthana, 2),
                "Dig": round(dig, 2),
                "Kaala": round(kaala, 2),
                "Cheshta": round(cheshta, 2),
                "Naisargika": round(naisargika, 2),
                "Drik": round(drik, 2)
            },
            "total_virupas": round(total_virupas, 2),
            "total_rupas": round(total_rupas, 2),
            "requirement_rupas": requirement,
            "percentage": round(percentage, 1),
            "status": "Strong" if percentage >= 100 else "Average" if percentage >= 80 else "Weak"
        })
        
    return {
        "planets": planet_results,
        "summary": {
            "strongest": max(planet_results, key=lambda x: x['percentage'])['name'],
            "weakest": min(planet_results, key=lambda x: x['percentage'])['name']
        }
    }
