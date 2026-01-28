
"""
Dasha Analyzer
Analyzes current Planetary Periods (Dasha) to determine life themes and timing.
"""
from astro_app.backend.engine.knowledge_base import PLANET_SIGNIFICATIONS

class DashaAnalyzer:
    """Analyzes current dasha periods and their effects"""
    
    def analyze_current_dasha(self, dasha_data, birth_chart, category="general"):
        """Comprehensive dasha analysis"""
        if not dasha_data:
            return {
                "mahadasha": {"planet": "Unknown"},
                "antardasha": {"planet": "Unknown"},
                "combined_theme": "Dasha info unavailable"
            }

        # Parse dasha structure (Assuming simple dict from API)
        # Structure: {"mahadasha": {"planet": "Venus", "end": "2039..."}, "antardasha": ...}
        
        # Try extracting from summary (Internal Engine format)
        summary = dasha_data.get("summary", {})
        if summary:
            md = summary.get("current_mahadasha", {})
            ad = summary.get("current_antardasha", {})
            md_planet = md.get("lord", "Unknown")
            ad_planet = ad.get("lord", "Unknown")
        else:
            # Fallback (Simple/Legacy format)
            md = dasha_data.get("mahadasha", {})
            ad = dasha_data.get("antardasha", {})
            md_planet = md.get("planet", md.get("lord", "Unknown"))
            ad_planet = ad.get("planet", ad.get("lord", "Unknown"))
        
        analysis = {
            "mahadasha": self._analyze_period_planet(md_planet, birth_chart, "Major Period"),
            "antardasha": self._analyze_period_planet(ad_planet, birth_chart, "Sub Period"),
            "combined_theme": f"{md_planet} MD setting the stage, {ad_planet} AD delivering results."
        }
        
        return analysis

    def _analyze_period_planet(self, planet_name, birth_chart, label):
        # Look up in Knowledge Base
        kb_data = PLANET_SIGNIFICATIONS.get(planet_name, {})
        
        # Check chart strength
        chart_p_data = birth_chart.get("planets", {}).get(planet_name, {})
        strength = chart_p_data.get("strength_percentage", 50)
        
        condition = "Strong" if strength > 60 else "Average"
        if strength < 30: condition = "Weak"
        
        return {
            "planet": planet_name,
            "type": label,
            "natural_significations": kb_data.get("natural_significator", [])[:3], # Top 3
            "chart_condition": condition,
            "house": chart_p_data.get("house", "Unknown"),
            "sign": chart_p_data.get("sign", "Unknown")
        }
