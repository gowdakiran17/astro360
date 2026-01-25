from typing import Dict, List, Any
import math

class TransitImpactCalculator:
    """
    Calculates the impact of transiting planets on the Natal Chart.
    Focuses on:
    1. House Placement (Transit Planet in Natal House)
    2. Aspects (Transit Planet aspecting Natal Planet)
    """

    ASPECT_ORBS = {
        'Conjunction': 8, # 0 deg
        'Opposition': 8,  # 180 deg
        'Trine': 8,       # 120 deg
        'Square': 6,      # 90 deg
        'Sextile': 4      # 60 deg
    }

    # Simple beneficial/malefic nature for scoring
    PLANET_NATURE = {
        'Sun': 'Neutral', 'Moon': 'Benefic', 'Mars': 'Malefic', 'Mercury': 'Benefic',
        'Jupiter': 'Benefic', 'Venus': 'Benefic', 'Saturn': 'Malefic', 'Rahu': 'Malefic', 'Ketu': 'Malefic'
    }

    @staticmethod
    def calculate_transit_impacts(
        transit_positions: Dict[str, float],
        natal_positions: Dict[str, float],
        ascendant_sign: int
    ) -> List[Dict[str, Any]]:
        """
        Calculate impacts of current transits.
        """
        impacts = []

        for t_planet, t_long in transit_positions.items():
            if t_planet in ['Ascendant', 'Ketu']: continue # Skip minor points for broad impact
            
            # 1. Calculate House Transit (Relative to Ascendant)
            # Sign based house system (Whole Sign)
            t_sign = int(t_long / 30)
            house_idx = (t_sign - ascendant_sign) % 12 + 1
            
            # 2. Check Aspects to Natal Planets
            for n_planet, n_long in natal_positions.items():
                if n_planet == 'Ascendant': continue
                
                angle = abs(t_long - n_long)
                if angle > 180: angle = 360 - angle
                
                aspect_name = TransitImpactCalculator._get_aspect_name(angle)
                
                if aspect_name:
                    impacts.append({
                        "transit_planet": t_planet,
                        "natal_planet": n_planet,
                        "angle": round(angle, 1),
                        "aspect": aspect_name,
                        "nature": TransitImpactCalculator._determine_impact_nature(t_planet, aspect_name),
                        "description": f"Transiting {t_planet} {aspect_name} Natal {n_planet}"
                    })
            
            # Add House Transit Info (Simplified as an 'impact' for now)
            # In a full system, this would be its own section, but here we treat it as an influence event.
            impacts.append({
                "transit_planet": t_planet,
                "house": house_idx,
                "type": "House Transit",
                "description": f"{t_planet} transiting {house_idx}{TransitImpactCalculator._get_ordinal(house_idx)} House"
            })

        return impacts

    @staticmethod
    def _get_aspect_name(angle: float) -> str:
        for aspect, orb in TransitImpactCalculator.ASPECT_ORBS.items():
            target = 0
            if aspect == 'Opposition': target = 180
            elif aspect == 'Trine': target = 120
            elif aspect == 'Square': target = 90
            elif aspect == 'Sextile': target = 60
            
            if abs(angle - target) <= orb:
                return aspect
        return ""

    @staticmethod
    def _determine_impact_nature(planet: str, aspect: str) -> str:
        is_malefic = TransitImpactCalculator.PLANET_NATURE.get(planet, 'Neutral') == 'Malefic'
        is_hard_aspect = aspect in ['Square', 'Opposition']
        
        if is_malefic and is_hard_aspect: return "Challenging"
        if not is_malefic and not is_hard_aspect: return "Favorable"
        return "Mixed"

    @staticmethod
    def _get_ordinal(n: int) -> str:
        if 11 <= (n % 100) <= 13: return 'th'
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}
        return suffix.get(n % 10, 'th')
