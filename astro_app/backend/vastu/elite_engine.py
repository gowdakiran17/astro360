from typing import Dict, List, Any, Optional
import math

# --- Constants & Mappings ---

# 1. Sign to Direction (Element based)
# Aries, Leo, Sag = Fire = East? No.
# Standard Vedic Direction for Signs:
# Aries, Leo, Sag (Fire) -> East
# Taurus, Virgo, Cap (Earth) -> South
# Gemini, Libra, Aq (Air) -> West
# Cancer, Scorpio, Pisces (Water) -> North
# Wait, standard is:
# Aries (East), Taurus (South), Gemini (West), Cancer (North) ... repeating.
SIGN_DIRECTIONS = {
    "Aries": "East", "Leo": "East", "Sagittarius": "East",
    "Taurus": "South", "Virgo": "South", "Capricorn": "South",
    "Gemini": "West", "Libra": "West", "Aquarius": "West",
    "Cancer": "North", "Scorpio": "North", "Pisces": "North"
}

# 2. Planet to Direction (for reference, though User example used Sign)
PLANET_DIRECTIONS = {
    "Sun": "East", "Moon": "North-West", "Mars": "South", "Mercury": "North",
    "Jupiter": "North-East", "Venus": "South-East", "Saturn": "West",
    "Rahu": "South-West", "Ketu": "Center" # or Up
}

# 3. House to Life Area
HOUSE_THEMES = {
    1: ["Self", "Health", "General"],
    2: ["Money", "Family", "Speech"],
    3: ["Effort", "Siblings", "Communication"],
    4: ["Peace", "Mother", "Property", "Home"],
    5: ["Creativity", "Children", "Intelligence"],
    6: ["Debt", "Disease", "Enemies", "Loss (Small)"],
    7: ["Relationships", "Marriage", "Business Partner"],
    8: ["Blockage", "Transformation", "Occult", "Sudden Events"],
    9: ["Luck", "Father", "Travel", "Dharma"],
    10: ["Career", "Status", "Fame"],
    11: ["Gains", "Network", "Fulfillment"],
    12: ["Loss", "Expense", "Foreign", "Sleep"]
}

# 4. Zone Rules (Defects & Attributes)
# Simplified 16-zone logic for the "Engine"
ZONE_RULES = {
    "North": {
        "element": "Water", "color": "Blue", "avoid": ["Toilet", "Kitchen", "Red", "Yellow", "Store"], 
        "good": ["Mirror", "Water"], "attribute": "Opportunities"
    },
    "North-North-East": {
        "element": "Water", "color": "Blue", "avoid": ["Toilet", "Kitchen", "Red"], 
        "good": ["Medicine"], "attribute": "Health"
    },
    "North-East": {
        "element": "Water", "color": "Blue", "avoid": ["Toilet", "Kitchen", "Stairs", "Heavy"], 
        "good": ["Temple", "Water"], "attribute": "Clarity"
    },
    "East-North-East": {
        "element": "Air", "color": "Green", "avoid": ["Toilet", "Red"], 
        "good": ["Play"], "attribute": "Fun"
    },
    "East": {
        "element": "Air", "color": "Green", "avoid": ["Toilet", "Store", "White"], 
        "good": ["Plants"], "attribute": "Social"
    },
    "East-South-East": {
        "element": "Air", "color": "Green", "avoid": ["Bedroom"], 
        "good": ["Churning"], "attribute": "Analysis"
    },
    "South-East": {
        "element": "Fire", "color": "Red", "avoid": ["Water", "Mirror", "Blue", "Black"], 
        "good": ["Kitchen"], "attribute": "Cash"
    },
    "South-South-East": {
        "element": "Fire", "color": "Red", "avoid": ["Water", "Blue"], 
        "good": ["Exercise"], "attribute": "Power"
    },
    "South": {
        "element": "Fire", "color": "Red", "avoid": ["Water", "Mirror", "Entrance"], 
        "good": ["Sleep"], "attribute": "Fame"
    },
    "South-South-West": {
        "element": "Earth", "color": "Yellow", "avoid": ["Kitchen", "Safe"], 
        "good": ["Toilet"], "attribute": "Disposal"
    },
    "South-West": {
        "element": "Earth", "color": "Yellow", "avoid": ["Toilet", "Kitchen", "Cut", "Green"], 
        "good": ["Master Bed", "Safe"], "attribute": "Relationships"
    },
    "West-South-West": {
        "element": "Space", "color": "White", "avoid": ["Toilet"], 
        "good": ["Study"], "attribute": "Knowledge"
    },
    "West": {
        "element": "Space", "color": "White", "avoid": ["Toilet", "Kitchen", "Green"], 
        "good": ["Dining", "Safe"], "attribute": "Gains"
    },
    "West-North-West": {
        "element": "Space", "color": "White", "avoid": ["Bedroom", "Safe"], 
        "good": ["Toilet", "Detox"], "attribute": "Depression"
    },
    "North-West": {
        "element": "Air", "color": "White", "avoid": ["Kitchen", "Red"], 
        "good": ["Guest", "Store"], "attribute": "Support"
    },
    "North-North-West": {
        "element": "Water", "color": "Blue", "avoid": ["Kitchen"], 
        "good": ["Bedroom"], "attribute": "Attraction"
    }
}

