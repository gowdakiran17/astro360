from astro_app.backend.astrology.utils import get_zodiac_sign
import random
from datetime import datetime

# Planet to Direction Mapping (Standard Vastu/Vedic)
PLANET_DIRECTIONS = {
    "Sun": "East",
    "Moon": "North-West",
    "Mars": "South",
    "Mercury": "North",
    "Jupiter": "North-East",
    "Venus": "South-East",
    "Saturn": "West",
    "Rahu": "South-West",
    "Ketu": "Center"
}

# Attributes associated with 16 Directions (MahaVastu)
DIRECTION_ATTRIBUTES = {
    "North": {"element": "Water", "aspects": ["Money", "Career", "Opportunities"], "ruler": "Mercury", "avoid": ["Toilet", "Kitchen", "Heavy Storage", "Stairs", "Fire Element"]},
    "North-North-East": {"element": "Water", "aspects": ["Health", "Immunity", "Healing"], "ruler": "Moon", "avoid": ["Toilet", "Kitchen", "Heavy Storage", "Fire Element"]},
    "North-East": {"element": "Water/Ether", "aspects": ["Mind", "Clarity", "Vision"], "ruler": "Jupiter", "avoid": ["Toilet", "Kitchen", "Stairs", "Heavy Storage", "Master Bedroom"]},
    "East-North-East": {"element": "Air", "aspects": ["Fun", "Recreation"], "ruler": "Jupiter", "avoid": ["Toilet"]},
    "East": {"element": "Air", "aspects": ["Social Connections", "Government"], "ruler": "Sun", "avoid": ["Toilet", "Heavy Storage"]},
    "East-South-East": {"element": "Air", "aspects": ["Churning", "Anxiety", "Analysis"], "ruler": "Venus", "avoid": ["Bedroom", "Entrance"]},
    "South-East": {"element": "Fire", "aspects": ["Cash Flow", "Liquidity", "Women"], "ruler": "Venus", "avoid": ["Water Tank", "Mirror", "Toilet", "Entrance"]},
    "South-South-East": {"element": "Fire", "aspects": ["Power", "Confidence"], "ruler": "Mars", "avoid": ["Water Tank", "Mirror"]},
    "South": {"element": "Fire/Earth", "aspects": ["Fame", "Relaxation", "Sleep"], "ruler": "Mars", "avoid": ["Water Tank", "Mirror", "Entrance", "Temple"]},
    "South-South-West": {"element": "Earth", "aspects": ["Disposal", "Expenditure", "Wastage"], "ruler": "Rahu", "avoid": ["Bedroom", "Entrance", "Kitchen", "Safe"]},
    "South-West": {"element": "Earth", "aspects": ["Relationships", "Stability", "Skills"], "ruler": "Rahu", "avoid": ["Toilet", "Kitchen", "Cut", "Underground Water"]},
    "West-South-West": {"element": "Space", "aspects": ["Education", "Savings", "Knowledge"], "ruler": "Saturn", "avoid": ["Toilet", "Kitchen"]},
    "West": {"element": "Space", "aspects": ["Gains", "Profits", "Achievements"], "ruler": "Saturn", "avoid": ["Toilet", "Entrance", "Kitchen"]},
    "West-North-West": {"element": "Space", "aspects": ["Depression", "Detox", "Letting Go"], "ruler": "Moon", "avoid": ["Bedroom", "Entrance", "Kitchen", "Safe"]},
    "North-West": {"element": "Air", "aspects": ["Support", "Banking", "Travel"], "ruler": "Moon", "avoid": ["Kitchen", "Entrance", "Fire Element"]},
    "North-North-West": {"element": "Water", "aspects": ["Attraction", "Intimacy"], "ruler": "Mercury", "avoid": ["Kitchen", "Toilet", "Temple"]}
}

BUSINESS_RULES = {
    "Office": {
        "Cash Counter": {"best": ["North", "North-East", "South-East"], "avoid": ["South-South-West", "West-North-West"]},
        "Owner Seat": {"best": ["South-West", "South"], "avoid": ["North-East", "North-West"]},
        "Staff": {"best": ["West", "North-West"], "avoid": []},
        "Marketing": {"best": ["North-West", "South"], "avoid": []}
    },
    "Shop": {
        "Cash Counter": {"best": ["North", "South-East"], "avoid": ["South-South-West"]},
        "Entrance": {"best": ["North", "East", "North-East"], "avoid": ["South-West"]}
    },
    "Factory": {
        "Heavy Machinery": {"best": ["South-West", "West", "South"], "avoid": ["North-East", "North"]},
        "Fire Element": {"best": ["South-East", "South"], "avoid": ["North", "North-East"]},
        "Raw Material": {"best": ["South-West"], "avoid": []},
        "Finished Goods": {"best": ["North-West"], "avoid": []}
    },
    "Restaurant": {
        "Kitchen": {"best": ["South-East"], "avoid": ["North-East", "South-West"]},
        "Cash Counter": {"best": ["North", "South-East"], "avoid": ["South-South-West"]},
        "Seating": {"best": ["West", "South"], "avoid": []}
    }
}

