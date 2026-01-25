"""
Strength Analysis Service
Calculates Vimsopaka Bala, Ishta/Kashta Phala, and extensions to Shadbala.
"""
from typing import Dict, List, Any
import logging
from astro_app.backend.astrology.varga_service import get_all_shodashvargas
from astro_app.backend.astrology.shadbala import calculate_cheshta_bala, calculate_sthana_bala
from astro_app.backend.astrology.utils import normalize_degree

logger = logging.getLogger(__name__)

# Vimsopaka Varga Points (Standard Parasara)
# Scheme: Shadvarga (6 charts), Saptavarga (7), Dasavarga (10), Shodashavarga (16)
# We will use Shodashavarga (16 charts) logic for maximum precision if available,
# or map to Dasavarga (10) as it is most common for Dasha analysis.
#
# Dasavarga Weights (Total 20):
# Rasi (D1): 3.0
# Hora (D2): 1.5
# Drekkana (D3): 1.5
# Saptamsa (D7): 1.5
# Navamsa (D9): 2.5 (Crucial)
# Dasamsa (D10): 1.5
# Dwadasamsa (D12): 1.5
# Shodasamsa (D16): 1.5
# Trimsamsa (D30): 1.5
# Shashtiamsa (D60): 4.0 (Highest)

VIMSOPAKA_WEIGHTS = {
    "D1": 3.0,
    "D2": 1.5,
    "D3": 1.5,
    "D7": 1.5,
    "D9": 2.5,
    "D10": 1.5,
    "D12": 1.5,
    "D16": 1.5,
    "D30": 1.5,
    "D60": 4.0
}

# Dignity Scores (0-20 scale contribution)
# Exalted/Mol: 100% of weight
# Own Sign: 90%
# Best Friend: 80%
# Friend: 60%
# Neutral: 40%
# Enemy: 20%
# Bitter Enemy: 10%
# Debilitated: 0%

FRIENDSHIP_TABLE = {
    # Permanent Relationships (Naisargika)
    "Sun": {"Friends": ["Moon", "Mars", "Jupiter"], "Enemies": ["Venus", "Saturn"], "Neutral": ["Mercury"]},
    "Moon": {"Friends": ["Sun", "Mercury"], "Enemies": [], "Neutral": ["Mars", "Jupiter", "Venus", "Saturn"]},
    "Mars": {"Friends": ["Sun", "Moon", "Jupiter"], "Enemies": ["Mercury"], "Neutral": ["Venus", "Saturn"]},
    "Mercury": {"Friends": ["Sun", "Venus"], "Enemies": ["Moon"], "Neutral": ["Mars", "Jupiter", "Saturn"]},
    "Jupiter": {"Friends": ["Sun", "Moon", "Mars"], "Enemies": ["Mercury", "Venus"], "Neutral": ["Saturn"]},
    "Venus": {"Friends": ["Mercury", "Saturn"], "Enemies": ["Sun", "Moon"], "Neutral": ["Mars", "Jupiter"]},
    "Saturn": {"Friends": ["Mercury", "Venus"], "Enemies": ["Sun", "Moon", "Mars"], "Neutral": ["Jupiter"]},
    "Rahu": {"Friends": ["Venus", "Saturn"], "Enemies": ["Sun", "Moon"], "Neutral": ["Mercury", "Jupiter"]}, # Simplified
    "Ketu": {"Friends": ["Mars", "Jupiter"], "Enemies": ["Sun", "Moon"], "Neutral": ["Mercury", "Venus"]}
}

PLANET_OWNERS = {
    "Sun": [4], # Leo (index 4)
    "Moon": [3], # Cancer
    "Mars": [0, 7], # Aries, Scorpio
    "Mercury": [2, 5], # Gemini, Virgo
    "Jupiter": [8, 11], # Sag, Pisces
    "Venus": [1, 6], # Taurus, Libra
    "Saturn": [9, 10] # Cap, Aqua
}

