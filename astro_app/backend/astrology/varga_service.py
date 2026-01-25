from astro_app.backend.astrology.utils import normalize_degree, get_zodiac_sign, get_nakshatra
from astro_app.backend.astrology.external_api import astrology_api_service
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

def get_varga_sign_index(lon: float, division: int) -> int:
    """
    Standard formula for most divisional charts:
    sign_index = (int(lon * division / 30)) % 12
    """
    return int((lon * division) / 30) % 12

def calculate_hora_d2(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    # Odd signs (1,3,5,7,9,11): 0-15 Sun (Leo), 15-30 Moon (Cancer)
    # Even signs (2,4,6,8,10,12): 0-15 Moon (Cancer), 15-30 Sun (Leo)
    is_odd = (sign_index % 2) == 0 # 0=Aries (1st), 2=Gemini (3rd)...
    
    if is_odd:
        sign_idx = 4 if degree_in_sign < 15 else 3 # 4=Leo, 3=Cancer
    else:
        sign_idx = 3 if degree_in_sign < 15 else 4
        
    return {
        "chart": "D2",
        "zodiac_sign": get_zodiac_sign(sign_idx * 30),
        "longitude": (sign_idx * 30) + (degree_in_sign * 2) % 30 # illustrative
    }

def calculate_drekkana_d3(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part = int(degree_in_sign / 10) # 0, 1, 2
    # 1st part: Same sign
    # 2nd part: 5th sign
    # 3rd part: 9th sign
    v_sign_idx = (sign_index + (part * 4)) % 12
    
    return {
        "chart": "D3",
        "zodiac_sign": get_zodiac_sign(v_sign_idx * 30),
        "longitude": (v_sign_idx * 30) + (degree_in_sign * 3) % 30
    }

def calculate_chaturthamsa_d4(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part = int(degree_in_sign / 7.5) # 0, 1, 2, 3
    # Mapping: 1, 4, 7, 10 signs from root sign
    v_sign_idx = (sign_index + (part * 3)) % 12
    
    return {
        "chart": "D4",
        "zodiac_sign": get_zodiac_sign(v_sign_idx * 30)
    }

def calculate_saptamsa_d7(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part = int(degree_in_sign / (30/7))
    is_odd = (sign_index % 2) == 0
    
    if is_odd:
        # Start from same sign
        v_sign_idx = (sign_index + part) % 12
    else:
        # Start from 7th sign
        v_sign_idx = (sign_index + 6 + part) % 12
        
    return { "chart": "D7", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

def calculate_dashamsa_d10(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part = int(degree_in_sign / 3)
    is_odd = (sign_index % 2) == 0
    
    if is_odd:
        v_sign_idx = (sign_index + part) % 12
    else:
        # Start from 9th sign
        v_sign_idx = (sign_index + 8 + part) % 12
        
    return { "chart": "D10", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

def calculate_dwadasamsa_d12(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part = int(degree_in_sign / 2.5)
    v_sign_idx = (sign_index + part) % 12
    return { "chart": "D12", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

def calculate_vimsamsa_d20(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part = int(degree_in_sign / 1.5)
    # Table based on element
    rem = sign_index % 3
    if rem == 0: # Movable (Aries...) -> Start Aries
        start = 0
    elif rem == 1: # Fixed (Taurus...) -> Start Sagittarius
        start = 8
    else: # Dual (Gemini...) -> Start Leo
        start = 4
        
    v_sign_idx = (start + part) % 12
    return { "chart": "D20", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

def calculate_chaturvimsamsa_d24(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part = int(degree_in_sign / 1.25)
    is_odd = (sign_index % 2) == 0
    start = 4 if is_odd else 10 # Leo if odd, Scorpio if even (Actually Scorpio is 8th sign from Aries, Leo is 5th)
    # Correction: Odd signs start from Leo (4), Even signs start from Scorpio (7)
    start = 4 if is_odd else 7
    v_sign_idx = (start + part) % 12
    return { "chart": "D24", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

def calculate_saptavimsamsa_d27(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    degree_in_sign = normalized_lon % 30
    
    part = int(degree_in_sign / (30/27))
    # Based on element: Fire starts Aries, Earth starts Cancer, Air starts Libra, Water starts Capricorn
    rem = sign_index % 4
    start_map = [0, 3, 6, 9]
    v_sign_idx = (start_map[rem] + part) % 12
    return { "chart": "D27", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

def calculate_trimsamsa_d30(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    deg = normalized_lon % 30
    is_odd = (sign_index % 2) == 0
    
    if is_odd:
        if deg < 5: sign_idx = 0 # Aries (Mars)
        elif deg < 10: sign_idx = 10 # Aquarius (Saturn)
        elif deg < 18: sign_idx = 8 # Sagittarius (Jupiter)
        elif deg < 25: sign_idx = 2 # Gemini (Mercury)
        else: sign_idx = 6 # Libra (Venus)
    else:
        if deg < 5: sign_idx = 1 # Taurus (Venus)
        elif deg < 12: sign_idx = 5 # Virgo (Mercury)
        elif deg < 20: sign_idx = 11 # Pisces (Jupiter)
        elif deg < 25: sign_idx = 9 # Capricorn (Saturn)
        else: sign_idx = 7 # Scorpio (Mars)
        
    return { "chart": "D30", "zodiac_sign": get_zodiac_sign(sign_idx * 30) }

def calculate_khavedamsa_d40(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    deg = normalized_lon % 30
    part = int(deg / 0.75)
    is_odd = (sign_index % 2) == 0
    start = 0 if is_odd else 6 # Aries if odd, Libra if even
    v_sign_idx = (start + part) % 12
    return { "chart": "D40", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

def calculate_akshavedamsa_d45(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    deg = normalized_lon % 30
    part = int(deg / (30/45))
    # Movable: Aries, Fixed: Leo, Dual: Sagittarius
    rem = sign_index % 3
    start = [0, 4, 8][rem]
    v_sign_idx = (start + part) % 12
    return { "chart": "D45", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

def calculate_shastyamsa_d60(longitude: float) -> dict:
    normalized_lon = normalize_degree(longitude)
    sign_index = int(normalized_lon / 30)
    deg = normalized_lon % 30
    part = int(deg / 0.5)
    v_sign_idx = (sign_index + part) % 12 # Simple mapping
    return { "chart": "D60", "zodiac_sign": get_zodiac_sign(v_sign_idx * 30) }

# Import existing ones from divisional.py if needed or rewrite for consistency
from astro_app.backend.astrology.divisional import calculate_d9_navamsa, calculate_d16_shodashamsa

async def get_all_shodashvargas(planets_d1: list, birth_details: Optional[Dict[str, Any]] = None) -> dict:
    """
    Calculates all 16 divisional charts (Shodashvarga).
    If birth_details is provided and astrology-api.io is configured,
    it will attempt to fetch high-precision charts from the external API.
    """
    # 1. Try external API first if birth_details is provided
    if birth_details:
        external_vargas = await astrology_api_service.get_shodasha_varga(birth_details)
        if external_vargas:
            logger.info("Successfully fetched Shodashvarga from astrology-api.io")
            # Ensure significance is added even for external results
            for v_name in external_vargas:
                if isinstance(external_vargas[v_name], dict):
                    external_vargas[v_name]["significance"] = VARGA_SIGNIFICANCE.get(v_name, "")
            return external_vargas

    # 2. Fallback to local calculations
    vargas = {}
    varga_funcs = {
        "D1": lambda lon: {"zodiac_sign": get_zodiac_sign(lon)},
        "D2": calculate_hora_d2,
        "D3": calculate_drekkana_d3,
        "D4": calculate_chaturthamsa_d4,
        "D7": calculate_saptamsa_d7,
        "D9": calculate_d9_navamsa,
        "D10": calculate_dashamsa_d10,
        "D12": calculate_dwadasamsa_d12,
        "D16": calculate_d16_shodashamsa,
        "D20": calculate_vimsamsa_d20,
        "D24": calculate_chaturvimsamsa_d24,
        "D27": calculate_saptavimsamsa_d27,
        "D30": calculate_trimsamsa_d30,
        "D40": calculate_khavedamsa_d40,
        "D45": calculate_akshavedamsa_d45,
        "D60": calculate_shastyamsa_d60,
    }
    
    for v_name, func in varga_funcs.items():
        chart_planets = []
        # Calculate all planet positions in this varga
        for p in planets_d1:
            res = func(p["longitude"])
            res["name"] = p["name"]
            chart_planets.append(res)
        
        # Find the Ascendant in this varga to determine houses
        asc_varga = next((p for p in chart_planets if p["name"] == "Ascendant"), None)
        if asc_varga:
            from astro_app.backend.astrology.utils import ZODIAC_SIGNS
            asc_sign_idx = ZODIAC_SIGNS.index(asc_varga["zodiac_sign"])
            
            for p in chart_planets:
                p_sign_idx = ZODIAC_SIGNS.index(p["zodiac_sign"])
                house = (p_sign_idx - asc_sign_idx) % 12 + 1
                p["house"] = house
        
        vargas[v_name] = {
            "planets": chart_planets,
            "ascendant": asc_varga,
            "significance": VARGA_SIGNIFICANCE.get(v_name, "")
        }
        
    return vargas

VARGA_SIGNIFICANCE = {
    "D1": "Basic physical body, general vitality and fortune.",
    "D2": "Wealth, family, and assets.",
    "D3": "Siblings, courage, and neighbors.",
    "D4": "Property, vehicles, and happiness.",
    "D7": "Progeny, children, and grand-children.",
    "D9": "Spouse, partners, and the fruit of all efforts.",
    "D10": "Profession, career, and public status.",
    "D12": "Parents and ancestry.",
    "D16": "Conveyances, vehicles, and general comforts.",
    "D20": "Spiritual progress and religious inclinations.",
    "D24": "Education, knowledge, and learning.",
    "D27": "General strength and weaknesses.",
    "D30": "Misfortunes, evils, and character flaws.",
    "D40": "Auspicious events and general well-being.",
    "D45": "General character and overall merits.",
    "D60": "Past karma and overall precision analysis."
}