# Sign to Direction Mapping (for Lagna/4th House)
SIGN_DIRECTIONS = {
    "Aries": "East", "Leo": "East", "Sagittarius": "East",
    "Taurus": "South", "Virgo": "South", "Capricorn": "South",
    "Gemini": "West", "Libra": "West", "Aquarius": "West",
    "Cancer": "North", "Scorpio": "North", "Pisces": "North"
}

def get_personal_direction_strength(planets_data: list, dasha_lord: str) -> list:
    """
    Calculates strength of each direction based on planetary dignity and dasha.
    """
    directions_status = []
    
    # Helper to find planet in list
    def find_planet(name):
        return next((p for p in planets_data if p["name"] == name), None)

    for direction, attr in DIRECTION_ATTRIBUTES.items():
        ruler = attr["ruler"]
        planet = find_planet(ruler)
        
        strength_score = 5 # Base 0-10
        status_label = "Neutral"
        
        if planet:
            # Boost if Dasha Lord
            if ruler == dasha_lord:
                strength_score += 3
                status_label = "Active (Dasha)"
            
            # Simple Friend/Enemy logic (Simplified Vedic)
            # This would ideally come from a deeper astrology module
            pass

        # Classify
        if strength_score >= 8: strength = "Very Strong"
        elif strength_score >= 6: strength = "Strong"
        elif strength_score >= 4: strength = "Medium"
        else: strength = "Weak"
        
        directions_status.append({
            "direction": direction,
            "strength": strength,
            "score": strength_score,
            "status": status_label,
            "ruler": ruler,
            "aspects": attr["aspects"]
        })
        
    return directions_status

def get_advanced_remedies(defect_type: str, direction: str) -> list:
    """
    Returns detailed, structured remedies for specific Vastu defects.
    """
    remedies = []
    
    # TOILET REMEDIES
    if defect_type == "Toilet":
        if direction in ["North", "North-East"]:
            remedies.append({
                "type": "Elemental",
                "title": "Blue Tape Correction",
                "description": "Apply a 4-inch wide blue tape on the floor around the toilet seat.",
                "priority": "High",
                "cost": "Low (<$10)",
                "risk": "None",
                "time_to_effect": "14-21 days",
                "astro_reason": "Blue represents Water/Space, neutralizing the disposal energy without conflict.",
                "vastu_reason": "Blocks the negative energy of the toilet from spreading to the Money/Mind zone."
            })
            remedies.append({
                "type": "Salt Cleansing",
                "title": "Sea Salt Absorber",
                "description": "Place a glass bowl filled with sea salt on a shelf in the toilet. Change weekly.",
                "priority": "Medium",
                "cost": "Very Low",
                "risk": "None",
                "time_to_effect": "Immediate",
                "astro_reason": "Salt absorbs negative vibes (Rahu energy).",
                "vastu_reason": "Cleanses the aura of the space."
            })
        elif direction in ["South-East", "South"]:
            remedies.append({
                "type": "Elemental",
                "title": "Red/Copper Tape",
                "description": "Apply a red tape or place a copper wire around the toilet seat.",
                "priority": "High",
                "cost": "Low",
                "risk": "None",
                "time_to_effect": "14 days",
                "astro_reason": "Copper is Mars/Sun energy, balancing the Fire zone.",
                "vastu_reason": "Prevents the 'Fire' (Cash/Confidence) from being flushed away."
            })
        elif direction in ["South-West"]:
            remedies.append({
                "type": "Elemental",
                "title": "Brass Wire/Yellow Tape",
                "description": "Use brass wire or yellow tape around the toilet.",
                "priority": "Critical",
                "cost": "Medium",
                "risk": "None",
                "time_to_effect": "21-45 days",
                "astro_reason": "Brass/Yellow relates to Earth element (Stability).",
                "vastu_reason": "Stops relationship and stability drain."
            })

    # KITCHEN REMEDIES
    elif defect_type == "Kitchen":
        if direction in ["North-East", "North"]:
            remedies.append({
                "type": "Color",
                "title": "Green Stone Slab",
                "description": "Place a green marble or stone slab under the gas stove burner.",
                "priority": "High",
                "cost": "Medium ($50-100)",
                "risk": "None",
                "time_to_effect": "30 days",
                "astro_reason": "Green (Mercury/Air) acts as a bridge between Water (North) and Fire (Kitchen).",
                "vastu_reason": "Harmonizes the Fire element in a Water zone."
            })
        elif direction in ["South-West"]:
            remedies.append({
                "type": "Color",
                "title": "Yellow Stone Slab",
                "description": "Place a yellow Jaisalmer stone under the stove.",
                "priority": "High",
                "cost": "Medium",
                "risk": "None",
                "time_to_effect": "30 days",
                "astro_reason": "Yellow (Earth) stabilizes the Fire energy.",
                "vastu_reason": "Prevents Fire from burning up Relationships (Earth)."
            })

    # WATER TANK REMEDIES
    elif defect_type == "Water Tank":
        if direction in ["South-East", "South"]:
            remedies.append({
                "type": "Color",
                "title": "Paint Red",
                "description": "Paint the tank red to camouflage its Water element in the Fire zone.",
                "priority": "Medium",
                "cost": "Low",
                "risk": "None",
                "time_to_effect": "14 days",
                "astro_reason": "Red aligns with Mars/Venus (Fire).",
                "vastu_reason": "Reduces the cooling effect of water on your cash flow/confidence."
            })

    # CUT / MISSING CORNER
    elif defect_type == "Cut":
        remedies.append({
            "type": "Structural (Visual)",
            "title": "Mirror Expansion",
            "description": "Place a large mirror on the wall facing the missing corner to visually 'extend' it.",
            "priority": "Medium",
            "cost": "Medium",
            "risk": "Low (Ensure mirror placement is correct)",
            "time_to_effect": "Immediate",
            "astro_reason": "Expands the space element.",
            "vastu_reason": "Restores the energetic geometry of the house."
        })

    return remedies

