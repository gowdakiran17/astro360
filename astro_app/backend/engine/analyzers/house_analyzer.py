
"""
House Analyzer
Analyzes the strength and condition of astrological houses.
Includes logic for estimating planetary strength (Shadbala-lite) based on dignity.
"""

class HouseAnalyzer:
    """Analyzes houses based on question category"""
    
    HOUSE_MAPPINGS = {
        "career": {
            "primary": [10],  # Karma bhava
            "secondary": [6, 2, 11],  # Service, wealth, gains
            "supporting": [1, 9]  # Self, luck
        },
        "relationships": {
            "primary": [7],  # Partnerships
            "secondary": [5, 8, 11],  # Romance, intimacy, friendship
            "supporting": [1, 4, 12]  # Self, happiness, bedrock
        },
        "finance": {
            "primary": [2, 11],  # Wealth, gains
            "secondary": [9, 10],  # Fortune, profession
            "supporting": [5, 8]  # Speculation, inheritance
        },
        "health": {
            "primary": [1, 6],  # Vitality, disease
            "secondary": [8, 12],  # Longevity, hospitalization
            "supporting": [3, 4]  # Energy, happiness
        },
        # Default fallback
        "general": {
            "primary": [1],
            "secondary": [5, 9],
            "supporting": [10]
        }
    }
    
    def analyze_houses_for_question(self, category, birth_chart, transits):
        """Comprehensive house analysis"""
        if not birth_chart or "planets" not in birth_chart or "houses" not in birth_chart:
            return {
                "primary_houses": [],
                "secondary_houses": [],
                "overall_strength": 0,
                "key_insights": ["Chart data missing"],
                "challenges": [],
                "opportunities": []
            }

        # Normalize Input (Defensive Copy)
        # Ensure we are working with Keyed Dictionaries even if lists were passed
        chart_proxy = birth_chart.copy()
        
        if isinstance(chart_proxy.get("planets"), list):
            p_dict = {p["name"]: p for p in chart_proxy["planets"] if "name" in p}
            chart_proxy["planets"] = p_dict
            
        if isinstance(chart_proxy.get("houses"), list):
            h_dict = {str(h["house_number"]): h for h in chart_proxy["houses"] if "house_number" in h}
            chart_proxy["houses"] = h_dict

        # enrich chart with strength if missing
        self._enrich_chart_data(chart_proxy)

        mapping = self.HOUSE_MAPPINGS.get(category, self.HOUSE_MAPPINGS["general"])
        
        analysis = {
            "primary_houses": [],
            "secondary_houses": [],
            "overall_strength": 0,
            "key_insights": [],
            "challenges": [],
            "opportunities": []
        }
        
        # Analyze primary
        for h in mapping["primary"]:
            ha = self._analyze_single_house(h, chart_proxy, transits)
            analysis["primary_houses"].append(ha)
            analysis["overall_strength"] += ha["strength"] * 0.5
            
        # Analyze secondary
        for h in mapping["secondary"]:
            ha = self._analyze_single_house(h, chart_proxy, transits)
            analysis["secondary_houses"].append(ha)
            analysis["overall_strength"] += ha["strength"] * 0.3
            
        return analysis

    def _enrich_chart_data(self, chart):
        """Add estimated strength_percentage if missing."""
        planets = chart.get("planets", {})
        for name, data in planets.items():
            if "strength_percentage" not in data:
                # Basic dignity logic
                dignity = self._get_approx_dignity(name, data.get("sign"))
                data["strength_percentage"] = dignity

    def _get_approx_dignity(self, planet, sign):
        # Very simplified dignity mapping
        # TODO: Replace with full VedAstro Shadbala
        exaltation = {"Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn", "Mercury": "Virgo", "Jupiter": "Cancer", "Venus": "Pisces", "Saturn": "Libra"}
        debilitation = {"Sun": "Libra", "Moon": "Scorpio", "Mars": "Cancer", "Mercury": "Pisces", "Jupiter": "Capricorn", "Venus": "Virgo", "Saturn": "Aries"}
        own = {"Sun": ["Leo"], "Moon": ["Cancer"], "Mars": ["Aries", "Scorpio"], "Mercury": ["Gemini", "Virgo"], "Jupiter": ["Sagittarius", "Pisces"], "Venus": ["Taurus", "Libra"], "Saturn": ["Capricorn", "Aquarius"]}
        
        if sign == exaltation.get(planet): return 95.0
        if sign == debilitation.get(planet): return 25.0
        if sign in own.get(planet, []): return 85.0
        return 50.0 # Neutral

    def _analyze_single_house(self, house_num, birth_chart, transits):
        # Handle string keys or list access
        h_key = str(house_num)
        houses = birth_chart.get("houses", {})
        
        house_data = {}
        if isinstance(houses, dict):
            house_data = houses.get(h_key, {})
        elif isinstance(houses, list):
             # Find house in list
             house_data = next((h for h in houses if h.get("house_number") == house_num), {})
        
        analysis = {
            "house_number": house_num,
            "sign": house_data.get("sign", "Unknown"),
            "lord": house_data.get("lord", "Unknown"),
            "lord_position": "Unknown", # Need to calculate
            "planets_in_house": house_data.get("planets", []), # Map 'planets' list
            "strength": 0,
            "condition": "Average",
            "effects": []
        }
        
        # 1. Lord Strength
        lord = analysis["lord"]
        if lord in birth_chart["planets"]:
            lord_data = birth_chart["planets"][lord]
            s = lord_data.get("strength_percentage", 50)
            analysis["strength"] += s * 0.4
            # Find lord position
            analysis["lord_position"] = f"{lord_data.get('house', '?')}th House"

        # 2. Planets in House
        # Iterate all planets to find who is in this house
        planets_in = []
        for p_name, p_data in birth_chart["planets"].items():
            if p_data.get("house") == house_num:
                planets_in.append(p_name)
                
        analysis["planets_in_house"] = planets_in
        
        for p in planets_in:
            p_str = birth_chart["planets"][p].get("strength_percentage", 50)
            if p_str > 60:
                analysis["strength"] += 15
                analysis["effects"].append(f"{p} strengthens this house")
            elif p_str < 40:
                analysis["strength"] -= 10
                analysis["effects"].append(f"{p} weakens this house")
                
        # 3. Transits (Simplified)
        if transits:
            for t_name, t_data in transits.items():
                # Check structure: might be straight dict or nested
                # Assume t_data has 'house' or we map sign
                pass # TODO: Implement robust transit mapping
        
        # Final Condition
        if analysis["strength"] > 70: analysis["condition"] = "Very Strong"
        elif analysis["strength"] > 50: analysis["condition"] = "Strong"
        elif analysis["strength"] > 30: analysis["condition"] = "Moderate"
        else: analysis["condition"] = "Weak"
        
        return analysis
