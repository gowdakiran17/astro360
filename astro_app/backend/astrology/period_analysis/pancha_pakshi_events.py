"""
Pancha Pakshi Event Calculators
Implements the advanced 5-bird system from Tamil astrology
Each bird has 5 states (Ruling, Eating, Walking, Sleeping, Dying)
"""
from datetime import datetime
from typing import Dict, Tuple
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate

# Pancha Pakshi bird assignments based on birth nakshatra
# 5 birds: Vulture, Owl, Crow, Cock, Peacock
BIRD_ASSIGNMENTS = {
    # Male births
    'male': {
        1: 'Vulture', 2: 'Owl', 3: 'Crow', 4: 'Cock', 5: 'Peacock',
        6: 'Vulture', 7: 'Owl', 8: 'Crow', 9: 'Cock', 10: 'Peacock',
        11: 'Vulture', 12: 'Owl', 13: 'Crow', 14: 'Cock', 15: 'Peacock',
        16: 'Vulture', 17: 'Owl', 18: 'Crow', 19: 'Cock', 20: 'Peacock',
        21: 'Vulture', 22: 'Owl', 23: 'Crow', 24: 'Cock', 25: 'Peacock',
        26: 'Vulture', 27: 'Owl'
    },
    # Female births
    'female': {
        1: 'Peacock', 2: 'Cock', 3: 'Crow', 4: 'Owl', 5: 'Vulture',
        6: 'Peacock', 7: 'Cock', 8: 'Crow', 9: 'Owl', 10: 'Vulture',
        11: 'Peacock', 12: 'Cock', 13: 'Crow', 14: 'Owl', 15: 'Vulture',
        16: 'Peacock', 17: 'Cock', 18: 'Crow', 19: 'Owl', 20: 'Vulture',
        21: 'Peacock', 22: 'Cock', 23: 'Crow', 24: 'Owl', 25: 'Vulture',
        26: 'Peacock', 27: 'Cock'
    }
}

# Bird state sequence for day and night
DAY_SEQUENCE = ['Ruling', 'Eating', 'Walking', 'Sleeping', 'Dying']
NIGHT_SEQUENCE = ['Eating', 'Sleeping', 'Walking', 'Ruling', 'Dying']

# Bird rotation order
BIRD_ORDER = ['Vulture', 'Owl', 'Crow', 'Cock', 'Peacock']

# State qualities and strengths
STATE_QUALITIES = {
    'Ruling': {'strength': 95, 'category': 'auspicious', 'description': 'Peak power and success'},
    'Eating': {'strength': 75, 'category': 'auspicious', 'description': 'Gains and nourishment'},
    'Walking': {'strength': 50, 'category': 'mixed', 'description': 'Movement and moderate activity'},
    'Sleeping': {'strength': 30, 'category': 'inauspicious', 'description': 'Rest, avoid important work'},
    'Dying': {'strength': 10, 'category': 'inauspicious', 'description': 'Most inauspicious, avoid all activities'}
}

def get_birth_bird(birth_nakshatra: int, gender: str) -> str:
    """Get the birth bird based on nakshatra and gender"""
    gender_key = 'male' if gender.lower() in ['male', 'm'] else 'female'
    return BIRD_ASSIGNMENTS[gender_key].get(birth_nakshatra, 'Vulture')

def calculate_pancha_pakshi_state(
    time: datetime,
    birth_nakshatra: int,
    gender: str
) -> Tuple[str, str, int]:
    """
    Calculate current Pancha Pakshi bird and state
    
    Returns:
        Tuple of (bird_name, state, strength)
    """
    # Get birth bird
    birth_bird = get_birth_bird(birth_nakshatra, gender)
    
    # Determine if day or night (simplified: 6 AM - 6 PM is day)
    hour = time.hour
    is_day = 6 <= hour < 18
    
    # Calculate which 2.4-hour period we're in (12 hours / 5 periods)
    if is_day:
        period_start = 6
        sequence = DAY_SEQUENCE
    else:
        period_start = 18 if hour >= 18 else -6  # Night starts at 6 PM or continues from midnight
        sequence = NIGHT_SEQUENCE
    
    # Calculate period (0-4)
    hours_since_start = (hour - period_start) % 12
    period = int(hours_since_start / 2.4)  # Each period is 2.4 hours
    period = min(period, 4)  # Ensure we don't exceed 4
    
    # Determine which bird is active in this period
    birth_bird_index = BIRD_ORDER.index(birth_bird)
    active_bird_index = (birth_bird_index + period) % 5
    active_bird = BIRD_ORDER[active_bird_index]
    
    # Get the state for this bird
    state = sequence[period]
    strength = STATE_QUALITIES[state]['strength']
    
    return active_bird, state, strength

