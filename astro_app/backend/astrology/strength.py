from .utils import get_zodiac_sign, normalize_degree

def calculate_bhava_bala(chart_data: dict, shadbala_values: dict = None) -> list:
    """
    Calculates Bhava Bala (House Strength) for 12 houses.
    Simplified Components:
    1. Bhavadhipati Bala (Strength of House Lord) - Derived from Shadbala
    2. Bhava Digbala (Directional Strength of House) - Signs in Kendall/Angle
    3. Bhava Drishti Bala (Aspect Strength) - Benefic/Malefic aspects on the house
    """
    
    # Needs structure to hold results
    bhava_balas = []
    
    # 1. Map lords to houses
    # Aries: Mars, Taurus: Venus...
    sign_lords = {
        "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
        "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
        "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    }

    # Helper: Get Shadbala of a planet
    def get_planet_strength(p_name):
        if not shadbala_values: return 6.0 # Avg rupas
        for p in shadbala_values.get("planets", []):
            if p["name"] == p_name:
                return p.get("total_rupas", 6.0)
        return 6.0
        
    asc_sign = chart_data["ascendant"]["zodiac_sign"]
    asc_idx = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].index(asc_sign)
    
    # Pre-process planet positions for Aspect Check
    planet_positions = {p["name"]: p["longitude"] for p in chart_data["planets"]}
    
    # Benefics/Malefics (Natural)
    # Variable nature (Moon/Mercury) ignored for simplicity, handled as beneficiaries usually
    BENEFICS = ["Jupiter", "Venus", "Moon", "Mercury"]
    MALEFICS = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"]
    
    for house_num in range(1, 13):
        # Determine Sign on House Cusp (Assuming Whole Sign for simplicity if unavailable)
        # Or Equal House from Ascendant
        current_sign_idx = (asc_idx + house_num - 1) % 12
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        sign_on_cusp = signs[current_sign_idx]
        
        # 1. Lord Strength
        lord = sign_lords.get(sign_on_cusp)
        lord_strength = get_planet_strength(lord)
        
        # 2. Digbala (Directional Strength of Signs)
        # Narayana Dasa/Jaimini logic or standard Dikbala? 
        # Standard: 
        # House 1 (East): Mercury/Jupiter strong
        # House 10 (South): Sun/Mars strong
        # House 7 (West): Saturn strong
        # House 4 (North): Moon/Venus strong
        # Here we are calc HOUSE strength. 
        # Ancient texts say: Kendra houses (1,4,7,10) are strongest. Panapara (2,5,8,11) moderate. Apoklima (3,6,9,12) weak.
        placement_strength = 0
        if house_num in [1, 4, 7, 10]: placement_strength = 60
        elif house_num in [2, 5, 8, 11]: placement_strength = 30
        else: placement_strength = 15
        
        # 3. Drishti Bala (Aspects on Bhava)
        # Calculate angle from each planet to House Cusp Middle (House Num * 30 + Asc Deg?)
        # Let's assume Middle of House = Ascendant Degree + (H-1)*30
        house_mid_deg = normalize_degree(chart_data["ascendant"]["longitude"] + (house_num - 1) * 30)
        
        aspect_score = 0
        for p_name, p_long in planet_positions.items():
            if p_name in ["Rahu", "Ketu"]: continue # Simplified aspects
            
            diff = normalize_degree(p_long - house_mid_deg) # Planet to House logic usually P -> H, so H - P?
            # Actually Aspect is Planet looking at House.
            # Angle = House - Planet.
            angle = normalize_degree(house_mid_deg - p_long)
            
            # Simple Vedic Aspects (Whole sign)
            # General: 7th (180 deg)
            # Mars: 4, 7, 8
            # Jupiter: 5, 7, 9
            # Saturn: 3, 7, 10
            is_aspecting = False
            
            # Tolerance +/- 15 deg for orb strength? Or just Sign based?
            # Let's stick to Sign based for simple "Is Aspecting" logic
            # House Sign Index vs Planet Sign Index
            p_sign_idx = int(p_long / 30)
            h_sign_idx = current_sign_idx
            
            sign_diff = (h_sign_idx - p_sign_idx) % 12
            if sign_diff == 0: sign_diff = 12 # 12th house relative? No, 0 is conjunction (1st house)
            else: sign_diff += 1 # Convert 0-11 to 1-12 relative house
            
            if sign_diff == 7: is_aspecting = True
            if p_name == "Mars" and sign_diff in [4, 8]: is_aspecting = True
            if p_name == "Jupiter" and sign_diff in [5, 9]: is_aspecting = True
            if p_name == "Saturn" and sign_diff in [3, 10]: is_aspecting = True
            
            if is_aspecting:
                strength = get_planet_strength(p_name)
                # Benefic adds, Malefic subtracts (Drig Bala logic)
                # Or for Bhava Purbness, interaction matters.
                # Simplified: + Strength if Benefic, - Strength if Malefic
                if p_name in BENEFICS: aspect_score += (strength * 0.25)
                elif p_name in MALEFICS: aspect_score -= (strength * 0.25)

        total_score = lord_strength + (placement_strength / 60.0 * 5) + aspect_score 
        # Normalized roughly to Rupas (approx)
        
        bhava_balas.append({
            "house": house_num,
            "sign": sign_on_cusp,
            "lord": lord,
            "score": round(total_score, 2),
            "label": "Strong" if total_score > 8 else "Average" if total_score > 5 else "Weak"
        })
        
    return bhava_balas

