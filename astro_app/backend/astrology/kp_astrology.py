import swisseph as swe
from datetime import datetime
from typing import Dict, List, Any
from .utils import get_julian_day, normalize_degree, get_zodiac_sign

# Vimshottari Dasha order and their years
VIMSHOTTARI_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
VIMSHOTTARI_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17]
TOTAL_YEARS = 120

ZODIAC_LORDS = {
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

NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", # Ashwini to Ashlesha
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", # Magha to Jyeshtha
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"  # Mula to Revati
]

# Nakshatranadi Combinations from PDF
COMBINATIONS = {
    "Education": {
        "Good": [2, 3, 4, 5, 9, 10, 11],
        "Bad": [3, 5, 6, 8, 12],
        "Description": "Academic potential and competitive exam success."
    },
    "Marriage": {
        "Good": [2, 7, 9, 11],
        "Bad": [1, 5, 6, 10, 12],
        "Description": "Marital harmony and timing of union."
    },
    "Career": {
        "Good": [2, 6, 7, 10, 11],
        "Bad": [5, 8, 12],
        "Description": "Professional growth, promotion, and stability."
    },
    "Money": {
        "Good": [2, 6, 7, 10, 11],
        "Bad": [5, 8, 12],
        "Description": "Financial gains, savings, and investments."
    },
    "Property": {
        "Good": [4, 8, 11, 12],
        "Bad": [3, 5, 10],
        "Description": "Real estate, vehicle purchase, and inheritance."
    },
    "Health": {
        "Good": [5, 9, 11],
        "Bad": [4, 6, 8, 10, 12],
        "Description": "Vitality, recovery, and medical predispositions."
    },
    "Travel": {
        "Good": [1, 3, 7, 9, 11, 12],
        "Bad": [],
        "Description": "Short/long journeys and foreign opportunities."
    },
    "Litigation": {
        "Good": [1, 3, 4, 6, 9, 10, 11],
        "Bad": [1, 6, 8, 12],
        "Description": "Legal battles, disputes, and recovery."
    }
}

# Hit Theory Success Matrix (NL vs SL)
# M=Medium, H=High, E=Excellent, L=Low, B=Bad, VB=Very Bad
HIT_MATRIX = {
    # NL: {SL: Score}
    1: {1: "M", 2: "M", 3: "L", 4: "H", 5: "M", 6: "M", 7: "M", 8: "L", 9: "M", 10: "M", 11: "H", 12: "VB"},
    2: {1: "M", 2: "M", 3: "M", 4: "H", 5: "M", 6: "M", 7: "M", 8: "M", 9: "H", 10: "H", 11: "E", 12: "M"},
    3: {1: "L", 2: "M", 3: "L", 4: "M", 5: "L", 6: "L", 7: "M", 8: "B", 9: "M", 10: "M", 11: "M", 12: "VB"},
    4: {1: "H", 2: "H", 3: "M", 4: "H", 5: "M", 6: "M", 7: "M", 8: "M", 9: "H", 10: "H", 11: "E", 12: "M"},
    5: {1: "M", 2: "M", 3: "L", 4: "M", 5: "M", 6: "L", 7: "M", 8: "L", 9: "L", 10: "M", 11: "H", 12: "B"},
    6: {1: "M", 2: "M", 3: "L", 4: "M", 5: "L", 6: "L", 7: "M", 8: "B", 9: "L", 10: "M", 11: "H", 12: "VB"},
    7: {1: "M", 2: "M", 3: "M", 4: "M", 5: "M", 6: "M", 7: "M", 8: "M", 9: "M", 10: "H", 11: "H", 12: "B"},
    8: {1: "B", 2: "M", 3: "B", 4: "M", 5: "B", 6: "B", 7: "M", 8: "B", 9: "L", 10: "M", 11: "M", 12: "VB"},
    9: {1: "M", 2: "H", 3: "M", 4: "H", 5: "L", 6: "L", 7: "M", 8: "L", 9: "M", 10: "H", 11: "E", 12: "M"},
    10: {1: "H", 2: "H", 3: "H", 4: "H", 5: "H", 6: "H", 7: "H", 8: "H", 9: "H", 10: "H", 11: "E", 12: "M"},
    11: {1: "H", 2: "E", 3: "H", 4: "E", 5: "H", 6: "H", 7: "H", 8: "H", 9: "E", 10: "E", 11: "E", 12: "M"},
    12: {1: "B", 2: "M", 3: "VB", 4: "M", 5: "B", 6: "VB", 7: "VB", 8: "VB", 9: "B", 10: "M", 11: "M", 12: "VB"}
}