# Register Pancha Pakshi state events
for bird in BIRD_ORDER:
    for state in ['Ruling', 'Eating', 'Walking', 'Sleeping', 'Dying']:
        event_name_str = f"PANCHA_PAKSHI_{bird.upper()}_{state.upper()}"
        
        if not hasattr(EventName, event_name_str):
            setattr(EventName, event_name_str, event_name_str.lower())
        
        def make_pancha_pakshi_calculator(bird_name, state_name):
            def calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
                """Check if specific bird is in specific state"""
                # Get birth nakshatra and gender
                birth_nakshatra = AstroCalculate.get_nakshatra(moon_longitude)
                gender = birth_details.get('gender', 'male')
                
                # Calculate current state
                active_bird, active_state, strength = calculate_pancha_pakshi_state(
                    time, birth_nakshatra, gender
                )
                
                # Check if this bird-state combination is active
                is_active = (active_bird == bird_name and active_state == state_name)
                
                if is_active:
                    state_info = STATE_QUALITIES[state_name]
                    return EventCalculatorResult(
                        occurring=True,
                        strength=state_info['strength'],
                        description=f"{bird_name} in {state_name} state - {state_info['description']}",
                        category=state_info['category']
                    )
                
                return EventCalculatorResult(occurring=False)
            
            return calculator
        
        EventCalculator.register(getattr(EventName, event_name_str))(
            make_pancha_pakshi_calculator(bird, state)
        )

# General Pancha Pakshi checkers
@EventCalculator.register(EventName.PANCHA_PAKSHI_RULING)
def pancha_pakshi_ruling(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if any bird is in Ruling state (most auspicious)"""
    birth_nakshatra = AstroCalculate.get_nakshatra(moon_longitude)
    gender = birth_details.get('gender', 'male')
    
    active_bird, active_state, strength = calculate_pancha_pakshi_state(
        time, birth_nakshatra, gender
    )
    
    if active_state == 'Ruling':
        return EventCalculatorResult(
            occurring=True,
            strength=95,
            description=f"{active_bird} in Ruling state - Peak power, excellent for all activities",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.PANCHA_PAKSHI_EATING)
def pancha_pakshi_eating(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if any bird is in Eating state (auspicious)"""
    birth_nakshatra = AstroCalculate.get_nakshatra(moon_longitude)
    gender = birth_details.get('gender', 'male')
    
    active_bird, active_state, strength = calculate_pancha_pakshi_state(
        time, birth_nakshatra, gender
    )
    
    if active_state == 'Eating':
        return EventCalculatorResult(
            occurring=True,
            strength=75,
            description=f"{active_bird} in Eating state - Gains and nourishment, favorable",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.PANCHA_PAKSHI_DYING)
def pancha_pakshi_dying(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if any bird is in Dying state (most inauspicious)"""
    birth_nakshatra = AstroCalculate.get_nakshatra(moon_longitude)
    gender = birth_details.get('gender', 'male')
    
    active_bird, active_state, strength = calculate_pancha_pakshi_state(
        time, birth_nakshatra, gender
    )
    
    if active_state == 'Dying':
        return EventCalculatorResult(
            occurring=True,
            strength=90,  # High penalty
            description=f"{active_bird} in Dying state - Most inauspicious, avoid all activities",
            category='inauspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.PANCHA_PAKSHI_FAVORABLE)
def pancha_pakshi_favorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if Pancha Pakshi state is favorable (Ruling or Eating)"""
    birth_nakshatra = AstroCalculate.get_nakshatra(moon_longitude)
    gender = birth_details.get('gender', 'male')
    
    active_bird, active_state, strength = calculate_pancha_pakshi_state(
        time, birth_nakshatra, gender
    )
    
    if active_state in ['Ruling', 'Eating']:
        return EventCalculatorResult(
            occurring=True,
            strength=strength,
            description=f"{active_bird} in {active_state} state - Favorable Pancha Pakshi period",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.PANCHA_PAKSHI_UNFAVORABLE)
def pancha_pakshi_unfavorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if Pancha Pakshi state is unfavorable (Sleeping or Dying)"""
    birth_nakshatra = AstroCalculate.get_nakshatra(moon_longitude)
    gender = birth_details.get('gender', 'male')
    
    active_bird, active_state, strength = calculate_pancha_pakshi_state(
        time, birth_nakshatra, gender
    )
    
    if active_state in ['Sleeping', 'Dying']:
        return EventCalculatorResult(
            occurring=True,
            strength=100 - strength,  # Invert for penalty
            description=f"{active_bird} in {active_state} state - Unfavorable Pancha Pakshi period",
            category='inauspicious'
        )
    
    return EventCalculatorResult(occurring=False)
