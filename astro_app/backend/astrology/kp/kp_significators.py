"""
KP Significators System
Implements the 4-level significator hierarchy for precise predictions.

Significator Levels (in order of strength):
Level 1 (Strongest): Planets occupying the Star of a house cusp
Level 2: Planets owning the sign in which a house cusp is located
Level 3: Planets in the same house as a house cusp, or planets aspecting the house cusp
Level 4: Planets whose Star Lord or Sub Lord is linked to the house
"""

from typing import Dict, List, Set
from .kp_core import calculate_sub_sub_lord

# Sign rulers
SIGN_RULERS = {
    "Aries": "Mars",
    "Taurus": "Venus",
    "Gemini": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Virgo": "Mercury",
    "Libra": "Venus",
    "Scorpio": "Mars",
    "Sagittarius": "Jupiter",
    "Capricorn": "Saturn",
    "Aquarius": "Saturn",
    "Pisces": "Jupiter"
}

# Aspect rules (simplified - full aspects for all planets)
ASPECTS = {
    "Sun": [7],  # 7th house aspect
    "Moon": [7],
    "Mars": [4, 7, 8],  # 4th, 7th, 8th aspects
    "Mercury": [7],
    "Jupiter": [5, 7, 9],  # 5th, 7th, 9th aspects
    "Venus": [7],
    "Saturn": [3, 7, 10],  # 3rd, 7th, 10th aspects
    "Rahu": [5, 7, 9],
    "Ketu": [5, 7, 9]
}


def get_planet_house(planet_longitude: float, ascendant_longitude: float) -> int:
    """
    Get the house number where a planet is located.
    
    Args:
        planet_longitude: Planet's longitude in degrees
        ascendant_longitude: Ascendant longitude in degrees
        
    Returns:
        House number (1-12)
    """
    # Calculate relative position from ascendant
    relative_position = (planet_longitude - ascendant_longitude) % 360
    
    # Each house is 30 degrees in equal house system
    house = int(relative_position / 30) + 1
    
    return house


def calculate_significators(
    planets: List[Dict],
    house_cusps: List[Dict],
    ascendant_longitude: float
) -> Dict[int, Dict[str, List[str]]]:
    """
    Calculate significators for all 12 houses using the 4-level system.
    
    Args:
        planets: List of planet dicts with name, longitude, and KP details
        house_cusps: List of house cusp dicts with KP details
        ascendant_longitude: Ascendant longitude
        
    Returns:
        Dict mapping house number to significators by level
    """
    significators = {}
    
    for house_num in range(1, 13):
        cusp = house_cusps[house_num - 1]
        
        level_1 = []  # Planets in Star of cusp
        level_2 = []  # Planets owning sign of cusp
        level_3 = []  # Planets in house or aspecting
        level_4 = []  # Planets whose Star/Sub Lord links to house
        
        cusp_star_lord = cusp["star_lord"]
        cusp_sign = cusp["sign"]
        cusp_sign_lord = SIGN_RULERS.get(cusp_sign, "")
        
        for planet in planets:
            planet_name = planet["planet"]
            planet_longitude = planet["longitude"]
            planet_star_lord = planet.get("star_lord", "")
            planet_sub_lord = planet.get("sub_lord", "")
            planet_house = get_planet_house(planet_longitude, ascendant_longitude)
            
            # Level 1: Planet's Star Lord is same as cusp's Star Lord
            if planet_star_lord == cusp_star_lord:
                level_1.append(planet_name)
            
            # Level 2: Planet owns the sign of the cusp
            if planet_name == cusp_sign_lord:
                level_2.append(planet_name)
            
            # Level 3: Planet is in this house
            if planet_house == house_num:
                level_3.append(planet_name)
            
            # Level 3: Planet aspects this house
            if planet_name in ASPECTS:
                aspect_houses = ASPECTS[planet_name]
                for aspect_offset in aspect_houses:
                    aspected_house = ((planet_house - 1) + aspect_offset) % 12 + 1
                    if aspected_house == house_num and planet_name not in level_3:
                        level_3.append(planet_name)
            
            # Level 4: Planet's Star Lord or Sub Lord connects to this house
            # (Simplified: if Star Lord or Sub Lord is the cusp's sign lord)
            if planet_star_lord == cusp_sign_lord or planet_sub_lord == cusp_sign_lord:
                if planet_name not in level_1 and planet_name not in level_2 and planet_name not in level_3:
                    level_4.append(planet_name)
        
        significators[house_num] = {
            "level_1": level_1,
            "level_2": level_2,
            "level_3": level_3,
            "level_4": level_4,
            "all": list(set(level_1 + level_2 + level_3 + level_4))
        }
    
    return significators


def get_house_significators_for_planet(
    planet_name: str,
    significators: Dict[int, Dict[str, List[str]]]
) -> List[int]:
    """
    Get all houses for which a planet is a significator.
    
    Args:
        planet_name: Name of the planet
        significators: Significators dict from calculate_significators()
        
    Returns:
        List of house numbers
    """
    houses = []
    
    for house_num in range(1, 13):
        if planet_name in significators[house_num]["all"]:
            houses.append(house_num)
    
    return houses


def analyze_event_potential(
    event_houses: List[int],
    cusp_sub_lord: str,
    significators: Dict[int, Dict[str, List[str]]]
) -> Dict:
    """
    Analyze if an event is possible based on cusp sub-lord and significators.
    
    Args:
        event_houses: Houses related to the event (e.g., [2,6,10,11] for job)
        cusp_sub_lord: Sub Lord of the relevant cusp
        significators: Significators dict
        
    Returns:
        Dict with potential (YES/NO) and explanation
    """
    # Check if cusp sub-lord is a significator of any event house
    sub_lord_houses = get_house_significators_for_planet(cusp_sub_lord, significators)
    
    # Check overlap
    common_houses = list(set(event_houses) & set(sub_lord_houses))
    
    if common_houses:
        return {
            "potential": "YES",
            "confidence": "HIGH",
            "reason": f"{cusp_sub_lord} (Sub Lord) signifies houses {common_houses} which are related to this event",
            "favorable_houses": common_houses
        }
    else:
        return {
            "potential": "NO",
            "confidence": "HIGH",
            "reason": f"{cusp_sub_lord} (Sub Lord) does not signify the required houses {event_houses}",
            "favorable_houses": []
        }