def analyze_home_energy(zones: list, direction_strengths: list, property_type: str = "Residential", custom_weights: dict = None) -> dict:
    """
    Analyzes home energy based on marked zones (defects) and personal direction strength.
    Input zones: [{"direction": "North", "type": "Toilet"}, ...]
    """
    scores = {
        "Money": 5.0,
        "Health": 5.0,
        "Relationships": 5.0,
        "Peace": 5.0
    }
    
    # Business Score Keys
    if property_type != "Residential":
        scores = {
            "Profit": 5.0,
            "Growth": 5.0,
            "Stability": 5.0,
            "Reputation": 5.0
        }
    
    # Apply custom weights/overrides if provided
    if custom_weights:
        for key, value in custom_weights.items():
            if key in scores:
                scores[key] = float(value)

    blocks = []
    zone_details = []
    
    # Map directions to life aspects for scoring
    aspect_map = {
        "Money": ["Money", "Cash Flow", "Gains", "Opportunities", "Profits"],
        "Health": ["Health", "Immunity", "Energy", "Healing"],
        "Relationships": ["Relationships", "Social Connections", "Support", "Attraction", "Women"],
        "Peace": ["Peace", "Clarity", "Relaxation", "Sleep", "Mind", "Stability"],
        # Business Mapping
        "Profit": ["Cash Flow", "Gains", "Profits", "Liquidity"],
        "Growth": ["Opportunities", "Marketing", "Expansion"],
        "Stability": ["Stability", "Support", "Staff"],
        "Reputation": ["Fame", "Brand", "Goodwill"]
    }

    business_rule_set = BUSINESS_RULES.get(property_type, {})

    for zone in zones:
        direction = zone.get("direction")
        z_type = zone.get("type") 
        
        if not direction or not z_type: continue
        
        # Get Direction Attributes
        attrs = DIRECTION_ATTRIBUTES.get(direction)
        if not attrs: continue
        
        # Check for Defect
        impact = 0
        is_defect = False
        reason = ""
        
        # --- BUSINESS LOGIC ---
        if property_type != "Residential":
            rule = business_rule_set.get(z_type)
            if rule:
                if direction in rule.get("avoid", []):
                    is_defect = True
                    impact = -2.5
                    reason = f"{z_type} in {direction} is detrimental for {property_type}."
                elif direction in rule.get("best", []):
                    impact = 1.0 # Bonus
                    reason = f"{z_type} in {direction} is excellent."
            
            # Fallback to general avoid list if no specific business rule
            elif z_type in attrs.get("avoid", []):
                 is_defect = True
                 impact = -2.0
                 reason = f"{z_type} in {direction} is a generic defect."

        # --- RESIDENTIAL LOGIC ---
        else:
            # 1. Direct Avoidance Check (from dictionary)
            if z_type in attrs.get("avoid", []):
                is_defect = True
                impact = -2.0
                reason = f"{z_type} in {direction} is a major defect."
                
                # Critical Defect Logic
                if direction in ["North-East", "South-West"]:
                    impact = -3.0 # Critical zones
                    reason = f"CRITICAL: {z_type} in {direction} destroys {', '.join(attrs['aspects'])}."
            
            # 2. Element Clashes (General Rules)
            # Water vs Fire, Fire vs Water, etc.
            element = attrs.get("element", "")
            
            if z_type == "Kitchen" and "Water" in element:
                is_defect = True
                impact = min(impact, -2.5)
                reason = f"Fire (Kitchen) in Water zone ({direction}) causes health/money loss."
                
            if z_type == "Toilet" and ("North" in direction or "East" in direction):
                 # Toilets are bad in N/NE/E/SE/S/SW generally, but specifically allowed in SSW, WNW, ESE
                 # Our 'avoid' list handles most, but let's reinforce logic
                 if direction not in ["South-South-West", "West-North-West", "East-South-East"]:
                     is_defect = True
                     impact = min(impact, -2.0)
                     reason = f"Toilet in {direction} flushes away {attrs['aspects'][0]}."
    
            if z_type == "Water Tank":
                if "Fire" in element:
                    is_defect = True
                    impact = min(impact, -2.0)
                    reason = f"Water in Fire zone ({direction}) douses confidence/cash."
        
        remedies = []
        if is_defect:
            blocks.append(reason)
            remedies = get_advanced_remedies(z_type, direction)
            
            # Apply Impact to relevant scores
            for category, keywords in aspect_map.items():
                if category not in scores: continue # Skip irrelevant categories (e.g. Health for Business)
                for aspect in attrs["aspects"]:
                    if aspect in keywords:
                        scores[category] += impact

        zone_details.append({
            "direction": direction,
            "type": z_type,
            "status": "Defect" if is_defect else "Neutral/Good",
            "impact": impact,
            "reason": reason,
            "remedies": remedies
        })

    # Normalize Scores (0-5)
    for k in scores:
        scores[k] = max(1.0, min(5.0, scores[k]))
        
    # Overall Luck
    overall_score = sum(scores.values()) / 4
    
    return {
        "scores": scores,
        "overall_score": round(overall_score, 1),
        "blocks": blocks[:5], # Top 5 blocks
        "zone_details": zone_details
    }

