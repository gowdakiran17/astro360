from typing import Dict, List, Optional, Any
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.schemas import BirthDetails
from astro_app.backend.astrology.basics import PLANET_GEMS, PLANET_COLORS

# Direction Mappings
PLANET_DIRECTIONS = {
    "Sun": "East",
    "Moon": "North-West",
    "Mars": "South",
    "Mercury": "North",
    "Jupiter": "North-East",
    "Venus": "South-East",
    "Saturn": "West",
    "Rahu": "South-West",
    "Ketu": "North-East"
}

# Rashi (Sign) Direction Mapping (Element based)
# Fire -> East, Earth -> South, Air -> West, Water -> North
RASHI_DIRECTIONS = {
    "Aries": "East", "Leo": "East", "Sagittarius": "East",
    "Taurus": "South", "Virgo": "South", "Capricorn": "South",
    "Gemini": "West", "Libra": "West", "Aquarius": "West",
    "Cancer": "North", "Scorpio": "North", "Pisces": "North"
}

# 16 Vastu Zones Mapping
VASTU_16_ZONES = [
    "North", "North-North-East", "North-East", "East-North-East",
    "East", "East-South-East", "South-East", "South-South-East",
    "South", "South-South-West", "South-West", "West-South-West",
    "West", "West-North-West", "North-West", "North-North-West"
]

def get_16_vastu_zone(longitude: float) -> str:
    """
    Converts a Zodiac Longitude (0-360) to one of the 16 Vastu Zones.
    Assumption: Aries 0° corresponds to East (90° on Compass).
    Zodiac increases CCW, Compass increases CW.
    Compass Angle = (90 - Zodiac) % 360
    
    Zones are 22.5° each, centered on the main directions.
    North (0°) is from 348.75° to 11.25°.
    """
    compass_angle = (90 - longitude) % 360
    
    # Shift by half a zone (11.25) to align index 0 with North center
    # Angle 0 (North) -> Index 0
    # Zone 0 (N) starts at 348.75 (-11.25) to 11.25.
    # Formula: index = int((angle + 11.25) / 22.5) % 16
    
    index = int((compass_angle + 11.25) / 22.5) % 16
    return VASTU_16_ZONES[index]

# Rudraksha Mapping (Based on Rashi Lord)
RASHI_RUDRAKSHA = {
    "Mars": "3 Mukhi",
    "Venus": "6 Mukhi",
    "Mercury": "4 Mukhi",
    "Moon": "2 Mukhi",
    "Sun": "1 Mukhi",
    "Jupiter": "5 Mukhi",
    "Saturn": "7 Mukhi"
}

# Donation Items (Standard)
PLANET_DONATIONS = {
    "Sun": "Wheat, Jaggery, Copper",
    "Moon": "Rice, Milk, Silver",
    "Mars": "Red Lentils (Masoor Dal), Copper",
    "Mercury": "Green Gram (Moong Dal), Green Cloth",
    "Jupiter": "Chickpeas (Chana Dal), Turmeric, Gold",
    "Venus": "Curd, Ghee, White Cloth",
    "Saturn": "Black Sesame, Iron, Mustard Oil",
    "Rahu": "Black Urad Dal, Coconut",
    "Ketu": "Black/White Blanket, Seven Grains"
}

# Standard Friendships (simplified)
FRIENDSHIPS = {
    "Sun": ["Moon", "Mars", "Jupiter"],
    "Moon": ["Sun", "Mercury"],
    "Mars": ["Sun", "Moon", "Jupiter"],
    "Mercury": ["Sun", "Venus"],
    "Jupiter": ["Sun", "Moon", "Mars"],
    "Venus": ["Mercury", "Saturn", "Rahu"],
    "Saturn": ["Mercury", "Venus", "Rahu"],
    "Rahu": ["Mercury", "Venus", "Saturn"],
    "Ketu": ["Mars", "Jupiter"]
}

ENEMIES = {
    "Sun": ["Venus", "Saturn", "Rahu"],
    "Moon": ["Rahu", "Ketu"], # Moon has no enemies but Rahu/Ketu eclipse it
    "Mars": ["Mercury", "Rahu"],
    "Mercury": ["Moon"],
    "Jupiter": ["Mercury", "Venus"],
    "Venus": ["Sun", "Moon"],
    "Saturn": ["Sun", "Moon", "Mars"],
    "Rahu": ["Sun", "Moon", "Mars"],
    "Ketu": ["Sun", "Moon"]
}

