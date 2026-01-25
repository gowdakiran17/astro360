"""
Travel and Special Activity Event Calculators
Implements travel yogas and activity-specific auspiciousness
"""
from datetime import datetime
from typing import Dict
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate

# Travel-favorable nakshatras
TRAVEL_FAVORABLE_NAKSHATRAS = [1, 3, 5, 7, 10, 13, 15, 17, 22, 27]  # Ashwini, Krittika, Mrigashira, Punarvasu, Magha, Hasta, Swati, Anuradha, Shravana, Revati
TRAVEL_UNFAVORABLE_NAKSHATRAS = [6, 9, 18, 19]  # Ardra, Ashlesha, Jyeshtha, Mula

@EventCalculator.register(EventName.TRAVEL_FAVORABLE)
def travel_favorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if day is favorable for travel"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    weekday = time.weekday()
    
    # Check nakshatra
    nakshatra_good = current_nakshatra in TRAVEL_FAVORABLE_NAKSHATRAS
    
    # Monday, Wednesday, Thursday, Friday are good for travel
    weekday_good = weekday in [0, 2, 3, 4]
    
    # Check if Moon is waxing
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    tithi = AstroCalculate.calculate_tithi(sun_long, moon_long)
    waxing = tithi <= 15
    
    score = 0
    if nakshatra_good:
        score += 40
    if weekday_good:
        score += 30
    if waxing:
        score += 30
    
    if score >= 60:
        return EventCalculatorResult(
            occurring=True,
            strength=score,
            description=f"Favorable for travel (Score: {score}/100) - Good nakshatra, weekday, and lunar phase",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.TRAVEL_UNFAVORABLE)