def get_daily_vastu_action(moon_sign: str) -> dict:
    """
    Returns a daily habit based on Moon Sign (Transit).
    """
    # Simple elemental logic
    element = "Water" # default
    if moon_sign in ["Aries", "Leo", "Sagittarius"]: element = "Fire"
    elif moon_sign in ["Taurus", "Virgo", "Capricorn"]: element = "Earth"
    elif moon_sign in ["Gemini", "Libra", "Aquarius"]: element = "Air"
    elif moon_sign in ["Cancer", "Scorpio", "Pisces"]: element = "Water"
    
    actions = {
        "Fire": [
            "Light a candle in the South-East today.",
            "Check electrical appliances in the South.",
            "Let sunlight in from the East this morning."
        ],
        "Earth": [
            "Declutter the South-West corner.",
            "Clean your heavy furniture.",
            "Walk barefoot on natural ground or floor."
        ],
        "Air": [
            "Open windows in the North-West for fresh air.",
            "Organize your documents/books in the West.",
            "Use a pleasant aroma/incense today."
        ],
        "Water": [
            "Ensure no water leakage in the North.",
            "Water your plants in the North-East.",
            "Place fresh water in a bowl in the North-East."
        ]
    }
    
    return {
        "action": random.choice(actions[element]),
        "reason": f"Moon is in {moon_sign} ({element} Sign), activating this energy."
    }

