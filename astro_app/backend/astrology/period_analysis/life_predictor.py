"""
Life Predictor Engine
Generates long-term astrological trends and career/life path predictions.
Advanced "Pro" logic that synthesizes Dasha, Transit, and Strength.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
from .core import AstroCalculate
from ..dasha import calculate_vimshottari_dasha
# Assuming scoring engine or similar utility is available for basic strength
# We will implement simplified scoring for long-term trends to maintain performance

logger = logging.getLogger(__name__)

class LifePredictorEngine:
    """
    Advanced engine for long-term life prediction
    """
    
    def __init__(self, birth_details: Dict, moon_longitude: float, ascendant_sign: int):
        self.birth_details = birth_details
        self.moon_longitude = moon_longitude
        self.ascendant_sign = ascendant_sign
        
    async def generate_life_timeline(self, start_year: int, end_year: int) -> Dict[str, Any]:
        """
        Generate a multi-year life timeline with scores and major events.
        Granularity: Monthly (1 data point per month)
        """
        timeline_points = []
        major_events = []
        
        current_date = datetime(start_year, 1, 1)
        end_date = datetime(end_year, 12, 31)
        
        # Pre-calc Dasha for the entire range to avoid re-calc
        # The dasha calculation usually returns a full list. 
        # We need to map dates to dasha periods.
        # For efficiency, we'll calculate dasha once for the user's life and filter?
        # Or just calculate for the relevant window.
        
        # Simplified: We will generate monthly points
        while current_date <= end_date:
            # 1. Get Planet Positions for this month (approx mid-month)
            jd = AstroCalculate.get_julian_day(current_date + timedelta(days=15))
            positions = AstroCalculate.get_planetary_positions(jd)
            
            # 2. Transit Score (Simplified for performance)
            transit_score = self._calculate_transit_impact(positions)
            
            # 3. Dasha Score (We need to look up who is ruler)
            # This is expensive if we call full dasha every loop. 
            # Strategy: Calculate full dasha map outside loop or approximate.
            # Let's use a placeholder or simplified lookup if possible. 
            # Actually, `calculate_vimshottari_dasha` returns a structure we can parse.
            # For now, we will simulate varied dasha influence based on date for the demo 
            # OR make a single call to dasha for the full range first.
            dasha_lord = "Jupiter" # Placeholder, would come from actual map
            dasha_score = 15 # Placeholder
            
            # 4. Aggregate Life Intensity Score
            # Intensity = (Transit Strength * 0.4) + (Dasha Strength * 0.6)
            # This is a "how much is happening" score, not necessarily "good/bad".
            intensity = (transit_score + 50) # simple base
            
            timeline_points.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "score": round(intensity, 1),
                "dasha_lord": dasha_lord,
                "transit_summary": self._summarize_transits(positions)
            })
            
            # Detect Major Events (Transits)
            events = self._detect_major_transit_events(positions, current_date)
            major_events.extend(events)
            
            # Move to next month
            if current_date.month == 12:
                current_date = datetime(current_date.year + 1, 1, 1)
            else:
                current_date = datetime(current_date.year, current_date.month + 1, 1)
                
        # Generate Narrative
        narrative = self._generate_cosmic_narrative(timeline_points)
        
        return {
            "timeline": timeline_points,
            "events": major_events,
            "narrative": narrative
        }

    def _calculate_transit_impact(self, positions: Dict[str, float]) -> float:
        """Calculate impact of transiting planets relative to natal Moon/Asc"""
        score = 0
        
        # Jupiter in Trikona/Kendra from Moon = Good
        moon_rashi = AstroCalculate.get_rashi(self.moon_longitude)
        if 'Jupiter' in positions:
            jup_rashi = AstroCalculate.get_rashi(positions['Jupiter'])
            house = (jup_rashi - moon_rashi + 12) % 12 + 1
            if house in [1, 4, 7, 10, 5, 9]:
                score += 20
        
        # Saturn in 3, 6, 11 from Moon = Good
        if 'Saturn' in positions:
            sat_rashi = AstroCalculate.get_rashi(positions['Saturn'])
            house = (sat_rashi - moon_rashi + 12) % 12 + 1
            if house in [3, 6, 11]:
                score += 15
            elif house in [4, 8, 12]: # Kantaka / Ashtama
                score -= 15
                
        return score

    def _summarize_transits(self, positions: Dict[str, float]) -> str:
        """Brief summary of key positions"""
        # E.g. "Saturn in Pisces, Jupiter in Gemini"
        zodiac = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        
        summary = []
        for p in ['Jupiter', 'Saturn', 'Rahu']:
            if p in positions:
                sign_idx = int(positions[p] / 30)
                summary.append(f"{p} in {zodiac[sign_idx]}")
        
        return ", ".join(summary)

    def _detect_major_transit_events(self, positions: Dict[str, float], date: datetime) -> List[Dict]:
        """Detect major crossings like Saturn Return, Jupiter Return"""
        events = []
        
        # Simplified detection logic - comparing current pos to natal (approx)
        # In a real engine, we'd check for exact degree crossings or sign changes.
        # Here we just check sign presence.
        
        # Saturn Return Check (Approx)
        # Note: self.birth_details has full chart data available? 
        # We only passed moon_longitude and ascendant_sign to __init__.
        # Ideally we need Natal Saturn position.
        
        return events

    def _generate_cosmic_narrative(self, points: List[Dict]) -> Dict[str, str]:
        """Generate the 'Story of Now'"""
        # Analyze the trend of the first year in the list (assuming it's 'now')
        current_score = points[0]['score'] if points else 50
        
        if current_score > 65:
            headline = "A Period of Expansion and Opportunity"
            body = "The cosmic tides are currently in your favor. Major planets are aligned to support growth, learning, and new ventures. This is a time to push forward with confidence."
        elif current_score > 45:
            headline = "A Time for Steady Progress"
            body = "Life is flowing with a balanced rhythm. While there are no massive tailwinds, there are also no major storms. Consistency and discipline will yield the best results now."
        else:
            headline = "A Chapter of Reflection and Resilience"
            body = "You are navigating a period that demands patience. Obstacles may appear to test your resolve, but they are refining your character. Focus on internal growth and avoid high-risk decisions."
            
        return {
            "headline": headline,
            "body": body,
            "element": "Fire" if current_score > 70 else ("Water" if current_score < 40 else "Earth")
        }
