
"""
Compatibility Analyzer
Analyzes relationship compatibility between two charts based on planetary synastry.
"""

class CompatibilityAnalyzer:
    """Analyzes compatibility between two people"""
    
    SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    
    def analyze_compatibility(self, person1_chart, person2_chart, relationship_type="romantic"):
        """
        Comprehensive compatibility analysis
        """
        
        compatibility = {
            "overall_score": 0,
            "mental_compatibility": 0,
            "emotional_compatibility": 0,
            "physical_compatibility": 0,
            "spiritual_compatibility": 0,
            "strengths": [],
            "challenges": [],
            "recommendations": []
        }
        
        # 1. Emotional (Moon) - 25%
        moon1 = person1_chart.get("planets", {}).get("moon", {}) # Lowercase key from schema
        moon2 = person2_chart.get("planets", {}).get("moon", {}) # Using lowercase 'moon' if schema dictates
        
        # Fallback if keys are Title Case
        if not moon1: moon1 = person1_chart.get("planets", {}).get("Moon", {})
        if not moon2: moon2 = person2_chart.get("planets", {}).get("Moon", {})
            
        moon_res = self._check_moon_compatibility(moon1, moon2)
        compatibility["emotional_compatibility"] = moon_res["score"]
        compatibility["overall_score"] += moon_res["score"] * 0.25
        compatibility["strengths"].extend(moon_res["strengths"])
        compatibility["challenges"].extend(moon_res["challenges"])

        # 2. Physical (Venus-Mars) - 20%
        vm_res = self._check_venus_mars_compatibility(person1_chart, person2_chart)
        compatibility["physical_compatibility"] = vm_res["score"]
        compatibility["overall_score"] += vm_res["score"] * 0.20
        compatibility["strengths"].extend(vm_res["strengths"])

        # 3. Mental (Mercury) - 20%
        merc1 = person1_chart.get("planets", {}).get("Mercury", {}) or person1_chart.get("planets", {}).get("mercury", {})
        merc2 = person2_chart.get("planets", {}).get("Mercury", {}) or person2_chart.get("planets", {}).get("mercury", {})
        
        merc_res = self._check_planet_sign_compatibility(merc1, merc2, "Mental")
        compatibility["mental_compatibility"] = merc_res["score"]
        compatibility["overall_score"] += merc_res["score"] * 0.20
        if merc_res["score"] > 60: compatibility["strengths"].append("Strong intellectual connection")
        elif merc_res["score"] < 40: compatibility["challenges"].append("Communication gaps possible")

        # 4. Spiritual (Jupiter) - 15%
        jup1 = person1_chart.get("planets", {}).get("Jupiter", {}) or person1_chart.get("planets", {}).get("jupiter", {})
        jup2 = person2_chart.get("planets", {}).get("Jupiter", {}) or person2_chart.get("planets", {}).get("jupiter", {})
        
        jup_res = self._check_planet_sign_compatibility(jup1, jup2, "Spiritual")
        compatibility["spiritual_compatibility"] = jup_res["score"]
        compatibility["overall_score"] += jup_res["score"] * 0.15
        if jup_res["score"] > 60: compatibility["strengths"].append("Shared values and goals")

        # 5. 7th House (General) - 20%
        # Simplified: Check Lords
        h7_1 = person1_chart.get("houses", {}).get("7", {})
        h7_2 = person2_chart.get("houses", {}).get("7", {})
        # Placeholder score for now to avoid zero
        compatibility["overall_score"] += 15 # Baseline
        
        # Recommendations
        compatibility["recommendations"] = self._generate_recommendations(compatibility)
        
        return compatibility

    def _check_moon_compatibility(self, moon1, moon2):
        res = {"score": 50, "strengths": [], "challenges": []}
        
        # Nakshatra
        n1 = moon1.get("nakshatra")
        n2 = moon2.get("nakshatra")
        if n1 and n2 and n1 == n2:
            res["score"] += 20
            res["strengths"].append("Same emotional wavelength (Nakshatra)")
            
        # Signs
        s1 = moon1.get("sign")
        s2 = moon2.get("sign")
        if s1 and s2:
            if self._are_trine_signs(s1, s2):
                res["score"] += 25
                res["strengths"].append("Harmonious flow (Trine)")
            elif self._are_opposite_signs(s1, s2):
                res["score"] += 10
                res["challenges"].append("Opposite emotional needs")
            elif s1 == s2:
                res["score"] += 15
                res["strengths"].append("Similar emotional nature")
                
        # Cap
        res["score"] = min(res["score"], 100)
        return res

    def _check_venus_mars_compatibility(self, c1, c2):
        res = {"score": 50, "strengths": []}
        # P1 Venus / P2 Mars
        v1 = c1.get("planets", {}).get("Venus", {}).get("sign") or c1.get("planets", {}).get("venus", {}).get("sign")
        m2 = c2.get("planets", {}).get("Mars", {}).get("sign") or c2.get("planets", {}).get("mars", {}).get("sign")
        
        if self._are_compatible_signs(v1, m2):
            res["score"] += 20
            res["strengths"].append("Romantic Spark (Venus-Mars)")
            
        # P2 Venus / P1 Mars
        v2 = c2.get("planets", {}).get("Venus", {}).get("sign") or c2.get("planets", {}).get("venus", {}).get("sign")
        m1 = c1.get("planets", {}).get("Mars", {}).get("sign") or c1.get("planets", {}).get("mars", {}).get("sign")
        
        if self._are_compatible_signs(v2, m1):
            res["score"] += 20
            res["strengths"].append("Physical Chemistry (Mars-Venus)")
            
        res["score"] = min(res["score"], 100)
        return res

    def _check_planet_sign_compatibility(self, p1, p2, label):
        s1 = p1.get("sign")
        s2 = p2.get("sign")
        score = 50
        if self._are_trine_signs(s1, s2): score += 30
        elif s1 == s2: score += 20
        elif self._are_compatible_signs(s1, s2): score += 10
        elif self._are_opposite_signs(s1, s2): score -= 10 # Opposites can clash for Mercury
        return {"score": min(max(score, 0), 100)}

    def _get_sign_index(self, sign):
        if not sign or sign not in self.SIGNS: return -1
        return self.SIGNS.index(sign)

    def _are_trine_signs(self, s1, s2):
        i1, i2 = self._get_sign_index(s1), self._get_sign_index(s2)
        if i1 == -1 or i2 == -1: return False
        diff = abs(i1 - i2)
        return diff in [4, 8]

    def _are_opposite_signs(self, s1, s2):
        i1, i2 = self._get_sign_index(s1), self._get_sign_index(s2)
        if i1 == -1 or i2 == -1: return False
        return abs(i1 - i2) == 6

    def _are_compatible_signs(self, s1, s2):
        # Fire/Air compatible, Earth/Water compatible
        elements = {
            "Fire": ["Aries", "Leo", "Sagittarius"],
            "Earth": ["Taurus", "Virgo", "Capricorn"],
            "Air": ["Gemini", "Libra", "Aquarius"],
            "Water": ["Cancer", "Scorpio", "Pisces"]
        }
        e1 = next((e for e, signs in elements.items() if s1 in signs), None)
        e2 = next((e for e, signs in elements.items() if s2 in signs), None)
        
        if not e1 or not e2: return False
        if e1 == e2: return True
        if (e1 in ["Fire", "Air"] and e2 in ["Fire", "Air"]): return True
        if (e1 in ["Earth", "Water"] and e2 in ["Earth", "Water"]): return True
        return False

    def _generate_recommendations(self, c):
        recs = []
        if c["overall_score"] > 70:
            recs.append("Great potential! Focus on maintaining the spark.")
        elif c["overall_score"] < 50:
            recs.append("Differences exist. Requires patience and understanding.")
            
        if c["emotional_compatibility"] < 40:
            recs.append("Practice active listening to bridge emotional gaps.")
        if c["mental_compatibility"] < 40:
            recs.append("Find shared hobbies to improve intellectual bond.")
            
        return recs
