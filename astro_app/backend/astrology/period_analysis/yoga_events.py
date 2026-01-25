"""
Yoga Event Calculators
Implements all 27 Yogas with proper calculations
"""
from datetime import datetime
from typing import Dict
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate

# All 27 Yogas with their qualities
YOGA_DEFINITIONS = {
    1: {"name": "Vishkumbha", "quality": "mixed", "strength": 40, "description": "Mixed results, moderate for general activities"},
    2: {"name": "Priti", "quality": "auspicious", "strength": 80, "description": "Love and affection, excellent for relationships"},
    3: {"name": "Ayushman", "quality": "auspicious", "strength": 85, "description": "Longevity and health, very favorable"},
    4: {"name": "Saubhagya", "quality": "auspicious", "strength": 90, "description": "Good fortune, highly auspicious"},
    5: {"name": "Sobhana", "quality": "auspicious", "strength": 75, "description": "Splendor and beauty, favorable"},
    6: {"name": "Atiganda", "quality": "inauspicious", "strength": 20, "description": "Obstacles and difficulties, avoid important work"},
    7: {"name": "Sukarma", "quality": "auspicious", "strength": 85, "description": "Good deeds, excellent for virtuous activities"},
    8: {"name": "Dhriti", "quality": "auspicious", "strength": 70, "description": "Steadiness and patience, good for stable activities"},
    9: {"name": "Sula", "quality": "inauspicious", "strength": 15, "description": "Pain and suffering, very inauspicious"},
    10: {"name": "Ganda", "quality": "inauspicious", "strength": 25, "description": "Obstacles, unfavorable"},
    11: {"name": "Vriddhi", "quality": "auspicious", "strength": 80, "description": "Growth and prosperity, very favorable"},
    12: {"name": "Dhruva", "quality": "auspicious", "strength": 85, "description": "Permanent and stable, excellent for lasting matters"},
    13: {"name": "Vyaghata", "quality": "inauspicious", "strength": 10, "description": "Calamity, most inauspicious"},
    14: {"name": "Harshana", "quality": "auspicious", "strength": 75, "description": "Joy and happiness, favorable"},
    15: {"name": "Vajra", "quality": "inauspicious", "strength": 20, "description": "Hard like diamond, unfavorable for soft matters"},
    16: {"name": "Siddhi", "quality": "auspicious", "strength": 95, "description": "Success and accomplishment, most auspicious"},
    17: {"name": "Vyatipata", "quality": "inauspicious", "strength": 10, "description": "Calamity, very inauspicious"},
    18: {"name": "Variyan", "quality": "auspicious", "strength": 70, "description": "Comfort and ease, favorable"},
    19: {"name": "Parigha", "quality": "inauspicious", "strength": 25, "description": "Obstruction, unfavorable"},
    20: {"name": "Shiva", "quality": "auspicious", "strength": 90, "description": "Auspicious, highly favorable"},
    21: {"name": "Siddha", "quality": "auspicious", "strength": 90, "description": "Accomplished, highly favorable"},
    22: {"name": "Sadhya", "quality": "auspicious", "strength": 80, "description": "Achievable, very favorable"},
    23: {"name": "Subha", "quality": "auspicious", "strength": 85, "description": "Auspicious, very favorable"},
    24: {"name": "Shukla", "quality": "auspicious", "strength": 75, "description": "Bright and pure, favorable"},
    25: {"name": "Brahma", "quality": "auspicious", "strength": 95, "description": "Divine, most auspicious"},
    26: {"name": "Indra", "quality": "auspicious", "strength": 90, "description": "Powerful, highly favorable"},
    27: {"name": "Vaidhriti", "quality": "inauspicious", "strength": 15, "description": "Obstruction, very inauspicious"}
}

# Register all 27 Yoga events dynamically
for yoga_num, yoga_info in YOGA_DEFINITIONS.items():
    # Create event name
    event_name_str = f"{yoga_info['name'].upper()}_YOGA"
    
    # Add to EventName enum if not exists
    if not hasattr(EventName, event_name_str):
        setattr(EventName, event_name_str, event_name_str.lower())
    
    # Create calculator function with closure
    def make_yoga_calculator(yoga_number, yoga_data):
        def yoga_calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
            """Calculate if specific Yoga is active"""
            # Get current planetary positions
            jd = AstroCalculate.get_julian_day(time)
            positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
            
            # Calculate current Yoga
            current_yoga = AstroCalculate.calculate_yoga(
                positions['Sun'], positions['Moon']
            )
            
            is_occurring = (current_yoga == yoga_number)
            
            return EventCalculatorResult(
                occurring=is_occurring,
                strength=yoga_data['strength'] if is_occurring else 0,
                description=yoga_data['description'],
                category=yoga_data['quality']
            )
        
        return yoga_calculator
    
    # Register the calculator
    calculator = make_yoga_calculator(yoga_num, yoga_info)
    EventCalculator.register(getattr(EventName, event_name_str))(calculator)

# General Yoga quality checkers
@EventCalculator.register(EventName.YOGA_AUSPICIOUS)
def yoga_auspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if current Yoga is auspicious"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_yoga = AstroCalculate.calculate_yoga(positions['Sun'], positions['Moon'])
    
    if current_yoga in YOGA_DEFINITIONS:
        yoga_info = YOGA_DEFINITIONS[current_yoga]
        
        if yoga_info['quality'] == 'auspicious':
            return EventCalculatorResult(
                occurring=True,
                strength=yoga_info['strength'],
                description=f"Auspicious Yoga: {yoga_info['name']} - {yoga_info['description']}",
                category='auspicious'
            )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.YOGA_INAUSPICIOUS)
def yoga_inauspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if current Yoga is inauspicious"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_yoga = AstroCalculate.calculate_yoga(positions['Sun'], positions['Moon'])
    
    if current_yoga in YOGA_DEFINITIONS:
        yoga_info = YOGA_DEFINITIONS[current_yoga]
        
        if yoga_info['quality'] == 'inauspicious':
            return EventCalculatorResult(
                occurring=True,
                strength=100 - yoga_info['strength'],  # Invert for penalty
                description=f"Inauspicious Yoga: {yoga_info['name']} - {yoga_info['description']}",
                category='inauspicious'
            )
    
    return EventCalculatorResult(occurring=False)

# Special highly auspicious Yogas (strength >= 90)
@EventCalculator.register(EventName.YOGA_HIGHLY_AUSPICIOUS)
def yoga_highly_auspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if current Yoga is highly auspicious (Siddhi, Brahma, Saubhagya, Shiva, Siddha, Indra)"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_yoga = AstroCalculate.calculate_yoga(positions['Sun'], positions['Moon'])
    
    highly_auspicious = [4, 16, 20, 21, 25, 26]  # Saubhagya, Siddhi, Shiva, Siddha, Brahma, Indra
    
    if current_yoga in highly_auspicious and current_yoga in YOGA_DEFINITIONS:
        yoga_info = YOGA_DEFINITIONS[current_yoga]
        return EventCalculatorResult(
            occurring=True,
            strength=yoga_info['strength'],
            description=f"Highly Auspicious Yoga: {yoga_info['name']} - Excellent for all important activities",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)