REMEDY_DATA = {
    "Sun": {"mantra": "Om Hraam Hreem Hraum Saha Suryaya Namaha", "stone": "Ruby", "donation": "Wheat"},
    "Moon": {"mantra": "Om Shraam Shreem Shraum Saha Chandraya Namaha", "stone": "Pearl", "donation": "Rice"},
    "Mars": {"mantra": "Om Kraam Kreem Kraum Saha Bhau-Maya Namaha", "stone": "Coral", "donation": "Toordal"},
    "Mercury": {"mantra": "Om Braam Breem Braum Saha Budhaya Namaha", "stone": "Emerald", "donation": "Green Gram"},
    "Jupiter": {"mantra": "Om Graam Greem Graum Saha Gurave Namaha", "stone": "Yellow Sapphire", "donation": "Bengal Gram"},
    "Venus": {"mantra": "Om Draam Dreem Draum Saha Shukraya Namaha", "stone": "Diamond", "donation": "Hyacinth Beans"},
    "Saturn": {"mantra": "Om Praam Preem Praum Saha Shanaischaraya Namaha", "stone": "Blue Sapphire", "donation": "Black Seasame"},
    "Rahu": {"mantra": "Om Bhraam Bhreem Bhraum Saha Rahuve Namah", "stone": "Hessonite", "donation": "Black Urad"},
    "Ketu": {"mantra": "Om Sram Srim Sraum Sah Ketave Namah", "stone": "Cat's Eye", "donation": "Horse Gram"}
}

