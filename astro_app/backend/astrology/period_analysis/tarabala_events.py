"""
Extended Event Calculators - Tarabala System
Implements all 9 Taras with proper calculations
"""
from datetime import datetime
from typing import Dict
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate

# Tara definitions based on VedAstro
TARA_DEFINITIONS = {
    1: {
        "name": "Janma",
        "category": "neutral",
        "strength": 50,
        "description": "Birth star - Neutral effects, proceed with awareness"
    },
    2: {
        "name": "Sampat",
        "category": "auspicious",
        "strength": 80,
        "description": "Wealth star - Very favorable for financial matters and prosperity"
    },
    3: {
        "name": "Vipat",
        "category": "inauspicious",
        "strength": 20,
        "description": "Danger star - Avoid important activities, high risk period"
    },
    4: {
        "name": "Kshema",
        "category": "auspicious",
        "strength": 70,
        "description": "Well-being star - Good for health and general welfare"
    },
    5: {
        "name": "Pratyak",
        "category": "inauspicious",
        "strength": 30,
        "description": "Obstacle star - Expect challenges and delays"
    },
    6: {
        "name": "Sadhaka",
        "category": "auspicious",
        "strength": 85,
        "description": "Achievement star - Excellent for accomplishing goals"
    },
    7: {
        "name": "Vadha",
        "category": "inauspicious",
        "strength": 10,
        "description": "Destruction star - Most inauspicious, avoid all important activities"
    },
    8: {
        "name": "Mitra",
        "category": "auspicious",
        "strength": 75,
        "description": "Friend star - Favorable for relationships and partnerships"
    },
    9: {
        "name": "Parama Mitra",
        "category": "auspicious",
        "strength": 90,
        "description": "Best friend star - Most auspicious, ideal for all activities"
    }
}

def calculate_tara(current_nakshatra: int, birth_nakshatra: int) -> int:
    """
    Calculate Tara (1-9) from current and birth nakshatras
    
    Args:
        current_nakshatra: Current Moon's nakshatra (1-27)
        birth_nakshatra: Birth Moon's nakshatra (1-27)
    
    Returns:
        Tara number (1-9)
    """
    # Count from birth nakshatra
    count = (current_nakshatra - birth_nakshatra) % 27
    
    # Map to 9 Taras (repeating pattern)
    tara = (count % 9) + 1
    
    return tara

# Register all 9 Tara events dynamically
for tara_num, tara_info in TARA_DEFINITIONS.items():
    # Create event name based on the enum
    tara_name_upper = tara_info['name'].upper()
    if tara_name_upper == "BEST FRIEND_TARA":
        event_name_str = "PARAMA_MITRA_TARA"
    else:
        # Tara names like 'Janma' -> 'JANMA_TARA'
        event_name_str = f"{tara_info['name'].upper().replace(' ', '_')}_TARA"
    
    # Get the enum member
    try:
        event_enum = getattr(EventName, event_name_str)
    except AttributeError:
        # Fallback if not in enum (shouldn't happen now)
        event_enum = tara_info['name'].lower()
    
    # Create calculator function with closure
    def make_tara_calculator(tara_number, tara_data):
        def tara_calculator(time: datetime, birth_details: Dict, birth_moon_longitude: float) -> EventCalculatorResult:
            """Calculate if specific Tara is active"""
            # Get current Moon position
            jd = AstroCalculate.get_julian_day(time)
            positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
            
            current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
            birth_nakshatra = AstroCalculate.get_nakshatra(birth_moon_longitude)
            
            # Calculate current Tara
            current_tara = calculate_tara(current_nakshatra, birth_nakshatra)
            
            is_occurring = (current_tara == tara_number)
            
            return EventCalculatorResult(
                occurring=is_occurring,
                strength=tara_data['strength'] if is_occurring else 0,
                description=tara_data['description'],
                category=tara_data['category']
            )
        
        return tara_calculator
    
    # Register the calculator
    calculator = make_tara_calculator(tara_num, tara_info)
    EventCalculator.register(event_enum)(calculator)

# Also create a general Tarabala quality checker
@EventCalculator.register(EventName.TARABALA_FAVORABLE)
def tarabala_favorable(time: datetime, birth_details: Dict, birth_moon_longitude: float) -> EventCalculatorResult:
    """Check if current Tarabala is favorable (Taras 2, 4, 6, 8, 9)"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    birth_nakshatra = AstroCalculate.get_nakshatra(birth_moon_longitude)
    
    current_tara = calculate_tara(current_nakshatra, birth_nakshatra)
    
    favorable_taras = [2, 4, 6, 8, 9]  # Sampat, Kshema, Sadhaka, Mitra, Parama Mitra
    is_favorable = current_tara in favorable_taras
    
    if is_favorable:
        tara_info = TARA_DEFINITIONS[current_tara]
        return EventCalculatorResult(
            occurring=True,
            strength=tara_info['strength'],
            description=f"Favorable Tarabala: {tara_info['name']} - {tara_info['description']}",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.TARABALA_UNFAVORABLE)
def tarabala_unfavorable(time: datetime, birth_details: Dict, birth_moon_longitude: float) -> EventCalculatorResult:
    """Check if current Tarabala is unfavorable (Taras 3, 5, 7)"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    birth_nakshatra = AstroCalculate.get_nakshatra(birth_moon_longitude)
    
    current_tara = calculate_tara(current_nakshatra, birth_nakshatra)
    
    unfavorable_taras = [3, 5, 7]  # Vipat, Pratyak, Vadha
    is_unfavorable = current_tara in unfavorable_taras
    
    if is_unfavorable:
        tara_info = TARA_DEFINITIONS[current_tara]
        return EventCalculatorResult(
            occurring=True,
            strength=100 - tara_info['strength'],  # Invert for penalty
            description=f"Unfavorable Tarabala: {tara_info['name']} - {tara_info['description']}",
            category='inauspicious'
        )
    
    return EventCalculatorResult(occurring=False)
