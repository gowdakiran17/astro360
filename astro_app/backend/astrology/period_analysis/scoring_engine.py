"""
Scoring Engine for Period Analysis
Pure mathematical scoring - NO AI
Combines multiple astrological factors with weighted scoring
"""
from typing import List, Dict, Any
from dataclasses import dataclass
from enum import Enum

class ScoreCategory(Enum):
    """Score component categories"""
    DASHA = "dasha"
    TRANSIT = "transit"
    MUHURTA = "muhurta"
    PANCHANG = "panchang"
    EVENT = "event"

@dataclass
class ScoreComponent:
    """Individual score component"""
    name: str
    value: float  # -100 to +100
    weight: float  # 0.0 to 1.0
    category: ScoreCategory
    description: str = ""

class ScoringEngine:
    """
    Pure mathematical scoring engine
    NO AI - only rule-based calculations
    """
    
    # Weight configuration (based on VedAstro priorities)
    WEIGHTS = {
        'dasha_lord': 0.30,  # 30% - Most important (current period ruler)
        'transit_score': 0.25,  # 25% - Current planetary positions
        'tarabala': 0.15,  # 15% - Nakshatra compatibility
        'chandrabala': 0.10,  # 10% - Moon strength
        'panchang': 0.10,  # 10% - Panchang quality
        'ghataka': 0.05,  # 5% - Obstruction penalty
        'muhurta_events': 0.05,  # 5% - Special events bonus
    }
    
    @staticmethod
    def calculate_day_score(
        dasha_score: float,
        transit_score: float,
        tarabala_score: float,
        chandrabala_score: float,
        panchang_score: float,
        ghataka_penalty: float,
        muhurta_bonus: float,
        events: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive day score
        
        Args:
            dasha_score: -100 to +100 (Dasha lord strength)
            transit_score: -100 to +100 (Transit effects)
            tarabala_score: -100 to +100 (Nakshatra compatibility)
            chandrabala_score: -100 to +100 (Moon strength)
            panchang_score: -100 to +100 (Panchang quality)
            ghataka_penalty: 0 to 100 (Penalty for obstructions)
            muhurta_bonus: 0 to 100 (Bonus for auspicious events)
            events: List of detected events
        
        Returns:
            Dict with score (0-100) and detailed breakdown
        """
        components = [
            ScoreComponent(
                'Dasha Lord',
                dasha_score,
                ScoringEngine.WEIGHTS['dasha_lord'],
                ScoreCategory.DASHA,
                'Current major/minor period ruler strength'
            ),
            ScoreComponent(
                'Transits',
                transit_score,
                ScoringEngine.WEIGHTS['transit_score'],
                ScoreCategory.TRANSIT,
                'Current planetary positions and aspects'
            ),
            ScoreComponent(
                'Tarabala',
                tarabala_score,
                ScoringEngine.WEIGHTS['tarabala'],
                ScoreCategory.MUHURTA,
                'Nakshatra compatibility from birth Moon'
            ),
            ScoreComponent(
                'Chandrabala',
                chandrabala_score,
                ScoringEngine.WEIGHTS['chandrabala'],
                ScoreCategory.MUHURTA,
                'Current Moon strength and position'
            ),
            ScoreComponent(
                'Panchang',
                panchang_score,
                ScoringEngine.WEIGHTS['panchang'],
                ScoreCategory.PANCHANG,
                'Tithi, Nakshatra, Yoga, Karana quality'
            ),
            ScoreComponent(
                'Ghataka',
                -ghataka_penalty,
                ScoringEngine.WEIGHTS['ghataka'],
                ScoreCategory.MUHURTA,
                'Penalty for Ghataka obstructions'
            ),
            ScoreComponent(
                'Muhurta Events',
                muhurta_bonus,
                ScoringEngine.WEIGHTS['muhurta_events'],
                ScoreCategory.EVENT,
                'Bonus for special auspicious events'
            ),
        ]
        
        # Calculate weighted sum
        weighted_sum = sum(c.value * c.weight for c in components)
        
        # Normalize to 0-100 scale
        # Input range: -100 to +100
        # Output range: 0 to 100
        normalized_score = max(0, min(100, (weighted_sum + 100) / 2))
        
        # Categorize score
        if normalized_score >= 80:
            quality = "Excellent"
        elif normalized_score >= 65:
            quality = "Good"
        elif normalized_score >= 50:
            quality = "Average"
        elif normalized_score >= 35:
            quality = "Below Average"
        else:
            quality = "Poor"

        # Generate rich narrative summary
        component_scores = {
            'dasha': dasha_score,
            'transits': transit_score,
            'tarabala': tarabala_score,
            'chandrabala': chandrabala_score,
            'panchang': panchang_score
        }
        recommendation = ScoringEngine._generate_narrative(normalized_score, quality, component_scores)

        
        # Calculate event impact
        event_impact = ScoringEngine._calculate_event_impact(events) if events else {}
        
        return {
            'score': round(normalized_score, 2),
            'quality': quality,
            'recommendation': recommendation,
            'components': [
                {
                    'name': c.name,
                    'value': c.value,
                    'weight': c.weight,
                    'weighted_value': round(c.value * c.weight, 2),
                    'category': c.category.value,
                    'description': c.description
                }
                for c in components
            ],
            'breakdown': {
                'dasha': dasha_score,
                'transits': transit_score,
                'tarabala': tarabala_score,
                'chandrabala': chandrabala_score,
                'panchang': panchang_score,
                'ghataka': -ghataka_penalty,
                'muhurta': muhurta_bonus
            },
            'event_impact': event_impact,
            'weighted_sum': round(weighted_sum, 2)
        }
    
    @staticmethod
    def _calculate_event_impact(events: List[Dict]) -> Dict[str, Any]:
        """Calculate cumulative impact of all detected events"""
        if not events:
            return {'total_impact': 0, 'auspicious_count': 0, 'inauspicious_count': 0}
        
        auspicious = [e for e in events if e.get('is_occurring') and e.get('category') == 'auspicious']
        inauspicious = [e for e in events if e.get('is_occurring') and e.get('category') == 'inauspicious']
        
        # Calculate total impact
        auspicious_impact = sum(e.get('strength', 0) for e in auspicious)
        inauspicious_impact = sum(e.get('strength', 0) for e in inauspicious)
        
        return {
            'total_impact': auspicious_impact - inauspicious_impact,
            'auspicious_count': len(auspicious),
            'inauspicious_count': len(inauspicious),
            'auspicious_events': [e.get('name') for e in auspicious],
            'inauspicious_events': [e.get('name') for e in inauspicious],
            'net_strength': round(auspicious_impact - inauspicious_impact, 2)
        }

    @staticmethod
    def _generate_narrative(score: float, quality: str, components: Dict[str, float]) -> str:
        """
        Generates a rich, AI-like narrative summary based on scores.
        """
        import random
        
        # 1. Opening Hook (General Energy)
        openers = {
            "Excellent": [
                "Today presents a rare alignment of cosmic forces in your favor.",
                "The stars are shining brightly on your endeavors today.",
                "You are surfing a high wave of positive energy right now.",
                "This is a day of exceptional potential and clarity."
            ],
            "Good": [
                "A solid and supportive day lies ahead.",
                "The cosmic weather is generally fair and productive.",
                "You have a green light for most of your planned activities.",
                "Energy flows smoothly today, allowing for steady progress."
            ],
            "Average": [
                "Today offers a mix of influences, requiring balance.",
                "Navigate this day with steady awareness; it is neither high nor low.",
                "A neutral day that reflects the effort you put into it.",
                "Cosmic currents are moderate—keep your hand steady on the wheel."
            ],
            "Below Average": [
                "You may face some headwinds today; patience is key.",
                "The cosmic energy is slightly resistant, suggesting a need for caution.",
                "Don't force outcomes today; flow around obstacles instead.",
                "A day to conserve energy and handle routine matters carefully."
            ],
            "Poor": [
                "The stars advise a strategic pause; avoid major risks today.",
                "Cosmic weather is turbulent—seek shelter in routine and reflection.",
                "Challenges may arise; meet them with patience rather than force.",
                "A low-energy day best suited for introspection and planning."
            ]
        }
        
        # 2. Specific Insights (Based on components)
        insights = []
        
        # Dasha (Long-term)
        if components.get('dasha', 0) > 50:
            insights.append("Your broader life period is providing a strong tailwind.")
        elif components.get('dasha', 0) < 0:
            insights.append("Underlying long-term trends may feel challenging, so stay grounded.")
            
        # Transit (Medium-term)
        if components.get('transits', 0) > 40:
            insights.append("Current planetary movements are opening doors for you.")
        elif components.get('transits', 0) < 0:
            insights.append("Planetary transits suggest potential delays, so plan for extra time.")

        # Tarabala (Relationships/Strength)
        if components.get('tarabala', 0) > 40:
            insights.append("Interactions with others will likely be fruitful and harmonious.")
        elif components.get('tarabala', 0) < 0:
            insights.append("Misunderstandings are possible; communicate with extra clarity.")

        # Panchang (Timing)
        if components.get('panchang', 0) > 40:
            insights.append("The timing is impeccable for starting new ventures.")
        elif components.get('panchang', 0) < 0:
            insights.append("It's better to finish existing tasks than to start new ones today.")
            
        # Chandrabala (Mind/Emotions)
        if components.get('chandrabala', 0) > 40:
            insights.append("Your mind is sharp and your emotional state is resilient.")
        elif components.get('chandrabala', 0) < 0:
            insights.append("You might feel emotionally sensitive; prioritize self-care.")

        # Select 2 distinct insights
        selected_insights = random.sample(insights, min(2, len(insights))) if insights else []
        
        # 3. Actionable Closing
        closers = {
            "Excellent": "Strike while the iron is hot!",
            "Good": "Move forward with confidence.",
            "Average": "Focus on your core priorities.",
            "Below Average": "Stick to what you know best today.",
            "Poor": "Rest is also a form of action."
        }
        
        # Assemble
        narrative = f"{random.choice(openers.get(quality, openers['Average']))} "
        if selected_insights:
            narrative += " ".join(selected_insights) + " "
        narrative += closers.get(quality, "")
        
        return narrative
    
    @staticmethod
    def calculate_dasha_score(
        dasha_lord: str,
        antardasha_lord: str,
        birth_chart: Dict
    ) -> float:
        """
        Calculate Dasha lord strength score
        
        Args:
            dasha_lord: Main period ruler
            antardasha_lord: Sub-period ruler
            birth_chart: Birth chart data
        
        Returns:
            Score from -100 to +100
        """
        # TODO: Implement based on:
        # 1. Dasha lord's natural benefic/malefic nature
        # 2. Dasha lord's house lordship (functional benefic/malefic)
        # 3. Dasha lord's strength in birth chart (Shadbala)
        # 4. Antardasha lord compatibility with Mahadasha lord
        # 5. Current transit position of Dasha lords
        
        # Placeholder implementation
        benefic_planets = ['Jupiter', 'Venus', 'Mercury', 'Moon']
        malefic_planets = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun']
        
        score = 0
        
        # Natural benefic/malefic
        if dasha_lord in benefic_planets:
            score += 40
        elif dasha_lord in malefic_planets:
            score -= 20
        
        if antardasha_lord in benefic_planets:
            score += 20
        elif antardasha_lord in malefic_planets:
            score -= 10
        
        return max(-100, min(100, score))
    
    @staticmethod
    def calculate_transit_score(
        current_positions: Dict[str, float],
        birth_moon_longitude: float
    ) -> float:
        """
        Calculate transit score based on current planetary positions
        
        Args:
            current_positions: Current planetary longitudes
            birth_moon_longitude: Natal Moon longitude
        
        Returns:
            Score from -100 to +100
        """
        from .core import AstroCalculate
        
        score = 0
        
        # Check benefic planets in Kendra/Trikona from Moon
        benefics = ['Jupiter', 'Venus', 'Mercury']
        for planet in benefics:
            if planet in current_positions:
                house = AstroCalculate.get_planet_house_from_longitude(
                    current_positions[planet],
                    birth_moon_longitude
                )
                if house in [1, 4, 7, 10]:  # Kendra
                    score += 15
                elif house in [5, 9]:  # Trikona (excluding 1st)
                    score += 10
        
        # Check malefic planets in Upachaya
        malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu']
        for planet in malefics:
            if planet in current_positions:
                house = AstroCalculate.get_planet_house_from_longitude(
                    current_positions[planet],
                    birth_moon_longitude
                )
                if house in [3, 6, 10, 11]:  # Upachaya
                    score += 10
                elif house in [1, 4, 7, 10]:  # Kendra (bad for malefics)
                    score -= 15
        
        return max(-100, min(100, score))
    
    @staticmethod
    def calculate_panchang_score(
        tithi_data: Dict,
        karana_data: Dict,
        nakshatra: int,
        yoga: int
    ) -> float:
        """
        Calculate Panchang quality score
        
        Args:
            tithi_data: Tithi information
            karana_data: Karana information
            nakshatra: Current nakshatra number
            yoga: Current yoga number
        
        Returns:
            Score from -100 to +100
        """
        from .panchang import is_tithi_auspicious, is_karana_auspicious
        
        score = 0
        
        # Tithi quality
        if is_tithi_auspicious(tithi_data.get('number', 0)):
            score += 30
        else:
            score -= 15
        
        # Karana quality
        if is_karana_auspicious(karana_data.get('name', '')):
            score += 20
        else:
            score -= 10
        
        # Nakshatra quality (simplified)
        # Auspicious nakshatras: Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, 
        # Hasta, Chitra, Swati, Anuradha, Shravana, Dhanishta, Shatabhisha, Revati
        auspicious_nakshatras = [1, 4, 5, 7, 8, 13, 14, 15, 17, 22, 23, 24, 27]
        if nakshatra in auspicious_nakshatras:
            score += 25
        
        # Yoga quality (simplified)
        # Very auspicious yogas: 2, 3, 4, 5, 7, 11, 12, 14, 15, 16, 20, 21, 22, 23, 24, 25, 26
        auspicious_yogas = [2, 3, 4, 5, 7, 11, 12, 14, 15, 16, 20, 21, 22, 23, 24, 25, 26]
        if yoga in auspicious_yogas:
            score += 25
        
        return max(-100, min(100, score))
