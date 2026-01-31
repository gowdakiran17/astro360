"""
Nakshatra Nadi Engine (Pt. Dinesh Guruji)
Implements the core logic of Nakshatra Nadi (Simplified KP) including:
- 3-Layer Decision Engine (Planet, Star Lord, Sub Lord)
- Rahu/Ketu Extended Signification
- Hit Theory (Success Rate Mapping)
- Gender Determination Logic
- Left vs Right Side Analysis
"""

from typing import Dict, List, Set, Optional

# House combinations for life events (Based on Pt. Dinesh Guruji's NN 1.pdf)
NADI_COMBINATIONS = {
    "education": {
        "good": [2, 4, 5, 9, 10, 11],     # 2-4-5-9-10-11
        "bad": [3, 5, 6, 8, 12]           # Updated: Added 5 (Lazy)
    },
    "career": {
        "good": [2, 6, 7, 10, 11],       # Updated: Added 7
        "bad": [5, 8, 9, 12]              # Updated: Added 9
    },
    "government_job": {
        "good": [2, 6, 10, 11],          # Sun/Moon/Leo/Cancer influence needed
        "bad": [5, 8, 12]
    },
    "business": {
        "good": [2, 6, 7, 10, 11],       # Same as career but 7 is key
        "bad": [5, 8, 9, 12]
    },
    "marriage": {
        "good": [2, 7, 9, 11],           # Updated: Added 9
        "bad": [1, 5, 6, 10]              # Updated: Added 5 (Love/Affair issues)
    },
    "child_birth": {
        "good": [2, 5, 9, 11],            # Updated: Added 9 (God's grace)
        "bad": [1, 4, 10]                # 4, 10, 1 (negation of 2, 5, 11)
    },
    "finance": {
        "good": [2, 6, 7, 9, 10, 11],    # Income (11th house rules)
        "bad": [5, 8, 12]
    },
    "property": {
        "good": [4, 6, 8, 11, 12],        # Updated: Added 6 (Loan), 8 (Legacy)
        "bad": [3, 5, 10]                 # Updated: 3 (Loss), 5 (Cash), 10 (No gain)
    },
    "health": {
        "good": [5, 9, 11],               # Updated: Removed 1 (Self) - PDF Pg 54 says 5-9-11
        "bad": [4, 6, 8, 10, 12]          # Updated: Added 4, 10
    },
    "travel": {
        "good": [3, 9, 12],              # Foreign travel
        "bad": [2, 4, 11]                # Return/Home
    }
}

# Success Rate Mapping (Hit Theory)
# Rows: Sub Lord (SL), Columns: Nakshatra Lord (NL)
# Value mapping: E=95, H=80, M=60, L=40, B=20, VB=5
SUCCESS_RATE_TABLE = {
    "E": 95,
    "H": 80,
    "M": 60,
    "L": 40,
    "B": 20,
    "VB": 5
}

# NL-SL Success interaction matrix (Simplified representation)
# In Nakshatra Nadi, SL is the qualifier of NL's result.
def get_success_rating(nl_val: str, sl_val: str) -> str:
    """nl_val: GOOD/BAD/NEUTRAL, sl_val: GOOD/BAD/NEUTRAL"""
    if nl_val == "GOOD":
        if sl_val == "GOOD": return "E"
        if sl_val == "BAD": return "L"
        return "H"
    if nl_val == "BAD":
        if sl_val == "GOOD": return "M"
        if sl_val == "BAD": return "VB"
        return "B"
    # Neutral NL
    if sl_val == "GOOD": return "H"
    if sl_val == "BAD": return "L"
    return "M"

# Sign to Planet Lord mapping
SIGN_LORDS = {
    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury',
    'Cancer': 'Moon', 'Leo': 'Sun', 'Virgo': 'Mercury',
    'Libra': 'Venus', 'Scorpio': 'Mars', 'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
}

SIGNS_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