async def calculate_vimsopaka_bala(birth_details: dict, planets_d1: list) -> dict:
    """
    Calculates Vimsopaka Bala (20-point strength) based on divisional charts.
    Uses Shad-Varga (6), Sapta-Varga (7), Dasa-Varga (10), or Shodasha-Varga (16).
    Here we implement a simplified Shadvarga scheme (6 Vargas) as an example constant.
    Real implementation should weight placement in D1, D2, D3, D9, D12, D30.
    """
    # 1. Get Vargas
    from astro_app.backend.astrology.varga_service import get_all_shodashvargas
    
    # Needs planets input format for vargas
    # planets_d1 is [{'name':..., 'longitude':...}]
    # We call get_all_shodashvargas
    try:
        vargas = await get_all_shodashvargas(planets_d1, birth_details)
    except Exception:
        vargas = {} # Fallback
        
    scores = {}
    
    # 2. Iterate planets
    # Simple mock logic: If in Own/Exalted in D9/D1 etc -> Add points.
    for p in planets_d1:
        p_name = p['name']
        if p_name in ["Rahu", "Ketu", "Ascendant", "Uranus", "Neptune", "Pluto"]: continue
        
        score = 10.0 # Base
        
        # Check D9 (Navamsa) - Critical
        d9_data = vargas.get("D9", {}).get("planets", [])
        for d9_p in d9_data:
            if d9_p["name"] == p_name:
                dignity = d9_p.get("dignity", "Neutral")
                if dignity == "Exalted": score += 5
                elif dignity == "Own Sign": score += 3
                elif dignity == "Debilitated": score -= 5
                break
                
        scores[p_name] = min(20, max(0, score))
        
    return scores

def calculate_ishta_kashta_phala(planet_name: str, longitude: float, cheshta_bala: float) -> dict:
    """
    Calculates Ishta Phala (Benefic Result) and Kashta Phala (Malefic Result).
    Ishta = (Uchcha Bala * Cheshta Bala) / (60*60) ? No, typically Sqrt(Uchcha * Cheshta).
    Standard:
    Uchcha Bala = 60 * (180 - dist from debilitation)/180. (0 to 60)
    Ishta Phala = (Uchcha Bala + Cheshta Bala) / 2?
    
    Classic Formula (B.V. Raman):
    Ishta Phala = Sqrt(Uchcha Bala * Cheshta Bala)
    Kashta Phala = 60 - Ishta
    """
    # 1. Calculate Uchcha Bala (Exaltation Strength)
    # Exaltation Points
    exaltation_points = {
        "Sun": 10, "Moon": 33, "Mars": 298, "Mercury": 165,
        "Jupiter": 95, "Venus": 357, "Saturn": 200
    }
    debilitation_points = {
        "Sun": 190, "Moon": 213, "Mars": 118, "Mercury": 345,
        "Jupiter": 275, "Venus": 177, "Saturn": 20
    }
    
    deep_deb = debilitation_points.get(planet_name, 0)
    
    # Distance from deep debilitation
    # Max distance is 180. 
    diff = abs(longitude - deep_deb)
    if diff > 180: diff = 360 - diff
    
    uchcha_bala = (diff / 180.0) * 60.0
    
    # 2. Ishta Phala
    # Formula: (Uchcha * Cheshta) ?? No.
    # Ishta = (Uchcha Bala * Cheshta Bala) / 60 ??
    # Let's use SQRT approach for balanced output 0-60
    import math
    try:
        ishta = math.sqrt(pad_value(uchcha_bala) * pad_value(cheshta_bala))
    except:
        ishta = (uchcha_bala + cheshta_bala) / 2
        
    kashta = 60.0 - ishta
    
    return {
        "ishta": round(ishta, 2),
        "kashta": round(kashta, 2),
        "uchcha_bala": round(uchcha_bala, 2)
    }

def pad_value(v):
    return max(0, v)
