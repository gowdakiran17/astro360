
import sys
import os
import json
sys.path.append("/Users/kirangowda/Documents/astro360/astro_app/backend")

from vastu.elite_engine import EliteAstroVastuEngine

# Mock Data
astro_data = {
    "dasha_lord": "Mars",
    "antardasha_lord": "Saturn",
    "planets": [
        {"name": "Mars", "house": 1, "houses_owned": [1, 8], "longitude": 10},
        {"name": "Saturn", "house": 4, "longitude": 280},
        {"name": "Sun", "longitude": 120},
        {"name": "Moon", "longitude": 45}
    ],
    "houses": [
        {"house_num": 1, "sign": "Aries"},
        {"house_num": 2, "sign": "Taurus"},
        {"house_num": 3, "sign": "Gemini"},
        {"house_num": 4, "sign": "Cancer"},
        {"house_num": 5, "sign": "Leo"},
        {"house_num": 6, "sign": "Virgo"},
        {"house_num": 7, "sign": "Libra"},
        {"house_num": 8, "sign": "Scorpio"},
        {"house_num": 9, "sign": "Sagittarius"},
        {"house_num": 10, "sign": "Capricorn"},
        {"house_num": 11, "sign": "Aquarius"},
        {"house_num": 12, "sign": "Pisces"}
    ],
    "ascendant": {"longitude": 0, "sign": "Aries"},
    "transits": [
        {"name": "Saturn", "zodiac_sign": "Pisces"},
        {"name": "Jupiter", "zodiac_sign": "Taurus"}
    ],
    "panchang": {
        "tithi": "Krishna Chaturthi",
        "yoga": "Vyatipata"
    }
}

vastu_data = {
    "objects": [
        {"zone": "North", "type": "Toilet"},
        {"zone": "East", "type": "Store"}
    ]
}

engine = EliteAstroVastuEngine(astro_data, vastu_data, user_intent="Career")
result = engine.run_analysis()

print("--- DIAGNOSIS ---")
print(result["diagnosis"])

print("\n--- POWER SCORE ---")
print(json.dumps(result["home_power_score"], indent=2))

print("\n--- ALIGNMENT ---")
print(json.dumps(result["personal_alignment"], indent=2))

print("\n--- TIME WINDOWS ---")
print(json.dumps(result["time_windows"], indent=2))

print("\n--- WARNINGS ---")
print(json.dumps(result["warnings"], indent=2))
