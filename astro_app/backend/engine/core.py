
"""
Astrology Engine Core
Facade that orchestrates Question Processing, House Analysis, and Dasha Analysis.
"""
from astro_app.backend.engine.analyzers.question_processor import QuestionAnalyzer
from astro_app.backend.engine.analyzers.house_analyzer import HouseAnalyzer
from astro_app.backend.engine.analyzers.dasha_analyzer import DashaAnalyzer

class AstrologyEngine:
    def __init__(self):
        self.qa = QuestionAnalyzer()
        self.ha = HouseAnalyzer()
        self.da = DashaAnalyzer()
        
    def analyze_request(self, query: str, birth_chart: dict, transits: dict, dasha: dict):
        """
        Full astrological analysis pipeline.
        Returns detailed structured data for LLM consumption.
        """
        # 1. Analyze Question
        q_analysis = self.qa.analyze(query)
        category = q_analysis.get("primary_category", "general")
        
        # 2. Analyze Houses based on Category
        # (HouseAnalyzer needs chart + transits)
        h_analysis = self.ha.analyze_houses_for_question(category, birth_chart, transits)
        
        # 3. Analyze Dasha Timing
        d_analysis = self.da.analyze_current_dasha(dasha, birth_chart, category)
        
        # 4. Construct Synthesis Context
        # This object represents the "Hard Logic" the AI must follow
        engine_context = {
            "intent": q_analysis,
            "astrological_logic": {
                "focus_area": category.upper(),
                "primary_houses": [h['house_number'] for h in h_analysis.get('primary_houses', [])],
                "house_conditions": {
                     h['house_number']: h['condition'] 
                     for h in h_analysis.get('primary_houses', [])
                },
                "overall_strength": h_analysis.get("overall_strength", 0),
                "current_period": d_analysis.get("combined_theme", "")
            },
            "detailed_analysis": {
                "houses": h_analysis,
                "dasha": d_analysis
            }
        }
        
        return engine_context

    def analyze_compatibility(self, chart1: dict, chart2: dict):
        """
        Analyze compatibility between two charts.
        """
        from astro_app.backend.engine.analyzers.compatibility_analyzer import CompatibilityAnalyzer
        analyzer = CompatibilityAnalyzer()
        return analyzer.analyze_compatibility(chart1, chart2)