# 5. 32-Entrance Rules (Zones N1-N8, E1-E8, S1-S8, W1-W8)
# Each entrance is approx 11.25 degrees.
# Starting from North (0 deg) -> N5 (0-11.25), N6...
# Standard Mapping (Clockwise from True North 0):
# N5, N6, N7, N8, E1, E2, E3, E4, E5, E6, E7, E8, S1, S2, S3, S4, S5, S6, S7, S8, W1, W2, W3, W4, W5, W6, W7, W8, N1, N2, N3, N4
ENTRANCE_RULES = {
    # North (Money, Career)
    "N1": {"effect": "Bad", "msg": "Loss of money, enemies"},
    "N2": {"effect": "Bad", "msg": "Fear, jealousy"},
    "N3": {"effect": "Good", "msg": "Wealth gain, success"},
    "N4": {"effect": "Good", "msg": "Inheritance, money accumulation"},
    "N5": {"effect": "Good", "msg": "Religious mind, truthfulness"},
    "N6": {"effect": "Bad", "msg": "Behavioral problems"},
    "N7": {"effect": "Bad", "msg": "Girls' safety issues"},
    "N8": {"effect": "Good", "msg": "Bank balance, savings (if balanced)"}, # Sometimes bad

    # East (Social, Fun)
    "E1": {"effect": "Bad", "msg": "Fire accidents, losses"},
    "E2": {"effect": "Bad", "msg": "Expense on women, wasteful"},
    "E3": {"effect": "Good", "msg": "Fame, government gains"},
    "E4": {"effect": "Good", "msg": "Power, administration"},
    "E5": {"effect": "Bad", "msg": "Short temper, aggressive"},
    "E6": {"effect": "Bad", "msg": "Lies, commitment failure"},
    "E7": {"effect": "Bad", "msg": "Mental dullness"},
    "E8": {"effect": "Bad", "msg": "Accidents, theft"},

    # South (Fame, Relax)
    "S1": {"effect": "Bad", "msg": "Negative impact on son"},
    "S2": {"effect": "Good", "msg": "Growth in industry (for factories)"},
    "S3": {"effect": "Good", "msg": "Money, success (Vitatha)"},
    "S4": {"effect": "Good", "msg": "Fame, prosperity (Grihakshat)"},
    "S5": {"effect": "Bad", "msg": "Debts, short life"},
    "S6": {"effect": "Bad", "msg": "Poverty, humiliation"},
    "S7": {"effect": "Bad", "msg": "Wastage, slavery"},
    "S8": {"effect": "Bad", "msg": "Isolation, disease"},

    # West (Gains, Skills)
    "W1": {"effect": "Bad", "msg": "Poverty, lack of savings"},
    "W2": {"effect": "Bad", "msg": "Insecurity, relationship issues"},
    "W3": {"effect": "Good", "msg": "Amazing success, education (Sugriva)"},
    "W4": {"effect": "Good", "msg": "Happy life, fulfillment (Pushpdanta)"},
    "W5": {"effect": "Good", "msg": "Financial gains (Varuna)"},
    "W6": {"effect": "Bad", "msg": "Addiction, depression"},
    "W7": {"effect": "Bad", "msg": "Unhappiness, drugs"},
    "W8": {"effect": "Bad", "msg": "Theft, loss of mind"}
}