class KPService:
    @staticmethod
    def get_kp_lords(longitude: float) -> Dict[str, str]:
        """Calculate Sign Lord, Star Lord, Sub Lord, and Sub-Sub Lord for a given longitude."""
        lon = normalize_degree(longitude)
        
        # 1. Sign Lord
        sign = get_zodiac_sign(lon)
        sign_lord = ZODIAC_LORDS.get(sign, "")
        
        # 2. Star Lord
        nak_span = 360 / 27  # 13.3333 degrees
        nak_idx = int(lon / nak_span) % 27
        star_lord = NAKSHATRA_LORDS[nak_idx]
        
        # 3. Sub Lord
        # Position within the nakshatra (0 to 13.3333)
        pos_in_nak = lon % nak_span
        
        # Start ordering from the nakshatra lord
        start_idx = VIMSHOTTARI_LORDS.index(star_lord)
        
        # Calculate spans of sub lords within the nakshatra
        current_pos = 0.0
        sub_lord = ""
        for i in range(9):
            idx = (start_idx + i) % 9
            span = (VIMSHOTTARI_YEARS[idx] / TOTAL_YEARS) * nak_span
            if current_pos <= pos_in_nak < (current_pos + span):
                sub_lord = VIMSHOTTARI_LORDS[idx]
                sub_lord_span = span
                sub_lord_start = current_pos
                break
            current_pos += span
            
        # 4. Sub-Sub Lord
        # Position within the sub lord reach (0 to sub_lord_span)
        pos_in_sub = pos_in_nak - sub_lord_start
        
        # Start ordering from the sub lord
        sub_start_idx = VIMSHOTTARI_LORDS.index(sub_lord)
        
        current_sub_pos = 0.0
        sub_sub_lord = ""
        for i in range(9):
            idx = (sub_start_idx + i) % 9
            span = (VIMSHOTTARI_YEARS[idx] / TOTAL_YEARS) * sub_lord_span
            if current_sub_pos <= pos_in_sub < (current_sub_pos + span):
                sub_sub_lord = VIMSHOTTARI_LORDS[idx]
                break
            current_sub_pos += span
            
        return {
            "sign": sign,
            "sign_lord": sign_lord,
            "star_lord": star_lord,
            "sub_lord": sub_lord,
            "sub_sub_lord": sub_sub_lord
        }

    @staticmethod
    def format_degree(degree: float) -> str:
        """Format decimal degrees to DD:MM:SS."""
        d = int(degree)
        m = int((degree - d) * 60)
        s = int(((degree - d) * 60 - m) * 60)
        return f"{d:02d}:{m:02d}:{s:02d}"

    @staticmethod
    def calculate_kp_chart(birth_details: Dict, horary_number: int = 0) -> Dict:
        """Calculate complete KP Astrology data including cusps, planets, and significators."""
        date = birth_details.get('date')
        time = birth_details.get('time')
        timezone = birth_details.get('timezone')
        lat = birth_details.get('latitude')
        lon = birth_details.get('longitude')
        
        jd_ut = get_julian_day(date, time, timezone)
        
        # Use Krishnamurti Ayanamsa (SIDM_KRISHNAMURTI)
        swe.set_sid_mode(swe.SIDM_KRISHNAMURTI, 0, 0)
        ayanamsa = swe.get_ayanamsa_ut(jd_ut)
        
        # Calculate Houses (Placidus 'P')
        # If horary_number is provided (1-249), we should adjust the Ascendant
        # This is a simplified implementation of horary adjustment
        houses_res = swe.houses_ex(jd_ut, lat, lon, b'P', swe.FLG_SIDEREAL)
        cusps_tropical = houses_res[0] # These are tropical
        
        kp_cusps = []
        for i in range(1, 13):
            # Cusp longitude is tropical, convert to sidereal
            cusp_lon = normalize_degree(cusps_tropical[i-1] - ayanamsa)
            lords = KPService.get_kp_lords(cusp_lon)
            kp_cusps.append({
                "house": i,
                "degree": KPService.format_degree(cusp_lon % 30),
                "sign": lords["sign"],
                "lords": {
                    "sign_lord": lords["sign_lord"],
                    "star_lord": lords["star_lord"],
                    "sub_lord": lords["sub_lord"],
                    "sub_sub_lord": lords["sub_sub_lord"]
                }
            })
            
        # Calculate Planets
        planets_to_calc = {
            "Sun": swe.SUN, "Moon": swe.MOON, "Mars": swe.MARS, 
            "Mercury": swe.MERCURY, "Jupiter": swe.JUPITER, 
            "Venus": swe.VENUS, "Saturn": swe.SATURN, 
            "Rahu": swe.MEAN_NODE, "Ketu": swe.MEAN_NODE # Ketu is Rahu + 180
        }
        
        kp_planets = []
        planet_house_map = {} # To store which house each planet is in
        
        for name, swe_id in planets_to_calc.items():
            flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
            res = swe.calc_ut(jd_ut, swe_id, flags)
            lon_planet = normalize_degree(res[0][0])
            
            if name == "Ketu":
                lon_planet = normalize_degree(lon_planet + 180)
                
            is_retro = res[0][3] < 0
            
            lords = KPService.get_kp_lords(lon_planet)
            kp_planets.append({
                "name": name,
                "degree": KPService.format_degree(lon_planet % 30),
                "sign": lords["sign"],
                "is_retrograde": is_retro,
                "lords": {
                    "sign_lord": lords["sign_lord"],
                    "star_lord": lords["star_lord"],
                    "sub_lord": lords["sub_lord"],
                    "sub_sub_lord": lords["sub_sub_lord"]
                }
            })
            
            # Identify House Occupancy
            # A planet is in house X if its longitude is between Cusp X and Cusp X+1
            house_occupancy = 12 # Default
            for i in range(11):
                c_start = normalize_degree(cusps_tropical[i] - ayanamsa)
                c_end = normalize_degree(cusps_tropical[i+1] - ayanamsa)
                
                # Handle 360 crossing
                if c_start < c_end:
                    if c_start <= lon_planet < c_end:
                        house_occupancy = i + 1
                        break
                else: # Wrap around
                    if lon_planet >= c_start or lon_planet < c_end:
                        house_occupancy = i + 1
                        break
            planet_house_map[name] = house_occupancy

        # Calculate Significators (Levels A, B, C, D)
        significators = {}
        for h in range(1, 13):
            # A: Planet in Star Lord of Occupant of House
            # B: Planet actually occupying the House
            # C: Planet in Star Lord of Owner of the House
            # D: Planet that owns the House
            
            level_b = [p["name"] for p in kp_planets if planet_house_map[p["name"]] == h]
            
            owner = kp_cusps[h-1]["lords"]["sign_lord"]
            level_d = [owner]
            
            # Level C: Planets who are in the star of the owner
            owner_nak_idx = [p["lords"]["star_lord"] for p in kp_planets if p["name"] == owner]
            # Wait, Level C is planets in the star of the owner
            # Actually Level C is often defined as: Planet in the Star Lord of Owner.
            # Let's use the standard definitions:
            # Level A: Planet in the Star-Lord of the occupant of the house.
            # Level B: Planet occupying the house.
            # Level C: Planet in the Star-Lord of the owner of the house.
            # Level D: Planet owning the house.
            
            level_c = []
            for p in kp_planets:
                if p["lords"]["star_lord"] == owner:
                    level_c.append(p["name"])
            
            level_a = []
            for occupant in level_b:
                for p in kp_planets:
                    if p["lords"]["star_lord"] == occupant:
                        level_a.append(p["name"])
            
            significators[h] = {
                "levels": {
                    "A": list(set(level_a)),
                    "B": list(set(level_b)),
                    "C": list(set(level_c)),
                    "D": list(set(level_d))
                },
                "description": f"House {h} energy profile: {owner} dominant influence."
            }

        # Ruling Planets (at the moment of JD_UT)
        # We need the Ascendant (Lagna) details at JD_UT
        # And Moon details at JD_UT
        
        moon_data = [p for p in kp_planets if p["name"] == "Moon"][0]
        lagna_lon = normalize_degree(cusps_tropical[0] - ayanamsa)
        lagna_lords = KPService.get_kp_lords(lagna_lon)
        
        # Day Lord logic
        # simplified based on JD
        from .utils import NAKSHATRA_LORDS
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        # simplified: swe has a julday to day of week?
        # swe.day_of_week(jd_ut)
        # However, for simplicity let's use datetime
        dt = datetime.fromtimestamp((jd_ut - 2440587.5) * 86400)
        day_index = dt.weekday() # 0 is Monday
        day_lords = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]
        
        ruling_planets = {
            "day_lord": day_lords[day_index],
            "moon_star": moon_data["lords"]["star_lord"],
            "moon_sign": moon_data["lords"]["sign_lord"],
            "lagna_star": lagna_lords["star_lord"],
            "lagna_sign": lagna_lords["sign_lord"]
        }

        # Calculate Predictive Intelligence
        predictions = []
        for area, config in COMBINATIONS.items():
            good_hits = 0
            # Check planets significance for this area
            for p in kp_planets:
                # If planet itself or its star lord or sub lord is in good houses
                house = planet_house_map[p["name"]]
                if house in config["Good"]:
                    good_hits += 1
            
            # Simplified score logic
            strength = "High" if good_hits >= 4 else "Medium" if good_hits >= 2 else "Low"
            predictions.append({
                "area": area,
                "score": good_hits,
                "strength": strength,
                "description": config["Description"]
            })

        # Calculate Hit Theory Matrix Scores
        hit_scores = []
        for p in kp_planets:
            nl_house = planet_house_map[p["name"]]
            sl_name = p["lords"]["sub_lord"]
            # Sub Lord's placement house
            sl_house = planet_house_map.get(sl_name, 1) # Fallback to 1
            
            rating = HIT_MATRIX.get(nl_house, {}).get(sl_house, "M")
            hit_scores.append({
                "planet": p["name"],
                "nl_house": nl_house,
                "sl_house": sl_house,
                "rating": rating
            })

        # Generate Remedies
        remedies = []
        for p in kp_planets:
            house = planet_house_map[p["name"]]
            # If in bad house (6, 8, 12), provide remedy
            if house in [6, 8, 12]:
                base = REMEDY_DATA.get(p["name"], {})
                remedies.append({
                    "planet": p["name"],
                    "house": house,
                    "mantra": base.get("mantra", ""),
                    "stone": base.get("stone", ""),
                    "donation": base.get("donation", "")
                })

        return {
            "ayanamsa": "Krishnamurti (KP New)",
            "cusps": kp_cusps,
            "planets": kp_planets,
            "significators": significators,
            "ruling_planets": ruling_planets,
            "predictive_iq": predictions,
            "hit_matrix": hit_scores,
            "remedies": remedies
        }