class NakshatraNadiEngine:
    @staticmethod
    def calculate_house_lordships(ascendant_sign: str) -> Dict[int, str]:
        """
        Calculate which planet lords over each house based on ascendant.
        
        Example: If Ascendant is Aries:
        - House 1: Mars (Aries)
        - House 2: Venus (Taurus)
        - House 3: Mercury (Gemini)
        ...
        
        Returns: {1: 'Mars', 2: 'Venus', 3: 'Mercury', ...}
        """
        if ascendant_sign not in SIGNS_ORDER:
            return {}
        
        asc_index = SIGNS_ORDER.index(ascendant_sign)
        house_lordships = {}
        
        for house in range(1, 13):
            sign_index = (asc_index + house - 1) % 12
            sign = SIGNS_ORDER[sign_index]
            house_lordships[house] = SIGN_LORDS[sign]
        
        return house_lordships
    
    @staticmethod
    def calculate_planet_significators(planet_name: str, planet_house: int, 
                                       house_lordships: Dict[int, str]) -> Dict:
        """
        Calculate houses a planet signifies:
        - pos: House it occupies (int)
        - lords: Houses it rules (List[int])
        """
        lords = []
        for house_num, lord in house_lordships.items():
            if lord == planet_name:
                lords.append(house_num)
        
        return {
            "pos": planet_house,
            "lords": sorted(lords)
        }

    @staticmethod
    def get_extended_planets(planets: List[Dict], house_lordships: Dict[int, str]) -> List[Dict]:
        """
        Enhance planet details with Nakshatra Nadi specific rules.
        Handles Rahu/Ketu as agents of their Sign Lord.
        """
        # First, calculate basic significators for all planets
        planet_map = {p["planet"]: p for p in planets}
        
        enhanced = []
        for p in planets:
            p_name = p["planet"]
            p_house = p.get("house")
            
            # Base significators
            sig = NakshatraNadiEngine.calculate_planet_significators(p_name, p_house, house_lordships)
            
            # Rahu/Ketu Agent logic
            if p_name in ["Rahu", "Ketu"]:
                sign_lord = p.get("sign_lord")
                if sign_lord and sign_lord in planet_map:
                    sl_data = planet_map[sign_lord]
                    sl_sig = NakshatraNadiEngine.calculate_planet_significators(
                        sign_lord, sl_data.get("house"), house_lordships
                    )
                    # Merge: keep own position, add sign lord's position and lordships to 'lords'
                    # Actually Nadi ref app shows RA/KE inherits everything into the list
                    extended_lords = set(sig["lords"])
                    if sl_sig["pos"]: extended_lords.add(sl_sig["pos"])
                    for l in sl_sig["lords"]: extended_lords.add(l)
                    sig["lords"] = sorted(list(extended_lords))

            enhanced.append({
                **p,
                "nadi_significators": sig
            })
        return enhanced

    @staticmethod
    def analyze_event(
        event_type: str, 
        planet_name: str, 
        planets: List[Dict], 
        significators: Dict
    ) -> Dict:
        """
        Analyze a specific event potential for a planet using Nadi rules.
        """
        if event_type not in NADI_COMBINATIONS:
            return {"potential": "Unknown", "score": 0}
            
        comb = NADI_COMBINATIONS[event_type]
        good_houses = set(comb.get("good", []))
        bad_houses = set(comb.get("bad", []))
        
        # Find planet details
        p = next((pl for pl in planets if pl["planet"] == planet_name), None)
        if not p: return {"potential": "Unknown", "score": 0}
        
        # 3-Layer houses
        star_lord = p.get("star_lord", "")
        sub_lord = p.get("sub_lord", "")
        
        # Helper to get houses for a lord
        def get_houses(lord_name):
            return set([h for h, sigs in significators.items() if lord_name in sigs.get("all", [])])
            
        p_houses = get_houses(planet_name)
        nl_houses = get_houses(star_lord)
        sl_houses = get_houses(sub_lord)
        
        # --- RETROGRADE LOGIC (Signature Course: Retrograde gives 2, 11 strongly) ---
        is_retro = p.get("is_retro", False)
        if is_retro:
            # Add 2 and 11 to Planet Level houses implies wealth/gain potential despite delay
            p_houses.update({2, 11})

        # --- GOVERNMENT JOB SPECIAL RULE (Signature Course) ---
        # Requires connection to Sun or Moon OR 6th CSL connection to Leo/Cancer
        # Here we check if the planet/NL/SL is Sun/Moon or positioned in Leo/Cancer
        gov_job_bonus = False
        if event_type == "government_job":
            strong_planets = ["Sun", "Moon"]
            strong_signs = ["Leo", "Cancer"]
            
            # Check Connections
            is_connected = (
                planet_name in strong_planets or 
                star_lord in strong_planets or 
                sub_lord in strong_planets or
                p.get("sign", "") in strong_signs
            )
            
            if is_connected:
                gov_job_bonus = True
            else:
                # If no connection to Royal planets/signs, Gov Job is weak/denied
                # We downgrade the rating unless it's already bad
                pass # Logic applied in scoring below

        # Determine Good/Bad status for each level
        def get_status(houses):
            if not houses: return "NEUTRAL"
            g_count = len(houses & good_houses)
            b_count = len(houses & bad_houses)
            if g_count > b_count: return "GOOD"
            if b_count > g_count: return "BAD"
            return "NEUTRAL"
            
        nl_status = get_status(nl_houses)
        sl_status = get_status(sl_houses)
        
        rating = get_success_rating(nl_status, sl_status)
        
        # Apply Govt Job Penalty if no Royal connection
        if event_type == "government_job" and not gov_job_bonus:
             # Downgrade rating if it was good
             if rating in ["E", "H"]: rating = "M"
             elif rating == "M": rating = "L"

        score = SUCCESS_RATE_TABLE.get(rating, 50)
        
        # Additional Retrograde Bonus for Finance/Career
        if is_retro and event_type in ["finance", "career", "business"]:
             if score < 95: score += 5  # Slight boost for Retrograde wealth potential

        # Final evaluation
        final_potential = "Mixed"
        if rating in ["E", "H"]: final_potential = "YES"
        elif rating in ["VB", "B"]: final_potential = "NO"
        
        # Helper to categorize houses
        def categorize_houses(houses):
            g = sorted(list(houses & good_houses))
            b = sorted(list(houses & bad_houses))
            n = sorted(list(houses - good_houses - bad_houses))
            return {"all": sorted(list(houses)), "good": g, "bad": b, "neutral": n}

        return {
            "planet": planet_name,
            "event": event_type,
            "potential": final_potential,
            "score": score,
            "rating": rating,
            "is_retro": is_retro,
            "gov_bonus": gov_job_bonus if event_type == "government_job" else None,
            "houses": {
                "planet": categorize_houses(p_houses),
                "star_lord": { "name": star_lord, **categorize_houses(nl_houses), "status": nl_status },
                "sub_lord": { "name": sub_lord, **categorize_houses(sl_houses), "status": sl_status }
            }
        }

    @staticmethod
    def determine_gender(sub_lord: str, planet_rashi: str) -> str:
        """
        Nadi Gender Determination logic.
        """
        MALE_PLANETS = ["Sun", "Jupiter", "Mars"]
        FEMALE_PLANETS = ["Venus", "Moon", "Rahu"]
        DUAL_PLANETS = ["Mercury", "Saturn", "Ketu"]
        
        MALE_RASHIS = ["Aries", "Gemini", "Leo", "Libra", "Sagittarius", "Aquarius"]
        
        is_male_p = sub_lord in MALE_PLANETS
        is_female_p = sub_lord in FEMALE_PLANETS
        is_male_r = planet_rashi in MALE_RASHIS
        
        if is_male_p and is_male_r: return "Male"
        if is_female_p and not is_male_r: return "Female"
        return "Dual/Either"



    @staticmethod
    def calculate_event_percentage(pl_status: str, nl_status: str, sl_status: str) -> float:
        """
        Calculate weighted percentage for event success.
        PL = 20%, NL = 30%, SL = 50% (Nakshatra Nadi standard weightage)
        """
        weights = {'PL': 0.20, 'NL': 0.30, 'SL': 0.50}
        scores = {'GOOD': 100, 'NEUTRAL': 50, 'BAD': 0}
        
        total = (
            scores.get(pl_status, 50) * weights['PL'] +
            scores.get(nl_status, 50) * weights['NL'] +
            scores.get(sl_status, 50) * weights['SL']
        )
        return round(total, 0)

    @staticmethod
    def get_career_suggestions(event_type: str, good_houses: List[int]) -> List[str]:
        """
        Map house combinations to specific career/education areas.
        Based on Nakshatra Nadi career mapping logic.
        """
        suggestions = []
        house_set = set(good_houses)
        
        if event_type == "education":
            if {2, 4, 5, 10, 11}.issubset(house_set):
                suggestions.extend(["Banking", "Finance", "Speech therapy", "Family business", "Gems", "Jewelry", "Food", "Dental", "Singers"])
            if {2, 4, 5, 7, 10, 11}.issubset(house_set):
                suggestions.extend(["Creativity", "Fashion", "Product Development", "Sports", "Dancing", "Media", "Shares", "Medicine"])
            if 9 in house_set:
                suggestions.extend(["Higher Education", "Research", "Philosophy", "Law"])
            if house_set.intersection({6, 8, 12}):
                suggestions.extend(["Gynecology", "Entertainment", "Event management", "Film", "Advertising", "Software"])
                
        elif event_type == "career":
            if {2, 6, 10, 11}.issubset(house_set):
                suggestions.extend(["Government Service", "Corporate Jobs", "Administration"])
            if {7, 10, 11}.issubset(house_set):
                suggestions.extend(["Business", "Entrepreneurship", "Partnership Ventures"])
            if 6 in house_set:
                suggestions.extend(["Healthcare", "Service Industry", "Competitive Fields"])
                
        # Remove duplicates and return
        return list(set(suggestions))[:10]  # Limit to top 10

    @staticmethod
    def get_personality_traits(significators: Dict, planet_name: str) -> str:
        """
        Determine personality characteristics based on planet significators.
        """
        traits = []
        
        # Get houses signified by the planet
        houses = [h for h, sigs in significators.items() if planet_name in sigs.get("all", [])]
        
        if 1 in houses:
            traits.append("Self-confident")
        if 3 in houses:
            traits.append("Courageous")
        if 5 in houses:
            traits.append("Creative")
        if 6 in houses:
            traits.append("Competitive")
        if 8 in houses:
            traits.append("Mysterious")
        if 9 in houses:
            traits.append("Philosophical")
        if 10 in houses:
            traits.append("Ambitious")
        if 11 in houses:
            traits.append("Social")
        if 12 in houses:
            traits.append("Spiritual")
            
        # Planet-specific traits
        if planet_name == "Mars":
            traits.append("Aggressive/Short Temper")
        elif planet_name == "Venus":
            traits.append("Artistic")
        elif planet_name == "Mercury":
            traits.append("Intelligent")
        elif planet_name == "Jupiter":
            traits.append("Wise")
            
        return ", ".join(traits[:5]) if traits else "Balanced"

        return {
            "left": sorted(left_houses),
            "right": sorted(right_houses),
            "neutral": sorted(neutral_houses),
            "left_count": len(left_houses),
            "right_count": len(right_houses),
            "balance": "Positive" if len(left_houses) > len(right_houses) else "Negative" if len(right_houses) > len(left_houses) else "Neutral"
        }

    @staticmethod
    def split_left_right_houses(houses: List[int], event_type: str = "general") -> Dict:
        """
        Split houses into Left (growth/success) and Right (obstacles/loss).
        Based on Pt. Dinesh Guruji's specific Nadi tables.
        """
        # Define Left and Right based on event type using the updated NADI_COMBINATIONS logic
        if event_type == "finance":
            # Income rules
            left = [2, 6, 7, 9, 10, 11]
            right = [5, 8, 12]
        elif event_type in ["career", "business"]:
            left = [2, 6, 7, 10, 11]
            right = [5, 8, 9, 12]
        elif event_type == "marriage":
            left = [2, 7, 9, 11]
            right = [1, 6, 10]
        elif event_type == "education":
            left = [2, 4, 5, 9, 10, 11]
            right = [3, 6, 8, 12]
        else:
            # General / Default (fallback to standard growth vs dusthana)
            left = [1, 2, 3, 4, 5, 9, 10, 11]
            right = [6, 8, 12]
            
        left_houses = [h for h in houses if h in left]
        right_houses = [h for h in houses if h in right]
        neutral_houses = [h for h in houses if h not in left and h not in right]
        
        return {
            "left": sorted(left_houses),
            "right": sorted(right_houses),
            "neutral": sorted(neutral_houses),
            "left_count": len(left_houses),
            "right_count": len(right_houses),
            "balance": "Positive" if len(left_houses) > len(right_houses) else "Negative" if len(right_houses) > len(left_houses) else "Neutral"
        }