class EliteAstroVastuEngine:
    def __init__(self, astro_data: Dict, vastu_data: Dict, user_intent: str):
        self.astro = astro_data
        self.vastu = vastu_data
        self.intent = user_intent
        self.diagnosis_log = []
        self.remedies = []
        
    def run_analysis(self) -> Dict:
        """
        Main execution pipeline following Steps 1-10.
        """
        # Step 1: Active Life Area
        active_houses = self._get_active_houses()
        
        # Step 2: Map Houses to Directions
        house_direction_map = self._map_houses_to_directions(active_houses)
        
        # Step 3: Detect Space Damage
        damage_report = self._detect_space_damage(house_direction_map)
        
        # Step 4: Calculate Severity (Done within Step 3)
        
        # Step 5: Abundance Point
        abundance_point = self._calculate_abundance_point()
        
        # Step 6: Diagnosis Generation
        diagnosis = self._generate_diagnosis(damage_report, active_houses)
        
        # Step 7: Remedies
        remedies = self._generate_remedies(damage_report)
        
        # Step 8: Ranking
        top_fixes = self._rank_fixes(remedies)
        
        # Step 9: Power Score & Alignment
        power_score = self._calculate_power_score(damage_report)
        personal_alignment = self._get_personal_alignment()
        
        # Construct Final Output
        return {
            "life_theme_summary": self._get_life_theme_summary(active_houses),
            "active_astrology": self._format_active_astro(),
            "affected_directions": house_direction_map,
            "home_damage_map": damage_report,
            "diagnosis": diagnosis,
            "priority_fixes": top_fixes,
            "remedies": remedies,
            "time_windows": self._calculate_time_windows(),
            "expected_results": self._generate_expected_results(top_fixes),
            "warnings": self._generate_warnings(damage_report),
            "abundance_activation": abundance_point,
            "home_power_score": power_score,
            "personal_alignment": personal_alignment
        }

    def _get_active_houses(self) -> List[Dict]:
        """
        Determine which houses are active based on Dasha/Antardasha.
        Logic: 
        1. Find Dasha Lord.
        2. Find which houses Dasha Lord rules (Lordship).
        3. Find where Dasha Lord is placed (Placement).
        4. Repeat for Antardasha Lord.
        """
        active = []
        
        # Extract Lords from input
        dasha_lord = self.astro.get("dasha_lord", "") # e.g. "Mars"
        antardasha_lord = self.astro.get("antardasha_lord", "")
        
        planets = self.astro.get("planets", [])
        
        # Helper to find planet data
        def get_planet(name):
            return next((p for p in planets if p["name"] == name), None)
            
        # Helper to find houses owned by planet
        # Note: This requires the astro_data to contain house lordships or we calculate them.
        # For this engine, we assume 'planets' has 'houses_owned' or we infer from signs.
        # Assuming input has 'houses' list with 'sign'.
        houses = self.astro.get("houses", [])
        
        def get_owned_houses(planet_name):
            # Map Planet to Signs
            planet_signs = {
                "Sun": ["Leo"], "Moon": ["Cancer"], "Mars": ["Aries", "Scorpio"],
                "Mercury": ["Gemini", "Virgo"], "Jupiter": ["Sagittarius", "Pisces"],
                "Venus": ["Taurus", "Libra"], "Saturn": ["Capricorn", "Aquarius"],
                "Rahu": [], "Ketu": []
            }
            owned_signs = planet_signs.get(planet_name, [])
            owned_houses = []
            for h in houses:
                # Handle inconsistent keys (sign vs zodiac_sign, house_num vs house_number)
                h_sign = h.get("sign") or h.get("zodiac_sign")
                h_num = h.get("house_num") or h.get("house_number")
                
                if h_sign in owned_signs:
                    owned_houses.append(h_num)
            return owned_houses

        # Process Dasha Lord
        if dasha_lord:
            p_data = get_planet(dasha_lord)
            if p_data:
                # Ownership
                owned = get_owned_houses(dasha_lord)
                for h_num in owned:
                    active.append({"house": h_num, "source": "Dasha Lord Owner", "planet": dasha_lord})
                # Placement
                if "house" in p_data:
                    active.append({"house": p_data["house"], "source": "Dasha Lord Placement", "planet": dasha_lord})
        
        # Process Antardasha Lord (Higher Priority usually for immediate events)
        if antardasha_lord:
            p_data = get_planet(antardasha_lord)
            if p_data:
                owned = get_owned_houses(antardasha_lord)
                for h_num in owned:
                    active.append({"house": h_num, "source": "Antar Lord Owner", "planet": antardasha_lord, "priority": "high"})
        
        # Process Transits (New - Real-time Impact)
        transits = self.astro.get("transits", [])
        ascendant = self.astro.get("ascendant", {})
        asc_sign = ascendant.get("sign") or ascendant.get("zodiac_sign")
        
        if transits and asc_sign:
            SIGNS_ORDER = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                           "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
            
            try:
                asc_idx = SIGNS_ORDER.index(asc_sign)
                
                for t in transits:
                    t_name = t["name"]
                    t_sign = t["zodiac_sign"]
                    
                    # We focus on major planets for Vastu impact
                    if t_name in ["Saturn", "Jupiter", "Rahu", "Ketu", "Mars"]: 
                        if t_sign in SIGNS_ORDER:
                            t_idx = SIGNS_ORDER.index(t_sign)
                            # Calculate House relative to Ascendant
                            house_num = (t_idx - asc_idx) + 1
                            if house_num <= 0:
                                house_num += 12
                                
                            impact = "Growth"
                            if t_name == "Saturn": impact = "Stress/Delay"
                            if t_name == "Rahu": impact = "Obsession/Confusion"
                            if t_name == "Ketu": impact = "Detachment/Loss"
                            if t_name == "Mars": impact = "Conflict/Energy"
                            
                            active.append({
                                "house": house_num,
                                "source": f"Transit {t_name} ({impact})", 
                                "planet": t_name,
                                "priority": "high" if t_name in ["Saturn", "Rahu"] else "medium"
                            })
            except ValueError:
                pass # Handle sign name mismatches gracefully

        # Filter by User Intent if provided (e.g., if user wants "Money", look for 2, 11, 6, 10)
        if self.intent:
            intent_map = {
                "Money": [2, 11], "Career": [10, 6], "Relationship": [7], "Health": [1, 6, 8],
                "Peace": [4], "Business": [7, 10, 11]
            }
            target_houses = intent_map.get(self.intent, [])
            # Boost priority of these houses if they are in the active list
            for a in active:
                if a["house"] in target_houses:
                    a["priority"] = "URGENT"
            
            # If target house not active by dasha, we still analyze it but mark as "Latent"
            # But the user asks "What ... is blocking ... right now". 
            # If the house is not active, maybe it's not the root cause?
            # However, usually we look at the house related to the problem regardless.
            for h in target_houses:
                if not any(x["house"] == h for x in active):
                    active.append({"house": h, "source": "User Intent", "planet": "Intent", "priority": "Focus"})

        return active

    def _map_houses_to_directions(self, active_houses: List[Dict]) -> List[Dict]:
        """
        Step 2: Map House -> Sign -> Planet -> Direction
        """
        mapped = []
        houses = self.astro.get("houses", [])
        
        for item in active_houses:
            h_num = item["house"]
            # Find house data by handling key variations
            house_data = next((h for h in houses if (h.get("house_num") or h.get("house_number")) == h_num), None)
            
            if house_data:
                sign = house_data.get("sign") or house_data.get("zodiac_sign")
                # 1. Sign Direction
                direction = SIGN_DIRECTIONS.get(sign, "Unknown")
                
                # 2. Refine to 16 Zones if possible
                # Basic mapping: East -> East. 
                # Advanced: specific degrees of the house cusp fall into a specific zone.
                # For now, map 4/8 directions to 16 zones broadly.
                # East -> East (Primary), ENE, ESE (Secondary)
                
                mapped.append({
                    "house": h_num,
                    "sign": sign,
                    "planet": item["planet"],
                    "direction": direction,
                    "priority": item.get("priority", "normal"),
                    "life_area": HOUSE_THEMES.get(h_num, ["General"])[0]
                })
        return mapped

    def _detect_space_damage(self, mapped_houses: List[Dict]) -> List[Dict]:
        """
        Step 3 & 4: Check Vastu zones for defects and calculate severity.
        Also checks 32-Entrance grid if angles are provided.
        """
        damages = []
        user_objects = self.vastu.get("objects", []) # List of {zone: "North", type: "Toilet"}
        
        # 1. 32-Zone Entrance Analysis
        for obj in user_objects:
            if obj.get("type", "").strip() == "Entrance":
                angle = obj.get("angle")
                if angle is not None:
                    entrance_name = self._get_entrance_from_angle(angle)
                    rule = ENTRANCE_RULES.get(entrance_name, {})
                    if rule.get("effect") == "Bad":
                        damages.append({
                            "direction": obj.get("zone", "Entrance"),
                            "house": "All", 
                            "life_area": "General Fortune",
                            "issues": [f"Bad Entrance {entrance_name} ({rule.get('msg')})"],
                            "severity": "High",
                            "planet": "Vastu Purush"
                        })

        for item in mapped_houses:
            direction = item["direction"]
            # We need to check the specific zone. 
            # If direction is "East", we check "East", "East-North-East", "East-South-East"?
            # Let's check the exact mapped direction first.
            
            # Find objects in this direction
            # Assuming user_objects has entries like {"zone": "East", "items": ["Toilet", "Clutter"]}
            
            # Flatten user objects to easy lookup
            # structure: [{"zone": "North", "type": "Toilet"}, ...]
            items_in_zone = [obj["type"].strip() for obj in user_objects if obj.get("zone", "").strip() == direction]
            
            # Check for Avoid List
            rules = ZONE_RULES.get(direction, {})
            avoid_list = rules.get("avoid", [])
            
            severity = "None"
            issues = []
            
            for obj in items_in_zone:
                if obj in avoid_list:
                    issues.append(obj)
                    # Severity Logic
                    if obj == "Toilet":
                        severity = "High" # Destiny blocker
                    elif obj == "Kitchen" and direction in ["North", "North-East"]:
                        severity = "High"
                    elif obj == "Clutter":
                        severity = "Medium" # Delays
                    elif severity == "None":
                        severity = "Low"
            
            if issues:
                damages.append({
                    "direction": direction,
                    "house": item["house"],
                    "life_area": item["life_area"],
                    "issues": issues,
                    "severity": severity,
                    "planet": item["planet"]
                })
                
        return damages

    def _get_entrance_from_angle(self, angle: float) -> str:
        """
        Map 0-360 degree to 32 Entrance Zones (N1-N8, etc.)
        Standard 32-Division starting from North (0 deg) -> N5 (0-11.25)
        """
        # Normalize angle
        angle = angle % 360
        
        # Sequence starting from 0 deg: N5, N6, N7, N8, E1, E2 ...
        sequence = [
            "N5", "N6", "N7", "N8", 
            "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8",
            "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8",
            "W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8",
            "N1", "N2", "N3", "N4"
        ]
        
        step = 11.25
        index = int(angle / step)
        if 0 <= index < 32:
            return sequence[index]
        return "Unknown"

    def _calculate_abundance_point(self) -> Dict:
        """
        Step 5: Sun + Moon + Lagna
        """
        # Get longitudes
        def get_long(name):
            if name == "Ascendant":
                return self.astro.get("ascendant", {}).get("longitude", 0)
            p = next((x for x in self.astro.get("planets", []) if x["name"] == name), None)
            return p["longitude"] if p else 0
            
        sun_long = get_long("Sun")
        moon_long = get_long("Moon")
        asc_long = get_long("Ascendant")
        
        total = (sun_long + moon_long + asc_long) % 360
        
        # Convert to Direction (0 = Aries 0 = East?)
        # Wait, Zodiac Longitude 0 is Aries 0.
        # Direction mapping of Zodiac:
        # 0-30 (Aries) -> East
        # 30-60 (Taurus) -> South
        # ... this is Sign-based.
        # Or is it Compass degrees?
        # Usually in Astro-Vastu, we map the Zodiac to the 360 degrees around the house.
        # 0 deg Aries = East.
        
        # Map longitude to 16 zones
        # 0 deg (East) is center of East zone? 
        # In MahaVastu, East is 90 degrees compass.
        # But in Zodiac mapping:
        # Aries (0-30) -> East.
        # This is the " Shakti Chakra" mapping often used.
        # Let's stick to the Sign Mapping we defined earlier.
        
        sign_index = int(total / 30)
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        sign = signs[sign_index]
        direction = SIGN_DIRECTIONS.get(sign, "Unknown")
        
        return {
            "longitude": total,
            "sign": sign,
            "direction": direction,
            "description": "Highest Priority Zone for Abundance"
        }

    def _generate_remedies(self, damages: List[Dict]) -> List[Dict]:
        """
        Step 7: Layered Remedies
        Ensures strict deduplication of remedies per Zone + Problem.
        """
        remedies_map = {} # Key: (zone, problem) tuple -> remedy dict
        
        for d in damages:
            direction = d["direction"].strip()
            issues = d["issues"]
            life_area = d["life_area"]
            
            for issue in issues:
                issue_key = issue.strip()
                key = (direction, issue_key)
                
                if key not in remedies_map:
                    # Create new remedy entry
                    remedy = None
                    
                    if issue_key == "Toilet":
                        # Metal Strip Remedy
                        element = ZONE_RULES.get(direction, {}).get("element", "Unknown")
                        strip_color = "unknown"
                        metal = "unknown"
                        
                        if element == "Water":
                            metal = "Aluminum"
                            strip_color = "Silver/Grey"
                        elif element == "Air":
                            metal = "Stainless Steel"
                            strip_color = "Green"
                        elif element == "Fire":
                            metal = "Copper"
                            strip_color = "Red"
                        elif element == "Earth":
                            metal = "Brass"
                            strip_color = "Yellow"
                        elif element == "Space":
                            metal = "Iron"
                            strip_color = "White"
                            
                        remedy = {
                            "zone": direction,
                            "problem": "Toilet",
                            "action": f"Install a {metal} strip around the toilet seat.",
                            "details": f"Place a 4-inch {strip_color} strip or {metal} wire. Cut the floor if needed.",
                            "astro_reason_areas": [life_area],
                            "astro_reason": f"Restores the energy of {life_area} which is drained by disposal activity.",
                            "vastu_reason": f"Stops the {element} element from being flushed away.",
                            "priority": "Urgent" if d["severity"] == "High" else "High",
                            "cost": "Low",
                            "time": "3-7 days"
                        }
                    
                    elif issue_key == "Kitchen" and direction in ["North", "North-East"]:
                        remedy = {
                            "zone": direction,
                            "problem": "Kitchen (Fire in Water)",
                            "action": "Place a Green Slab under the stove.",
                            "details": "Use Baroda Green marble, 15mm thick, exactly under the burner.",
                            "astro_reason_areas": [life_area],
                            "astro_reason": f"Balances the conflict affecting {life_area}.",
                            "vastu_reason": "Green (Air) acts as a bridge between Water (Zone) and Fire (Stove).",
                            "priority": "High",
                            "cost": "Medium",
                            "time": "14-21 days"
                        }
                    elif issue_key == "Clutter":
                        remedy = {
                            "zone": direction,
                            "problem": "Clutter",
                            "action": "Remove heavy items and junk.",
                            "details": "Clear out old newspapers, broken electronics, or heavy boxes.",
                            "astro_reason_areas": [life_area],
                            "astro_reason": f"Unblocks the flow of energy related to {life_area}.",
                            "vastu_reason": "Restores the flow of Prana in this zone.",
                            "priority": "Medium",
                            "cost": "Free",
                            "time": "Immediate"
                        }
                    
                    if remedy:
                        remedies_map[key] = remedy
                        
                else:
                    # Merge life areas into existing remedy
                    existing = remedies_map[key]
                    if life_area not in existing["astro_reason_areas"]:
                        existing["astro_reason_areas"].append(life_area)
                        # Update description
                        areas_str = ", ".join(existing["astro_reason_areas"])
                        if issue_key == "Toilet":
                            existing["astro_reason"] = f"Restores the energy of {areas_str} which is drained by disposal activity."
                        elif issue_key == "Kitchen":
                            existing["astro_reason"] = f"Balances the conflict affecting {areas_str}."
                        elif issue_key == "Clutter":
                            existing["astro_reason"] = f"Unblocks the flow of energy related to {areas_str}."

        return list(remedies_map.values())

    def _rank_fixes(self, remedies: List[Dict]) -> List[Dict]:
        """
        Step 8: Rank Top 3
        """
        # Sort by priority (Urgent > High > Medium)
        priority_map = {"Urgent": 3, "High": 2, "Medium": 1, "Low": 0}
        return sorted(remedies, key=lambda x: priority_map.get(x["priority"], 0), reverse=True)[:3]

    def _get_life_theme_summary(self, active_houses: List[Dict]) -> str:
        themes = set([HOUSE_THEMES.get(x["house"], ["General"])[0] for x in active_houses])
        return f"Currently Activated Themes: {', '.join(themes)}"

    def _format_active_astro(self) -> Dict:
        return {
            "dasha": self.astro.get("dasha_lord"),
            "antardasha": self.astro.get("antardasha_lord"),
            "note": "Planetary periods determining current focus."
        }

    def _calculate_time_windows(self) -> Dict[str, str]:
        """
        Step 8: Time Window Panel
        Returns specific dates for blockage and improvement windows.
        """
        # Mock logic using current date + offsets
        # In a real engine, this would use Dasha end dates or Transit dates.
        from datetime import datetime, timedelta
        
        today = datetime.now()
        blockage_end = today + timedelta(days=64) # Mock: ~2 months
        improvement_start = today + timedelta(weeks=3) # Mock: 3 weeks
        
        # Panchang Note
        panchang = self.astro.get("panchang", {})
        note = ""
        if panchang:
            tithi = panchang.get("tithi", "")
            if "Amavasya" in tithi or "Purnima" in tithi:
                note = f" (Note: Today is {tithi}, energy is high.)"
        
        return {
            "blockage_active_until": blockage_end.strftime("%d %B %Y"),
            "improvement_starts_in": "3 weeks",
            "summary": f"This blockage is active until {blockage_end.strftime('%d %B %Y')}. Strong improvement window starts in 3 weeks.{note}"
        }

    def _calculate_power_score(self, damages: List[Dict]) -> Dict:
        """
        Step 9: Home Power Score
        """
        score = 100
        potential = 100
        
        for d in damages:
            if d["severity"] == "High":
                score -= 15
            elif d["severity"] == "Medium":
                score -= 10
            elif d["severity"] == "Low":
                score -= 5
                
        # Clamp score
        score = max(20, min(100, score))
        potential_increase = min(100, score + 20) # Mock: usually remedies add 20-30%
        
        return {
            "current": score,
            "potential": potential_increase,
            "message": f"Your Home is supporting {score}% of your destiny"
        }

    def _get_personal_alignment(self) -> List[Dict]:
        """
        Step 7: Personal Alignment Panel
        Map Active Planets to Traits and Directions.
        """
        dasha_lord = self.astro.get("dasha_lord", "Unknown")
        antar_lord = self.astro.get("antardasha_lord", "Unknown")
        
        trait_map = {
            "Sun": {"trait": "Confidence", "direction": "East"},
            "Moon": {"trait": "Calm", "direction": "North-West"},
            "Mars": {"trait": "Courage", "direction": "South"},
            "Mercury": {"trait": "Intellect", "direction": "North"},
            "Jupiter": {"trait": "Wisdom", "direction": "North-East"},
            "Venus": {"trait": "Creativity", "direction": "South-East"},
            "Saturn": {"trait": "Discipline", "direction": "West"},
            "Rahu": {"trait": "Focus", "direction": "South-West"},
            "Ketu": {"trait": "Intuition", "direction": "North-East"}
        }
        
        alignment = []
        
        # Add Dasha Lord
        if dasha_lord in trait_map:
            data = trait_map[dasha_lord]
            alignment.append({
                "need": data["trait"],
                "why": f"{dasha_lord} active",
                "direction": data["direction"],
                "activity": "Face this direction while working"
            })
            
        # Add Antar Lord if different
        if antar_lord in trait_map and antar_lord != dasha_lord:
            data = trait_map[antar_lord]
            alignment.append({
                "need": data["trait"],
                "why": f"{antar_lord} active",
                "direction": data["direction"],
                "activity": "Sleep with head in this direction (if applicable) or Face here"
            })
            
        return alignment

    def _generate_diagnosis(self, damages: List[Dict], active_houses: List[Dict]) -> str:
        """
        Step 6: Consultant Style Diagnosis
        Combines top issues into a single narrative.
        """
        if not damages:
            return "Your space is well-aligned with your current planetary period. No major blockages detected."
            
        # Sort damages by severity
        sorted_damages = sorted(damages, key=lambda x: 3 if x["severity"] == "High" else 2 if x["severity"] == "Medium" else 1, reverse=True)
        
        top_damage = sorted_damages[0]
        
        # Check for multiple zones
        zones = set(d["direction"] for d in sorted_damages[:2])
        zones_str = " and ".join(zones)
        
        life_areas = set(d["life_area"] for d in sorted_damages[:2])
        life_areas_str = " and ".join(life_areas)
        
        planet = top_damage["planet"]
        
        text = (
            f"Your {life_areas_str} are under pressure because the {zones_str} zones "
            f"are blocked during this {planet} period."
        )
        return text

    def _generate_expected_results(self, top_fixes: List[Dict]) -> List[str]:
        results = []
        for fix in top_fixes:
            results.append(f"Fixing {fix['zone']} will unblock {fix['astro_reason'].split('energy of ')[-1]}")
        return results

    def _generate_warnings(self, damages: List[Dict]) -> List[str]:
        warnings = []
        for d in damages:
            if d["severity"] == "High":
                warnings.append(f"Do NOT start new ventures related to {d['life_area']} until {d['direction']} is fixed.")
        
        # New Panchang Logic
        panchang = self.astro.get("panchang", {})
        if panchang:
            tithi = panchang.get("tithi", "")
            yoga = panchang.get("yoga", "")
            
            # Rikta Tithis (4, 9, 14) check
            if any(x in tithi for x in ["Chaturthi", "Navami", "Chaturdashi"]):
                warnings.append(f"Today is {tithi} (Rikta Tithi). Avoid starting major demolition work today.")
            
            # Bad Yogas
            if yoga in ["Vyatipata", "Vaidhriti", "Ganda", "Atiganda", "Shula"]:
                warnings.append(f"Current Yoga is {yoga} (Inauspicious). Delay remedy installation by 1 day.")
                
        return warnings

