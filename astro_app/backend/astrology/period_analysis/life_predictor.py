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

from .modern_scoring import ModernScoringEngine
from .panchapakshi_service import PanchapakshiService
from .muhurata import get_muhurata_data
from .panchang import calculate_tithi_detailed, calculate_karana
from ...services.vedastro_predictor import VedAstroPredictorClient

logger = logging.getLogger(__name__)

class LifePredictorEngine:
    """
    Advanced engine for life prediction with align27-style scoring.
    """
    
    def __init__(self, birth_details: Dict, moon_longitude: float, ascendant_sign: int):
        self.birth_details = birth_details
        self.moon_longitude = moon_longitude
        self.ascendant_sign = ascendant_sign
        
    async def generate_life_timeline(self, start_year: int, end_year: int) -> Dict[str, Any]:
        """
        Generate a multi-year life timeline with scores and major events.
        Granularity: Monthly points, but with daily-derived weights.
        """
        timeline_points = []
        major_events = []
        
        current_date = datetime(start_year, 1, 1)
        end_date = datetime(end_year, 12, 31)
        
        # Pre-calc Natal Baseline
        natal_baseline = ModernScoringEngine.calculate_natal_baseline(self.birth_details)
        
        while current_date <= end_date:
            # Get data for mid-month to represent the month's energy
            mid_month = current_date + timedelta(days=15)
            jd = AstroCalculate.get_julian_day(mid_month)
            positions = AstroCalculate.get_planetary_positions(jd)
            
            # 1. Panchanga Score
            sun_long = positions['Sun']
            moon_long = positions['Moon']
            tithi_data = calculate_tithi_detailed(sun_long, moon_long)
            karana_idx, _ = calculate_karana(sun_long, moon_long)
            nakshatra = AstroCalculate.get_nakshatra(moon_long)
            yoga = AstroCalculate.calculate_yoga(sun_long, moon_long)
            vara = mid_month.isoweekday() % 7 # Sunday=0
            
            panchanga_score = ModernScoringEngine.calculate_panchanga_score(
                vara, tithi_data['number'], nakshatra, yoga, karana_idx
            )
            
            # 2. Transit Score
            transit_score = ModernScoringEngine.calculate_transit_impact(
                positions, self.moon_longitude, self.ascendant_sign * 30
            )
            
            # 3. Dasha Factor (Simplified integration)
            dasha_score = 0 
            
            # 4. Total Day Score
            day_fav = ModernScoringEngine.calculate_day_score(
                panchanga_score, natal_baseline, transit_score, dasha_score
            )
            
            timeline_points.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "score": day_fav["score"],
                "color": day_fav["color"],
                "dasha_lord": "Jupiter", # Placeholder
                "transit_summary": self._summarize_transits(positions)
            })
            
            # Detect Major Events
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

    async def get_advanced_day_prediction(self, target_date: datetime) -> Dict[str, Any]:
        """
        Calculates high-granularity moments for a specific day.
        Includes 30-minute slots with Panchapakshi and Hora factors.
        """
        lat = float(self.birth_details.get('latitude', 0))
        lon = float(self.birth_details.get('longitude', 0))
        
        # 1. Fetch Real Data from VedAstro
        panchanga = VedAstroPredictorClient.get_panchanga(target_date, self.birth_details)
        transits = VedAstroPredictorClient.get_transits(target_date, self.birth_details)
        dasha = VedAstroPredictorClient.get_dasha(target_date, self.birth_details)
        
        # 2. Get Sun Events for dividers (using swisseph for precise local sunrise)
        jd = AstroCalculate.get_julian_day(target_date)
        muhurta_data = get_muhurata_data(jd, lat, lon)
        sunrise = AstroCalculate.jd_to_datetime(muhurta_data['sunrise'])
        sunset = AstroCalculate.jd_to_datetime(muhurta_data['sunset'])
        
        # 3. Calculate Day Score using VedAstro data
        panchanga_score = ModernScoringEngine.calculate_panchanga_score(
            panchanga.get('vara', 0),
            panchanga.get('tithi', 1),
            panchanga.get('nakshatra', 1),
            panchanga.get('yoga', 1),
            panchanga.get('karana', 1)
        )
        
        natal_baseline = ModernScoringEngine.calculate_natal_baseline(self.birth_details)
        
        # Transit impact from VedAstro positions
        transit_score = ModernScoringEngine.calculate_transit_impact(
            transits, self.moon_longitude, self.ascendant_sign * 30
        )
        
        # Dasha impact (simplified lookup)
        dasha_score = 1 if dasha.get('maha') in ["Jupiter", "Venus", "Moon", "Mercury"] else -1
        
        day_fav = ModernScoringEngine.calculate_day_score(
            panchanga_score, natal_baseline, transit_score, dasha_score
        )
        
        # 3. Generate 30-minute slots (48 slots)
        moments = []
        start_of_day = datetime(target_date.year, target_date.month, target_date.day)
        
        # Get Horas for the day
        horas = [p for p in muhurta_data['periods'] if p['type'] == 'Hora']
        
        for i in range(48):
            slot_time = start_of_day + timedelta(minutes=i * 30)
            
            # Panchapakshi
            pakshi = PanchapakshiService.calculate_state(
                slot_time, 
                AstroCalculate.get_nakshatra(self.moon_longitude),
                self.birth_details.get('gender', 'male'),
                sunrise,
                sunset
            )
            
            # Hora
            hora_ruler = "Sun"
            for h in horas:
                h_start = AstroCalculate.jd_to_datetime(h['start'])
                h_end = AstroCalculate.jd_to_datetime(h['end'])
                if h_start <= slot_time < h_end:
                    hora_ruler = h['ruler']
                    break
            
            # Simplified Hora Impact
            hora_score = 1 if hora_ruler in ["Jupiter", "Venus", "Moon", "Mercury"] else -1
            
            # Moment Score
            m_score = ModernScoringEngine.calculate_moment_score(
                day_fav["score"],
                hora_score,
                pakshi["score"]
            )
            
            moments.append({
                "time": slot_time.strftime("%H:%M"),
                "score": m_score["score"],
                "label": m_score["label"],
                "bird_state": pakshi["state"],
                "bird_label": pakshi["label"],
                "hora": hora_ruler
            })
            
        return {
            "date": target_date.strftime("%Y-%m-%d"),
            "day_score": day_fav,
            "moments": moments,
            "summary": self._generate_day_summary(day_fav, moments)
        }

    def _generate_day_summary(self, day_fav: Dict, moments: List[Dict]) -> str:
        golden_count = len([m for m in moments if m["label"] == "Golden"])
        if day_fav["color"] == "Green":
            return f"An excellent day with {golden_count} Golden Moments. Perfect for important actions."
        elif day_fav["color"] == "Red":
            return f"A challenging day requiring restraint. {golden_count} Golden Moments offer brief windows of opportunity."
        else:
            return f"A neutral day. Leverage the {golden_count} Golden Moments for key activities."

    def _calculate_transit_impact(self, positions: Dict[str, float]) -> float:
        """Old method placeholder - redirects to modern"""
        return ModernScoringEngine.calculate_transit_impact(positions, self.moon_longitude, self.ascendant_sign*30)

    def _summarize_transits(self, positions: Dict[str, float]) -> str:
        """Brief summary of key positions"""
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
        # Simplified detection
        return events

    def _generate_cosmic_narrative(self, points: List[Dict]) -> Dict[str, str]:
        """Generate the 'Story of Now'"""
        current_score = points[0]['score'] if points else 0
        
        if current_score >= 4:
            headline = "A Period of Expansion and Opportunity"
            body = "The cosmic tides are currently in your favor. Major planets are aligned to support growth, learning, and new ventures. This is a time to push forward with confidence."
        elif current_score >= -1:
            headline = "A Time for Steady Progress"
            body = "Life is flowing with a balanced rhythm. While there are no massive tailwinds, there are also no major storms. Consistency and discipline will yield the best results now."
        else:
            headline = "A Chapter of Reflection and Resilience"
            body = "You are navigating a period that demands patience. Obstacles may appear to test your resolve, but they are refining your character. Focus on internal growth and avoid high-risk decisions."
            
        return {
            "headline": headline,
            "body": body,
            "element": "Fire" if current_score >= 5 else ("Water" if current_score < -2 else "Earth")
        }
