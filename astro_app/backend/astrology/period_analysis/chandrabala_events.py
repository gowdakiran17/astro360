"""
Chandrabala (Moon Strength) Event Calculators
Implements Moon-based strength and auspiciousness calculations
"""
from datetime import datetime
from typing import Dict
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate

@EventCalculator.register(EventName.MOON_IN_KENDRA)
def moon_in_kendra(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon in Kendra (1st, 4th, 7th, 10th) from natal Moon - Very strong"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_moon = positions['Moon']
    house = AstroCalculate.get_planet_house_from_longitude(current_moon, moon_longitude)
    
    is_kendra = house in [1, 4, 7, 10]
    
    return EventCalculatorResult(
        occurring=is_kendra,
        strength=85 if is_kendra else 0,
        description="Moon in Kendra - Very strong Chandrabala, excellent for all activities",
        category='auspicious'
    )

@EventCalculator.register(EventName.MOON_IN_TRIKONA)
def moon_in_trikona(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon in Trikona (1st, 5th, 9th) from natal Moon - Auspicious"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_moon = positions['Moon']
    house = AstroCalculate.get_planet_house_from_longitude(current_moon, moon_longitude)
    
    is_trikona = house in [1, 5, 9]
    
    return EventCalculatorResult(
        occurring=is_trikona,
        strength=80 if is_trikona else 0,
        description="Moon in Trikona - Auspicious Chandrabala, favorable for important activities",
        category='auspicious'
    )

@EventCalculator.register(EventName.MOON_IN_UPACHAYA)
def moon_in_upachaya(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon in Upachaya (3rd, 6th, 10th, 11th) from natal Moon - Growth"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_moon = positions['Moon']
    house = AstroCalculate.get_planet_house_from_longitude(current_moon, moon_longitude)
    
    is_upachaya = house in [3, 6, 10, 11]
    
    return EventCalculatorResult(
        occurring=is_upachaya,
        strength=70 if is_upachaya else 0,
        description="Moon in Upachaya - Growth and improvement, good for overcoming obstacles",
        category='auspicious'
    )

@EventCalculator.register(EventName.MOON_IN_DUSTHANA)
def moon_in_dusthana(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon in Dusthana (6th, 8th, 12th) from natal Moon - Challenging"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_moon = positions['Moon']
    house = AstroCalculate.get_planet_house_from_longitude(current_moon, moon_longitude)
    
    is_dusthana = house in [6, 8, 12]
    
    return EventCalculatorResult(
        occurring=is_dusthana,
        strength=75 if is_dusthana else 0,
        description="Moon in Dusthana - Challenging period, avoid important activities",
        category='inauspicious'
    )

@EventCalculator.register(EventName.MOON_WAXING)
def moon_waxing(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon is waxing (Shukla Paksha) - Increasing energy"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    # Calculate tithi to determine paksha
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    
    tithi_num = AstroCalculate.calculate_tithi(sun_long, moon_long)
    
    is_waxing = tithi_num <= 15  # Shukla Paksha (tithis 1-15)
    
    return EventCalculatorResult(
        occurring=is_waxing,
        strength=70 if is_waxing else 0,
        description="Waxing Moon (Shukla Paksha) - Increasing energy, good for growth activities",
        category='auspicious'
    )

@EventCalculator.register(EventName.MOON_WANING)
def moon_waning(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon is waning (Krishna Paksha) - Decreasing energy"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    
    tithi_num = AstroCalculate.calculate_tithi(sun_long, moon_long)
    
    is_waning = tithi_num > 15  # Krishna Paksha (tithis 16-30)
    
    return EventCalculatorResult(
        occurring=is_waning,
        strength=50 if is_waning else 0,
        description="Waning Moon (Krishna Paksha) - Decreasing energy, good for completion and letting go",
        category='mixed'
    )

@EventCalculator.register(EventName.MOON_BRIGHT)
def moon_bright(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon is bright (Tithis 5-12 of Shukla Paksha) - Maximum strength"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    
    tithi_num = AstroCalculate.calculate_tithi(sun_long, moon_long)
    
    is_bright = 5 <= tithi_num <= 12  # Brightest phase
    
    return EventCalculatorResult(
        occurring=is_bright,
        strength=85 if is_bright else 0,
        description="Bright Moon phase - Maximum lunar strength, very auspicious",
        category='auspicious'
    )

@EventCalculator.register(EventName.MOON_DARK)
def moon_dark(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon is dark (Tithis 28-30 and 1-2) - Weak"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    
    tithi_num = AstroCalculate.calculate_tithi(sun_long, moon_long)
    
    is_dark = tithi_num >= 28 or tithi_num <= 2  # Darkest phase
    
    return EventCalculatorResult(
        occurring=is_dark,
        strength=70 if is_dark else 0,
        description="Dark Moon phase - Weak lunar energy, avoid important activities",
        category='inauspicious'
    )

@EventCalculator.register(EventName.MOON_WITH_BENEFIC)
def moon_with_benefic(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon conjunct or aspected by benefic planets"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    moon_long = positions['Moon']
    benefics = ['Jupiter', 'Venus', 'Mercury']
    
    # Check for conjunction (within 10 degrees)
    conjunct_benefics = []
    for planet in benefics:
        planet_long = positions.get(planet, 0)
        diff = abs(moon_long - planet_long)
        if diff <= 10 or diff >= 350:  # Account for 360-degree wrap
            conjunct_benefics.append(planet)
    
    if conjunct_benefics:
        return EventCalculatorResult(
            occurring=True,
            strength=80,
            description=f"Moon with benefic planets: {', '.join(conjunct_benefics)} - Very auspicious",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.MOON_WITH_MALEFIC)
def moon_with_malefic(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Moon conjunct or aspected by malefic planets"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    moon_long = positions['Moon']
    malefics = ['Saturn', 'Mars', 'Sun']
    
    # Check for conjunction (within 10 degrees)
    conjunct_malefics = []
    for planet in malefics:
        planet_long = positions.get(planet, 0)
        diff = abs(moon_long - planet_long)
        if diff <= 10 or diff >= 350:
            conjunct_malefics.append(planet)
    
    if conjunct_malefics:
        return EventCalculatorResult(
            occurring=True,
            strength=70,
            description=f"Moon with malefic planets: {', '.join(conjunct_malefics)} - Challenging energy",
            category='inauspicious'
        )
    
    return EventCalculatorResult(occurring=False)