def get_upcoming_luck_windows(moon_sign: str) -> list:
    """
    Returns upcoming lucky time windows for home improvements based on Moon sign.
    """
    # Mocking logic for MVP: Dates relative to today
    today = datetime.now()
    windows = []
    
    # Simple logic: 
    # 1. Next Waxing Moon (Growth)
    # 2. Sun entering friendly sign
    
    # Just generating some realistic looking dates
    import datetime as dt
    
    # Window 1: 5-8 days from now (approaching Full Moon mock)
    start1 = today + dt.timedelta(days=5)
    end1 = today + dt.timedelta(days=8)
    windows.append({
        "title": "Growth Window",
        "dates": f"{start1.strftime('%b %d')} - {end1.strftime('%b %d')}",
        "activity": "Start renovations, buy furniture, or plant a garden."
    })
    
    # Window 2: 20-22 days from now
    start2 = today + dt.timedelta(days=20)
    end2 = today + dt.timedelta(days=22)
    windows.append({
        "title": "Cleansing Window",
        "dates": f"{start2.strftime('%b %d')} - {end2.strftime('%b %d')}",
        "activity": "Deep cleaning, decluttering, or fixing leaks."
    })
    
    return windows

def get_astro_vastu_guidance(ascendant_sign: str, current_mahadasha_lord: str) -> dict:
    """
    Provides directional focus guidance based on Lagna and Mahadasha.
    
    Logic:
    1. Mahadasha Lord determines the 'Time Direction' - the active zone for current karma.
    2. Lagna determines the 'Personal Orientation'.
    3. 4th House (Home) direction from Lagna is key for stability.
    """
    
    # 1. Mahadasha Direction
    md_direction = PLANET_DIRECTIONS.get(current_mahadasha_lord, "Unknown")
    
    # 2. 4th House Direction
    # Find 4th sign from Ascendant
    # Order: Aries, Taurus...
    zodiac_order = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    try:
        asc_idx = zodiac_order.index(ascendant_sign)
        fourth_house_idx = (asc_idx + 3) % 12 # +3 because index 0 is 1st house
        fourth_house_sign = zodiac_order[fourth_house_idx]
        home_direction = SIGN_DIRECTIONS.get(fourth_house_sign, "Unknown")
    except ValueError:
        fourth_house_sign = "Unknown"
        home_direction = "Unknown"

    guidance_text = (
        f"Since you are running the Mahadasha of {current_mahadasha_lord}, "
        f"the {md_direction} direction is currently highly active for you. "
        f"Focus on keeping this area clean and balanced."
    )
    
    reasoning = (
        f"{current_mahadasha_lord} rules the {md_direction}. "
        f"With {ascendant_sign} Ascendant, your 4th house (Home/Peace) falls in {fourth_house_sign}, "
        f"suggesting the {home_direction} is naturally vital for your domestic stability."
    )
    
    return {
        "current_mahadasha": current_mahadasha_lord,
        "recommended_focus_direction": md_direction,
        "home_stability_direction": home_direction,
        "guidance": guidance_text,
        "reasoning": reasoning
    }

def get_vastu_remedies(defect_type: str, zone: str) -> dict:
    """
    Returns traditional remedies for specific Vastu defects.
    """
    remedies = {
        "Toilet": {
            "NE": ["Remove if possible", "Place a bronze bowl with sea salt", "Use blue tape on the floor"],
            "SW": ["Keep door closed", "Use yellow tape/paint", "Place a brass bowl with sea salt"],
            "SE": ["Use red tape", "Place a copper wire"],
            "NW": ["Use white tape", "Place aluminum strip"]
        },
        "Kitchen": {
            "NE": ["Place a yellow stone slab under the stove", "Keep water in NE corner"],
            "SW": ["Paint walls yellow", "Use yellow stone slab under stove"],
            "N": ["Green slab under stove", "Place a money plant"]
        },
        "Entrance": {
            "SW": ["Lead metal helix", "Panchmukhi Hanuman image", "Brass wire under threshold"],
            "SE": ["Copper helix", "Red Swastik", "Copper wire under threshold"],
            "W": ["Iron/Space element remedies", "White horses picture"]
        }
    }

    # Normalize inputs
    defect = defect_type # e.g. "Toilet"
    direction = zone # e.g. "NE"

    specific_remedies = remedies.get(defect, {}).get(direction, [])
    
    if not specific_remedies:
        return {
            "defect": f"{defect} in {direction}",
            "remedies": ["Consult a Vastu expert for specific structural corrections.", "Ensure the area is clean and clutter-free."],
            "mantra": "Om Vastu Purushaya Namah",
            "yantra": "Vastu Dosh Nivaran Yantra"
        }

    return {
        "defect": f"{defect} in {direction}",
        "remedies": specific_remedies,
        "mantra": "Om Namo Bhagavate Vastu Purushaya",
        "yantra": f"Yantra for {direction} Direction"
    }