def travel_unfavorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if day is unfavorable for travel"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    weekday = time.weekday()
    
    # Check nakshatra
    nakshatra_bad = current_nakshatra in TRAVEL_UNFAVORABLE_NAKSHATRAS
    
    # Tuesday and Saturday are generally not good for travel
    weekday_bad = weekday in [1, 5]
    
    # Check if it's Amavasya (New Moon) or near it
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    tithi = AstroCalculate.calculate_tithi(sun_long, moon_long)
    near_new_moon = tithi >= 28 or tithi <= 2
    
    if nakshatra_bad or (weekday_bad and near_new_moon):
        return EventCalculatorResult(
            occurring=True,
            strength=70,
            description="Unfavorable for travel - Inauspicious nakshatra or bad timing",
            category='inauspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.MARRIAGE_FAVORABLE)
def marriage_favorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if day is favorable for marriage"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    
    # Marriage-favorable nakshatras (fixed and soft nakshatras)
    marriage_nakshatras = [4, 7, 11, 12, 13, 17, 20, 21, 22, 26, 27]  # Rohini, Punarvasu, Purva Phalguni, Uttara Phalguni, Hasta, Anuradha, Purva Ashadha, Uttara Ashadha, Shravana, Uttara Bhadrapada, Revati
    
    # Check if Venus is strong
    venus_long = positions.get('Venus', 0)
    venus_rashi = int(venus_long / 30) + 1
    venus_strong = venus_rashi in [2, 7]  # Taurus or Libra (Venus own signs)
    
    # Check if Jupiter aspects Moon (simplified - within 120 degrees)
    jupiter_long = positions.get('Jupiter', 0)
    moon_long = positions['Moon']
    jupiter_aspect = abs(jupiter_long - moon_long) in range(100, 140)
    
    is_favorable = current_nakshatra in marriage_nakshatras
    
    strength = 70
    if venus_strong:
        strength += 15
    if jupiter_aspect:
        strength += 15
    
    if is_favorable:
        return EventCalculatorResult(
            occurring=True,
            strength=min(100, strength),
            description=f"Favorable for marriage - Auspicious nakshatra and planetary support",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.BUSINESS_FAVORABLE)
def business_favorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if day is favorable for business/commerce"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    weekday = time.weekday()
    
    # Business-favorable nakshatras
    business_nakshatras = [1, 5, 7, 10, 13, 15, 17, 22]  # Ashwini, Mrigashira, Punarvasu, Magha, Hasta, Swati, Anuradha, Shravana
    
    # Wednesday and Friday are good for business
    weekday_good = weekday in [2, 4]
    
    # Check if Mercury is strong (business planet)
    mercury_long = positions.get('Mercury', 0)
    mercury_rashi = int(mercury_long / 30) + 1
    mercury_strong = mercury_rashi in [3, 6]  # Gemini or Virgo
    
    is_favorable = current_nakshatra in business_nakshatras
    
    strength = 65
    if weekday_good:
        strength += 15
    if mercury_strong:
        strength += 20
    
    if is_favorable:
        return EventCalculatorResult(
            occurring=True,
            strength=min(100, strength),
            description="Favorable for business - Good nakshatra and Mercury support",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.EDUCATION_FAVORABLE)
def education_favorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if day is favorable for education/learning"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    weekday = time.weekday()
    
    # Education-favorable nakshatras
    education_nakshatras = [5, 8, 13, 15, 22, 27]  # Mrigashira, Pushya, Hasta, Swati, Shravana, Revati
    
    # Wednesday and Thursday are good for education (Mercury and Jupiter days)
    weekday_good = weekday in [2, 3]
    
    # Check if Jupiter is strong (education planet)
    jupiter_long = positions.get('Jupiter', 0)
    jupiter_rashi = int(jupiter_long / 30) + 1
    jupiter_strong = jupiter_rashi in [9, 12]  # Sagittarius or Pisces
    
    is_favorable = current_nakshatra in education_nakshatras
    
    strength = 70
    if weekday_good:
        strength += 15
    if jupiter_strong:
        strength += 15
    
    if is_favorable:
        return EventCalculatorResult(
            occurring=True,
            strength=min(100, strength),
            description="Favorable for education - Auspicious nakshatra and Jupiter support",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.MEDICAL_FAVORABLE)
def medical_favorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if day is favorable for medical procedures/healing"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    
    # Medical/healing-favorable nakshatras
    medical_nakshatras = [1, 3, 8, 13, 24]  # Ashwini, Krittika, Pushya, Hasta, Shatabhisha
    
    # Check if Moon is waxing (better for healing)
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    tithi = AstroCalculate.calculate_tithi(sun_long, moon_long)
    waxing = tithi <= 15
    
    is_favorable = current_nakshatra in medical_nakshatras
    
    strength = 75
    if waxing:
        strength += 15
    
    if is_favorable:
        return EventCalculatorResult(
            occurring=True,
            strength=min(100, strength),
            description="Favorable for medical procedures - Healing nakshatras active",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.CONSTRUCTION_FAVORABLE)
def construction_favorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if day is favorable for construction/building"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    
    # Construction-favorable nakshatras (fixed nakshatras)
    construction_nakshatras = [4, 7, 12, 21, 26]  # Rohini, Punarvasu, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada
    
    # Check if Mars is strong (construction planet)
    mars_long = positions.get('Mars', 0)
    mars_rashi = int(mars_long / 30) + 1
    mars_strong = mars_rashi in [1, 8]  # Aries or Scorpio
    
    is_favorable = current_nakshatra in construction_nakshatras
    
    strength = 70
    if mars_strong:
        strength += 20
    
    if is_favorable:
        return EventCalculatorResult(
            occurring=True,
            strength=min(100, strength),
            description="Favorable for construction - Fixed nakshatras for permanent structures",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.AGRICULTURE_FAVORABLE)
def agriculture_favorable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if day is favorable for agriculture/planting"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    
    # Agriculture-favorable nakshatras
    agriculture_nakshatras = [2, 4, 7, 12, 20, 27]  # Bharani, Rohini, Punarvasu, Uttara Phalguni, Purva Ashadha, Revati
    
    # Check if Moon is waxing (better for planting)
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    tithi = AstroCalculate.calculate_tithi(sun_long, moon_long)
    waxing = tithi <= 15
    
    is_favorable = current_nakshatra in agriculture_nakshatras
    
    strength = 70
    if waxing:
        strength += 20
    
    if is_favorable:
        return EventCalculatorResult(
            occurring=True,
            strength=min(100, strength),
            description="Favorable for agriculture - Nourishing nakshatras and waxing Moon",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)
