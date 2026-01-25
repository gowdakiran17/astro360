"""
Planetary Strength Event Calculators
Implements planetary dignity and strength conditions
"""
from datetime import datetime
from typing import Dict, List
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate

# Planet definitions with dignities
PLANET_DIGNITIES = {
    'Sun': {
        'exaltation': 10,  # Aries (0-30 degrees)
        'debilitation': 190,  # Libra (180-210 degrees)
        'own_signs': [120, 130],  # Leo (120-150 degrees)
        'friendly_signs': [0, 60, 240],  # Aries, Gemini, Sagittarius
        'enemy_signs': [180, 210, 300]  # Libra, Scorpio, Aquarius
    },
    'Moon': {
        'exaltation': 30,  # Taurus (30-60 degrees)
        'debilitation': 210,  # Scorpio (210-240 degrees)
        'own_signs': [90, 100],  # Cancer (90-120 degrees)
        'friendly_signs': [30, 60, 240, 330],  # Taurus, Gemini, Sagittarius, Pisces
        'enemy_signs': [270, 300]  # Capricorn, Aquarius
    },
    'Mars': {
        'exaltation': 270,  # Capricorn (270-300 degrees)
        'debilitation': 90,  # Cancer (90-120 degrees)
        'own_signs': [0, 210],  # Aries, Scorpio
        'friendly_signs': [120, 240, 330],  # Leo, Sagittarius, Pisces
        'enemy_signs': [60, 180]  # Gemini, Libra
    },
    'Mercury': {
        'exaltation': 150,  # Virgo (150-180 degrees)
        'debilitation': 330,  # Pisces (330-360 degrees)
        'own_signs': [60, 150],  # Gemini, Virgo
        'friendly_signs': [30, 120, 180, 270, 300],  # Taurus, Leo, Libra, Capricorn, Aquarius
        'enemy_signs': [0, 90, 210, 240]  # Aries, Cancer, Scorpio, Sagittarius
    },
    'Jupiter': {
        'exaltation': 90,  # Cancer (90-120 degrees)
        'debilitation': 270,  # Capricorn (270-300 degrees)
        'own_signs': [240, 330],  # Sagittarius, Pisces
        'friendly_signs': [0, 120, 210],  # Aries, Leo, Scorpio
        'enemy_signs': [60, 150, 180, 270, 300]  # Gemini, Virgo, Libra, Capricorn, Aquarius
    },
    'Venus': {
        'exaltation': 330,  # Pisces (330-360 degrees)
        'debilitation': 150,  # Virgo (150-180 degrees)
        'own_signs': [30, 180],  # Taurus, Libra
        'friendly_signs': [60, 270, 300],  # Gemini, Capricorn, Aquarius
        'enemy_signs': [0, 120]  # Aries, Leo
    },
    'Saturn': {
        'exaltation': 180,  # Libra (180-210 degrees)
        'debilitation': 0,  # Aries (0-30 degrees)
        'own_signs': [270, 300],  # Capricorn, Aquarius
        'friendly_signs': [30, 60, 150],  # Taurus, Gemini, Virgo
        'enemy_signs': [90, 120, 210, 240]  # Cancer, Leo, Scorpio, Sagittarius
    }
}

PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

def get_rashi_from_longitude(longitude: float) -> int:
    """Get rashi (1-12) from longitude"""
    return int(longitude / 30) + 1

def is_in_sign_range(longitude: float, sign_start: int) -> bool:
    """Check if longitude is in sign range (sign_start to sign_start+30)"""
    rashi = get_rashi_from_longitude(longitude)
    expected_rashi = int(sign_start / 30) + 1
    return rashi == expected_rashi

