from typing import Dict, List
from .utils import get_zodiac_sign, normalize_degree

ODD_SIGNS = [0, 2, 4, 6, 8, 10] # Aries, Gemini, Leo...
EVEN_SIGNS = [1, 3, 5, 7, 9, 11] # Taurus, Cancer, Virgo...

def get_baladi_avastha(planet_long: float, sign_idx: int) -> dict:
    """
    Calculates Baladi Avastha (Age State).
    Odd Signs: 0-6 Infant, 6-12 Young, 12-18 Adolescent, 18-24 Old, 24-30 Dead.
    Even Signs: Reverse order.
    """
    degree = planet_long % 30
    
    states = ["Infant (Baala)", "Young (Kumara)", "Adolescent (Yuva)", "Old (Vriddha)", "Dead (Mrita)"]
    
    # 0-6, 6-12, 12-18, 18-24, 24-30
    idx = int(degree / 6)
    
    if idx > 4: idx = 4 # Safety
    
    state = ""
    if sign_idx in ODD_SIGNS:
        state = states[idx]
        numeric_strength = [0.25, 0.5, 1.0, 0.1, 0.0][idx]
    else:
        # Reverse check
        state = states[4 - idx]
        numeric_strength = [0.25, 0.5, 1.0, 0.1, 0.0][4 - idx]
        
    return {
        "name": "Baladi",
        "state": state,
        "score": numeric_strength
    }

def get_jagradadi_avastha(planet: str, sign_idx: int, is_retro: bool = False) -> dict:
    """
    Calculates Jagradadi Avastha (Wakefulness State).
    Awake (Jagrat): Own sign or exaltation.
    Dreaming (Swapna): Friend's or neutral sign.
    Sleeping (Sushupti): Enemy's or debilitation sign.
    """
    # Simplified relationships map (Ideal approach uses Friendship table)
    OWN_SIGNS = {
        "Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5],
        "Jupiter": [8, 11], "Venus": [1, 6], "Saturn": [9, 10]
    }
    EXALTATION = {
        "Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5,
        "Jupiter": 3, "Venus": 11, "Saturn": 6, "Rahu": 1, "Ketu": 7
    }
    DEBILITATION = {
        "Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11,
        "Jupiter": 9, "Venus": 5, "Saturn": 0, "Rahu": 7, "Ketu": 1
    }
    
    state = "Dreaming (Swapna)" # Default
    
    if sign_idx in OWN_SIGNS.get(planet, []) or sign_idx == EXALTATION.get(planet):
        state = "Awake (Jagrat)"
    elif sign_idx == DEBILITATION.get(planet):
        state = "Sleeping (Sushupti)"
        
    return {
        "name": "Jagradadi",
        "state": state
    }

def get_deeptadi_avastha(planet: str, sign_idx: int, aspected_by: List[str] = []) -> dict:
    """
    Calculates Deeptadi Avastha (Luminous/Mood State).
    Deepta (Blazing): Exaltation
    Swatha (Own): Own house
    Mudita (Delighted): Friendly house
    Shanta (Peaceful): Auspicious vargas (simplified to Benefic sign here)
    Dina (Depressed): Debilitation
    Dukhita (Pained): Enemy sign
    Vikala (Crippled): Combustion (input needed)
    Khala (Wicked): Malefic sign
    """
    # Using previous dicts...
    EXALTATION = {"Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5, "Jupiter": 3, "Venus": 11, "Saturn": 6}
    DEBILITATION = {"Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11, "Jupiter": 9, "Venus": 5, "Saturn": 0}
    OWN_SIGNS = {
        "Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5],
        "Jupiter": [8, 11], "Venus": [1, 6], "Saturn": [9, 10]
    }
    
    if sign_idx == EXALTATION.get(planet):
        return {"name": "Deeptadi", "state": "Deepta (Blazing)", "meaning": "Maximum Strength"}
    elif sign_idx in OWN_SIGNS.get(planet, []):
         return {"name": "Deeptadi", "state": "Swatha (Confident)", "meaning": "Strong, Comfortable"}
    elif sign_idx == DEBILITATION.get(planet):
         return {"name": "Deeptadi", "state": "Dina (Depressed)", "meaning": "Weak, Struggling"}
         
    return {"name": "Deeptadi", "state": "Neutral", "meaning": "Average"}

def calculate_all_avasthas(planet: str, longitude: float) -> list:
    if planet in ["Rahu", "Ketu"]: return [] # Usually typically applies to 7 planets
    
    sign_idx = int(longitude / 30)
    
    return [
        get_baladi_avastha(longitude, sign_idx),
        get_jagradadi_avastha(planet, sign_idx),
        get_deeptadi_avastha(planet, sign_idx)
    ]
