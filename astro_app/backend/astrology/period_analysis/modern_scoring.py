"""
Modern Scoring Engine
Implements weighted scoring logic (-10 to +10) for life predictor.
Based on align27-style Vedic weighting.
"""
from typing import Dict, List, Any, Optional
import logging
from .core import AstroCalculate

logger = logging.getLogger(__name__)

class ModernScoringEngine:
    @staticmethod
    def calculate_panchanga_score(vara: int, tithi: int, nakshatra: int, yoga: int, karana: int) -> int:
        score = 0
        
        # Vara (Weekday 0=Sun, 6=Sat) - Simplified: Sun, Tue, Sat are often 'malefic' days
        if vara in [0, 2, 6]: score -= 1 
        elif vara in [1, 3, 4, 5]: score += 1
            
        # Tithi (1-30)
        auspicious_tithis = [2, 3, 5, 10, 11, 13, 15] # 15=Poornima
        inauspicious_tithis = [8, 9, 14, 30] # 30=Amavasya
        if tithi in auspicious_tithis: score += 2
        elif tithi in inauspicious_tithis: score -= 2
            
        # Nakshatra (1-27)
        auspicious_naks = [1, 4, 5, 8, 14, 15, 17, 22, 27]
        ugra_naks = [2, 10, 11, 19, 20]
        if nakshatra in auspicious_naks: score += 2
        elif nakshatra in ugra_naks: score -= 2
        else: score += 1 # Sthira/Mridu
            
        # Yoga & Karana
        # Simplified: Even = Good, Odd = Mixed for Karana placeholder
        if karana % 2 == 0: score += 1
        else: score -= 1
            
        if yoga % 2 == 0: score += 1
        else: score -= 1
            
        return max(-10, min(10, score))

    @staticmethod
    def calculate_natal_baseline(birth_chart: Dict) -> int:
        score = 0
        # Placeholder for complex natal assessment
        # In a real engine, we'd check Lagna Lord position, Shadbala, etc.
        # For now, we return a baseline based on number of planets in kendra (1,4,7,10)
        planets = birth_chart.get("planets", [])
        asc_sign = int(birth_chart.get("ascendant", {}).get("longitude", 0) / 30)
        
        kendra_count = 0
        for p in planets:
            p_sign = int(p["longitude"] / 30)
            house = (p_sign - asc_sign + 12) % 12 + 1
            if house in [1, 4, 7, 10]:
                kendra_count += 1
        
        score += (kendra_count - 3) # Offset around 3-4 planets
        return max(-5, min(5, score))

    @staticmethod
    def calculate_transit_impact(current_positions: Dict, natal_moon: float, natal_asc: float) -> int:
        score = 0
        moon_rashi = int(natal_moon / 30)
        asc_rashi = int(natal_asc / 30)
        
        # Saturn (Long-term)
        if "Saturn" in current_positions:
            sat_rashi = int(current_positions["Saturn"] / 30)
            house_moon = (sat_rashi - moon_rashi + 12) % 12 + 1
            if house_moon in [12, 1, 2]: score -= 2 # Sade Sati
            if house_moon in [4, 8]: score -= 1 # Dhaiya
            
        # Jupiter (Long-term)
        if "Jupiter" in current_positions:
            jup_rashi = int(current_positions["Jupiter"] / 30)
            house_moon = (jup_rashi - moon_rashi + 12) % 12 + 1
            if house_moon in [2, 5, 7, 9, 11]: score += 3
            elif house_moon in [6, 8, 12]: score -= 2
            
        return max(-10, min(10, score))

    @staticmethod
    def calculate_day_score(
        panchanga: int,
        natal: int,
        transit: int,
        dasha: int = 0
    ) -> Dict:
        """
        Total Score S_day = S_natal + S_panchanga + S_transit + S_dasha
        Maps to Traffic Light: Green, Amber, Red.
        """
        total = panchanga + natal + transit + dasha
        
        # Thresholds
        color = "Amber"
        if total >= 4: color = "Green"
        elif total <= -2: color = "Red"
        
        return {
            "score": total,
            "color": color,
            "components": {
                "panchanga": panchanga,
                "natal": natal,
                "transit": transit,
                "dasha": dasha
            }
        }

    @staticmethod
    def calculate_moment_score(
        day_score: int,
        hora_factor: int,
        pakshi_factor: int,
        special_factor: int = 0
    ) -> Dict:
        """
        S_moment(t) = S_day + S_hora + S_pakshi + S_special
        """
        total = day_score + hora_factor + pakshi_factor + special_factor
        
        label = "Neutral"
        if total >= day_score + 4: label = "Golden"
        elif total >= day_score + 1: label = "Productive"
        elif total < day_score - 2: label = "Silence"
        
        return {
            "score": total,
            "label": label
        }