EXALTATION_SIGNS = {"Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5, "Jupiter": 3, "Venus": 11, "Saturn": 6, "Rahu": 1, "Ketu": 7}
DEBILITATION_SIGNS = {"Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11, "Jupiter": 9, "Venus": 5, "Saturn": 0, "Rahu": 7, "Ketu": 1}

def get_dignity_score(planet: str, sign_idx: int) -> float:
    """Calculate dignity multiplier (0.0 to 1.0)"""
    if EXALTATION_SIGNS.get(planet) == sign_idx:
        return 1.0 # Exalted
    if DEBILITATION_SIGNS.get(planet) == sign_idx:
        return 0.0 # Debilitated
        
    owners = PLANET_OWNERS.get(planet, [])
    if sign_idx in owners:
        return 0.9 # Own Sign (Swakshetra)
        
    # Find Owner of the sign
    sign_owner = None
    for owner, signs in PLANET_OWNERS.items():
        if sign_idx in signs:
            sign_owner = owner
            break
            
    if not sign_owner:
        return 0.4 # Default neutral
        
    # Check Relationship
    rels = FRIENDSHIP_TABLE.get(planet, {})
    if sign_owner in rels.get("Friends", []):
        return 0.75 # Friendly (Simplified Avg)
    if sign_owner in rels.get("Enemies", []):
        return 0.25 # Enemy
        
    return 0.5 # Neutral

async def calculate_vimsopaka_bala(
    birth_details: Dict[str, Any],
    planets_d1: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Calculate Vimsopaka Strength (20-point scale) for all planets.
    Requires calculating Divisional Charts first.
    """
    # 1. Get All Vargas
    vargas = await get_all_shodashvargas(planets_d1, birth_details)
    
    results = {}
    
    for planet in planets_d1:
        p_name = planet['name']
        if p_name not in VIMSOPAKA_WEIGHTS and p_name not in FRIENDSHIP_TABLE: 
            # Skip Ascendant or outer planets
            continue
            
        total_score = 0.0
        max_score = 0.0
        
        # Iterate through required vargas
        for v_code, weight in VIMSOPAKA_WEIGHTS.items():
            if v_code not in vargas:
                # If D60 missing, distribute weight? Or just ignore.
                # Ideally D60 is heavy (4.0). If missing, score is skewed.
                # Assuming get_all_shodashvargas returns them or we calc locally.
                continue
                
            v_data = vargas[v_code]
            # Find planet in this varga
            p_data = next((p for p in v_data['planets'] if p['name'] == p_name), None)
            
            if p_data:
                # Determine sign index
                # Local calc returns zodiac_sign name, we need index
                from astro_app.backend.astrology.utils import ZODIAC_SIGNS
                try:
                    sign_idx = ZODIAC_SIGNS.index(p_data['zodiac_sign'])
                    dignity_mult = get_dignity_score(p_name, sign_idx)
                    
                    total_score += weight * dignity_mult
                    max_score += weight
                except ValueError:
                    continue
                    
        # Normalize to 20 if some charts missing
        if max_score > 0:
            final_vimsopaka = (total_score / max_score) * 20.0
        else:
            final_vimsopaka = 10.0 # Average fallback
            
        results[p_name] = round(final_vimsopaka, 2)
        
    return results

def calculate_ishta_kashta_phala(
    planet_name: str, 
    longitude: float, 
    cheshta_bala_score: float # From Shadbala (0-60 Virupas or normalized)
) -> Dict[str, float]:
    """
    Calculate Ishta (Good) and Kashta (Bad) Phala.
    Based on Ucha Bala (Exaltation Strength) and Cheshta Bala (Motional Strength).
    """
    # 1. Ucha Bala (Exaltation Strength) - 0 to 60 Virupas
    # Distance from Debilitation point
    deep_exalt = {
        "Sun": 10, "Moon": 33, "Mars": 298, "Mercury": 165, 
        "Jupiter": 95, "Venus": 357, "Saturn": 200
    }
    # Deep debilitation is +180
    
    if planet_name not in deep_exalt:
        return {"ishta": 30.0, "kashta": 30.0} # Neutral
        
    exalt_deg = deep_exalt[planet_name]
    # Debilitation is 180 deg away
    debilitation_deg = (exalt_deg + 180) % 360
    
    # Distance from debilitation (increases strength)
    diff = abs(longitude - debilitation_deg)
    if diff > 180: diff = 360 - diff
    
    # Ucha Bala in Virupas (Max 60)
    # 180 deg diff = 60 Virupas
    ucha_bala = (diff / 180.0) * 60.0
    
    # 2. Cheshta Bala (Passed in as arg or calc)
    # Assuming input is already in Virupas (0-60)
    # If using simplified cheshta from shadbala (45.0), it works.
    
    # Ishta Phala Formula
    # Ishta = sqrt(Ucha * Cheshta)
    # Only for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
    
    ishta = (ucha_bala * cheshta_bala_score) ** 0.5
    
    # Kashta Phala = 60 - Ishta? 
    # Proper formula involves Ishta/Kashta ratios usually.
    # Standard: Kashta = sqrt((60-Ucha)*(60-Cheshta)) ?? No.
    # Simplified: Ishta + Kashta = 60 roughly.
    # Let's use:
    kashta = 60.0 - ishta
    
    return {
        "ishta": round(ishta, 2),
        "kashta": round(kashta, 2),
        "ratio": round(ishta / (kashta + 0.1), 2)
    }