# Generate events for each planet × condition
for planet in PLANETS:
    dignities = PLANET_DIGNITIES[planet]
    
    # 1. Exaltation event
    event_name_str = f"{planet.upper()}_EXALTED"
    if not hasattr(EventName, event_name_str):
        setattr(EventName, event_name_str, event_name_str.lower())
    
    def make_exaltation_calculator(planet_name, exalt_sign):
        def calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
            jd = AstroCalculate.get_julian_day(time)
            positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
            
            planet_long = positions.get(planet_name, 0)
            is_exalted = is_in_sign_range(planet_long, exalt_sign)
            
            return EventCalculatorResult(
                occurring=is_exalted,
                strength=95 if is_exalted else 0,
                description=f"{planet_name} is exalted - Maximum strength and auspiciousness",
                category='auspicious'
            )
        return calculator
    
    EventCalculator.register(getattr(EventName, event_name_str))(
        make_exaltation_calculator(planet, dignities['exaltation'])
    )
    
    # 2. Debilitation event
    event_name_str = f"{planet.upper()}_DEBILITATED"
    if not hasattr(EventName, event_name_str):
        setattr(EventName, event_name_str, event_name_str.lower())
    
    def make_debilitation_calculator(planet_name, debil_sign):
        def calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
            jd = AstroCalculate.get_julian_day(time)
            positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
            
            planet_long = positions.get(planet_name, 0)
            is_debilitated = is_in_sign_range(planet_long, debil_sign)
            
            return EventCalculatorResult(
                occurring=is_debilitated,
                strength=90 if is_debilitated else 0,
                description=f"{planet_name} is debilitated - Weakened, unfavorable",
                category='inauspicious'
            )
        return calculator
    
    EventCalculator.register(getattr(EventName, event_name_str))(
        make_debilitation_calculator(planet, dignities['debilitation'])
    )
    
    # 3. Own sign event
    event_name_str = f"{planet.upper()}_IN_OWN_SIGN"
    if not hasattr(EventName, event_name_str):
        setattr(EventName, event_name_str, event_name_str.lower())
    
    def make_own_sign_calculator(planet_name, own_signs):
        def calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
            jd = AstroCalculate.get_julian_day(time)
            positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
            
            planet_long = positions.get(planet_name, 0)
            is_in_own = any(is_in_sign_range(planet_long, sign) for sign in own_signs)
            
            return EventCalculatorResult(
                occurring=is_in_own,
                strength=85 if is_in_own else 0,
                description=f"{planet_name} in own sign - Strong and comfortable",
                category='auspicious'
            )
        return calculator
    
    EventCalculator.register(getattr(EventName, event_name_str))(
        make_own_sign_calculator(planet, dignities['own_signs'])
    )
    
    # 4. In Kendra event
    event_name_str = f"{planet.upper()}_IN_KENDRA"
    if not hasattr(EventName, event_name_str):
        setattr(EventName, event_name_str, event_name_str.lower())
    
    def make_kendra_calculator(planet_name):
        def calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
            jd = AstroCalculate.get_julian_day(time)
            positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
            
            planet_long = positions.get(planet_name, 0)
            # Calculate house from Moon (simplified)
            house = AstroCalculate.get_planet_house_from_longitude(planet_long, moon_longitude)
            is_kendra = house in [1, 4, 7, 10]
            
            return EventCalculatorResult(
                occurring=is_kendra,
                strength=75 if is_kendra else 0,
                description=f"{planet_name} in Kendra from Moon - Angular strength",
                category='auspicious'
            )
        return calculator
    
    EventCalculator.register(getattr(EventName, event_name_str))(
        make_kendra_calculator(planet)
    )
    
    # 5. Retrograde event
    event_name_str = f"{planet.upper()}_RETROGRADE"
    if not hasattr(EventName, event_name_str):
        setattr(EventName, event_name_str, event_name_str.lower())
    
    def make_retrograde_calculator(planet_name):
        def calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
            jd = AstroCalculate.get_julian_day(time)
            
            is_retro = AstroCalculate.is_planet_retrograde(planet_name, jd)
            
            # Retrograde is generally inauspicious except for Jupiter and Saturn (debatable)
            strength = 60 if is_retro else 0
            category = 'mixed' if planet_name in ['Jupiter', 'Saturn'] else 'inauspicious'
            
            return EventCalculatorResult(
                occurring=is_retro,
                strength=strength,
                description=f"{planet_name} is retrograde - Introspective energy, delays possible",
                category=category
            )
        return calculator
    
    EventCalculator.register(getattr(EventName, event_name_str))(
        make_retrograde_calculator(planet)
    )

# General planetary strength checkers
@EventCalculator.register(EventName.ANY_PLANET_EXALTED)
def any_planet_exalted(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if any planet is exalted"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    exalted_planets = []
    for planet in PLANETS:
        planet_long = positions.get(planet, 0)
        exalt_sign = PLANET_DIGNITIES[planet]['exaltation']
        if is_in_sign_range(planet_long, exalt_sign):
            exalted_planets.append(planet)
    
    if exalted_planets:
        return EventCalculatorResult(
            occurring=True,
            strength=90,
            description=f"Exalted planets: {', '.join(exalted_planets)} - Very auspicious",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.BENEFICS_STRONG)
def benefics_strong(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if benefic planets (Jupiter, Venus, Mercury, Moon) are strong"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon']
    strong_count = 0
    
    for planet in benefics:
        planet_long = positions.get(planet, 0)
        dignities = PLANET_DIGNITIES[planet]
        
        # Check if exalted or in own sign
        is_exalted = is_in_sign_range(planet_long, dignities['exaltation'])
        is_in_own = any(is_in_sign_range(planet_long, sign) for sign in dignities['own_signs'])
        
        if is_exalted or is_in_own:
            strong_count += 1
    
    if strong_count >= 2:
        return EventCalculatorResult(
            occurring=True,
            strength=80,
            description=f"{strong_count} benefic planets are strong - Very favorable period",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.MALEFICS_WEAK)
def malefics_weak(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if malefic planets (Saturn, Mars, Sun) are weak (good thing)"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    malefics = ['Saturn', 'Mars', 'Sun']
    weak_count = 0
    
    for planet in malefics:
        planet_long = positions.get(planet, 0)
        dignities = PLANET_DIGNITIES[planet]
        
        # Check if debilitated or in enemy sign
        is_debilitated = is_in_sign_range(planet_long, dignities['debilitation'])
        is_in_enemy = any(is_in_sign_range(planet_long, sign) for sign in dignities.get('enemy_signs', []))
        
        if is_debilitated or is_in_enemy:
            weak_count += 1
    
    if weak_count >= 2:
        return EventCalculatorResult(
            occurring=True,
            strength=70,
            description=f"{weak_count} malefic planets are weak - Reduced obstacles",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)