def get_planet_direction(planet_name: str) -> str:
    return PLANET_DIRECTIONS.get(planet_name, "Center")

def analyze_personal_vastu(birth_details: BirthDetails) -> Dict:
    """
    Generates a Personal Astro-Vastu Report without requiring a floor plan.
    Focuses on: Sitting, Sleeping, Money, Good/Bad Directions.
    """
    # 1. Calculate Chart
    chart = calculate_chart(
        birth_details.date,
        birth_details.time,
        birth_details.timezone,
        birth_details.latitude,
        birth_details.longitude
    )

    planets = {p["name"]: p for p in chart["planets"]}
    ascendant = chart["ascendant"]
    
    # Identify House Lords (Whole Sign Houses)
    # House 1 is Ascendant Sign.
    # We need a mapping of Sign -> Lord
    SIGN_LORDS = {
        "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
        "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
        "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    }
    
    ZODIAC_ORDER = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]
    
    asc_sign = ascendant["zodiac_sign"]
    asc_index = ZODIAC_ORDER.index(asc_sign)
    
    def get_lord_of_house(house_num: int) -> str:
        # house_num is 1-based
        sign_index = (asc_index + (house_num - 1)) % 12
        sign = ZODIAC_ORDER[sign_index]
        return SIGN_LORDS[sign]
    
    def get_sign_of_house(house_num: int) -> str:
        sign_index = (asc_index + (house_num - 1)) % 12
        return ZODIAC_ORDER[sign_index]

    # --- 1. SITTING DIRECTION (Career/Success) ---
    # Primary: 10th Lord Direction (16 Zones)
    # Secondary: Ascendant Lord Direction
    lord_10 = get_lord_of_house(10)
    lord_1 = get_lord_of_house(1)
    
    # Get longitude of 10th Lord
    lord_10_pos = planets.get(lord_10, {})
    lord_10_lon = lord_10_pos.get("longitude", 0)
    sitting_direction = get_16_vastu_zone(lord_10_lon)
    
    sitting_desc = f"Face {sitting_direction} for best Career results (Ruled by {lord_10})."
    
    # --- 2. MONEY & WEALTH ---
    # Money: 2nd Lord (Savings) & 11th Lord (Gains)
    lord_11 = get_lord_of_house(11)
    lord_2 = get_lord_of_house(2)
    sign_2 = get_sign_of_house(2)
    
    # 2nd Lord Direction (Dynamic 16 Zone)
    lord_2_pos = planets.get(lord_2, {})
    lord_2_lon = lord_2_pos.get("longitude", 0)
    money_direction = get_16_vastu_zone(lord_2_lon)
    
    # 2nd Sign Direction (Center of Sign -> 16 Zone)
    # Sign index * 30 + 15 degrees
    sign_2_idx = ZODIAC_ORDER.index(sign_2)
    sign_2_center_lon = sign_2_idx * 30 + 15
    sign_2_direction = get_16_vastu_zone(sign_2_center_lon)
    
    # Wish Fulfillment (11th House)
    lord_11_pos = planets.get(lord_11, {})
    lord_11_lon = lord_11_pos.get("longitude", 0)
    wish_direction = get_16_vastu_zone(lord_11_lon)
    
    sign_11 = get_sign_of_house(11)
    sign_11_idx = ZODIAC_ORDER.index(sign_11)
    sign_11_center_lon = sign_11_idx * 30 + 15
    sign_11_direction = get_16_vastu_zone(sign_11_center_lon)
    
    # Abundance Point (Part of Fortune)
    # Formula: 
    # Day Birth (Sun above horizon): Asc + Moon - Sun
    # Night Birth (Sun below horizon): Asc + Sun - Moon
    
    sun_lon = planets.get("Sun", {}).get("longitude", 0)
    moon_lon = planets.get("Moon", {}).get("longitude", 0)
    asc_lon = ascendant.get("longitude", 0)
    
    # Check Day/Night Birth precisely
    # Day Birth if Sun is between Ascendant (rising) and Descendant (setting)
    # In Diurnal motion (CW), Sun is above horizon if (Asc - Sun) is 0 to 180.
    # In Zodiac Longitude (CCW): (Asc - Sun) % 360 < 180 means Sun is in Houses 12, 11, 10, 9, 8, 7.
    is_day_birth = (asc_lon - sun_lon) % 360 < 180
    
    if is_day_birth:
        pof_lon = (asc_lon + moon_lon - sun_lon) % 360
    else:
        pof_lon = (asc_lon + sun_lon - moon_lon) % 360
        
    pof_sign_index = int(pof_lon / 30)
    pof_sign = ZODIAC_ORDER[pof_sign_index]
    
    # Determine Directions
    # 1. Sign Direction (Center of Sign)
    pof_sign_center_lon = pof_sign_index * 30 + 15
    pof_sign_direction = get_16_vastu_zone(pof_sign_center_lon)
    
    # 2. Exact Point Direction (16 Zone based on exact degree)
    pof_exact_direction = get_16_vastu_zone(pof_lon)
    
    # 3. Lord Direction
    pof_lord = SIGN_LORDS.get(pof_sign, "Venus")
    pof_lord_pos = planets.get(pof_lord, {})
    pof_lord_lon = pof_lord_pos.get("longitude", 0)
    pof_lord_direction = get_16_vastu_zone(pof_lord_lon)
    
    # Use Exact Direction for the Abundance Point itself
    abundance_direction = pof_exact_direction
    
    user_name = birth_details.name if birth_details.name else "User"
    abundance_desc = (
        f"The abundance point in your birth chart, calculated based on factors like your rising star (Rashi), Sun, and Moon placement, "
        f"is a crucial determinant of prosperity, success, and fulfillment in your life journey.\n"
        f"{user_name}, in your case, the Abundance Point is situated in the {abundance_direction} direction of your house. "
        f"It's noteworthy that Vastu imbalances or clutter in the {abundance_direction} can directly impact your ability to attract abundance. "
        f"The energy flow in this direction significantly influences creating a harmonious environment for prosperity manifestation. "
        f"Ensuring the {abundance_direction} direction is free from obstructions is crucial for maximizing positive influences on abundance attraction.\n"
        f"Key Information: When your Abundance Point connects with the direction of Money and Wish Fulfillment, "
        f"highlighting its crucial role in shaping financial prosperity and fulfilling desires. "
        f"It's important to enhance the energy flow in this direction for attracting abundance and creating a satisfying life."
    )
    
    # Lakshmi Yantra (Venus)
    venus_pos = planets.get("Venus", {})
    lakshmi_sign = venus_pos.get("zodiac_sign", "")
    lakshmi_lord = SIGN_LORDS.get(lakshmi_sign, "Venus")
    
    # Use Venus actual position (Dynamic)
    venus_lon = venus_pos.get("longitude", 0)
    lakshmi_direction = get_16_vastu_zone(venus_lon)
    
    # --- 3. REMEDIES & RECOMMENDATIONS ---
    # Gemstones: Lords of 1, 5, 9 (Dharma Houses)
    lord_5 = get_lord_of_house(5)
    lord_9 = get_lord_of_house(9)
    
    gemstones = [
        {"planet": lord_1, "stone": PLANET_GEMS.get(lord_1), "type": "Life Stone (Lagnesh)"},
        {"planet": lord_5, "stone": PLANET_GEMS.get(lord_5), "type": "Lucky Stone (5th Lord)"},
        {"planet": lord_9, "stone": PLANET_GEMS.get(lord_9), "type": "Fortune Stone (9th Lord)"}
    ]
    
    # Rudraksha: Based on Moon Sign Lord
    moon_sign = planets.get("Moon", {}).get("zodiac_sign", "")
    moon_sign_lord = SIGN_LORDS.get(moon_sign, "Moon")
    rudraksha = RASHI_RUDRAKSHA.get(moon_sign_lord, "2 Mukhi")
    
    # Favorable Color: Ascendant Lord
    favorable_color = PLANET_COLORS.get(lord_1, "White")
    
    # Donations: General list for all planets (User can choose based on Dasha)
    donations = []
    for p_name, item in PLANET_DONATIONS.items():
        donations.append({"planet": p_name, "item": item})

    # --- 4. SLEEPING DIRECTION ---
    # Avoid head towards Enemy of Ascendant Lord
    bad_planets = ENEMIES.get(lord_1, [])
    bad_directions = [get_planet_direction(p) for p in bad_planets]
    
    sleeping_advice = "South or East"
    if "South" in bad_directions:
        sleeping_advice = "East"
    elif "East" in bad_directions:
        sleeping_advice = "South"
        
    # --- 5. COMPREHENSIVE DATA RETURN ---
    
    # Planet in Rashi / House List
    planet_details = []
    for p in chart["planets"]:
        # Calculate House placement
        p_sign = p["zodiac_sign"]
        p_sign_idx = ZODIAC_ORDER.index(p_sign)
        # House = (Sign Index - Asc Index + 12) % 12 + 1
        house_num = (p_sign_idx - asc_index + 12) % 12 + 1
        
        planet_details.append({
            "name": p["name"],
            "sign": p_sign,
            "nakshatra": p.get("nakshatra", ""),
            "degree": p["longitude"],
            "house": house_num,
            "is_retro": p.get("is_retrograde", False)
        })

    return {
        "meta": {
            "ascendant": asc_sign,
            "ascendant_lord": lord_1,
            "moon_sign": moon_sign,
            "moon_nakshatra": planets.get("Moon", {}).get("nakshatra", "")
        },
        "vastu_compass": {
            "sitting": {
                "direction": sitting_direction,
                "lord": lord_10,
                "desc": sitting_desc
            },
            "money": {
                "direction": money_direction,
                "lord": lord_2,
                "sign": sign_2,
                "sign_direction": sign_2_direction,
                "desc": f"As per your birth chart the 2nd House – The House of Money and Family is occupied by {sign_2} Rashi and the lord of the 2nd House is {lord_2}. The direction associated with {sign_2} Rashi is {sign_2_direction} and the direction of {lord_2} is {money_direction}. If the Vastu of these directions is imbalanced, then one will face issues with regards to the flow of Money."
            },
            "wish_fulfillment": {
                "direction": wish_direction,
                "lord": lord_11,
                "sign": sign_11,
                "sign_direction": sign_11_direction,
                "desc": f"As per your birth chart the 11th – The House of Profit, Gains and Wish Fulfillment is occupied by {sign_11} Rashi and the lord of the 11th House is {lord_11}. The direction associated with {sign_11} Rashi is {sign_11_direction} and the direction of {lord_11} is {wish_direction}. If the Vastu of these directions is imbalanced, then one will face issues with regards to Wish Fulfillment."
            },
            "abundance": {
                "direction": abundance_direction,
                "lord": pof_lord,
                "sign": pof_sign,
                "sign_direction": pof_sign_direction,
                "desc": abundance_desc
            },
            "lakshmi_yantra": {
                "direction": lakshmi_direction,
                "lord": lakshmi_lord,
                "desc": "Your Venus (Luxury) Point"
            },
            "sleeping": {
                "direction": sleeping_advice,
                "desc": "Best Head Direction for Sleep"
            }
        },
        "remedies": {
            "gemstones": gemstones,
            "rudraksha": {
                "recommendation": rudraksha,
                "lord": moon_sign_lord,
                "sign": moon_sign
            },
            "favorable_color": favorable_color,
            "donations": donations
        },
        "chart_data": {
            "planets": planet_details,
            "houses": [
                {"house": i, "sign": get_sign_of_house(i), "lord": get_lord_of_house(i)} 
                for i in range(1, 13)
            ]
        },
        # For Backward Compatibility with previous UI
        "sitting_direction": sitting_direction,
        "sitting_desc": sitting_desc,
        "money_direction": money_direction,
        "sleeping_direction": sleeping_advice,
        "favorable": [
            {"direction": get_planet_direction(p), "planet": p, "reason": "Friend of Ascendant Lord"}
            for p in FRIENDSHIPS.get(lord_1, [])
        ],
        "unfavorable": [
            {"direction": get_planet_direction(p), "planet": p, "reason": "Enemy of Ascendant Lord"}
            for p in ENEMIES.get(lord_1, [])
        ]
    }
