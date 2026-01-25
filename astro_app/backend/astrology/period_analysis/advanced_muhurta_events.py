"""
Additional Muhurta Refinements
Implements 31 additional granular muhurta calculations
"""
from datetime import datetime, timedelta
from typing import Dict
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate
import swisseph as swe

# Hora lords (planetary hours)
HORA_LORDS = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars']
WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

def get_hora_lord(time: datetime, lat: float, lon: float) -> str:
    """Calculate the ruling planet for current hora"""
    jd = AstroCalculate.get_julian_day(time)
    
    # Get sunrise
    sunrise_jd = swe.rise_trans(
        jd, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0
    )[1][0]
    
    # Calculate hours since sunrise
    hours_since_sunrise = (jd - sunrise_jd) * 24
    
    # Get weekday lord
    weekday = time.weekday()
    weekday_lord_index = weekday
    
    # Calculate hora (each hora is 1 hour)
    hora_number = int(hours_since_sunrise) % 24
    
    # Hora lord rotates through the 7 planets starting with weekday lord
    hora_lord_index = (weekday_lord_index + hora_number) % 7
    
    return HORA_LORDS[hora_lord_index]

# Register Hora events for each planet
for planet in HORA_LORDS:
    event_name_str = f"{planet.upper()}_HORA"
    
    if not hasattr(EventName, event_name_str):
        setattr(EventName, event_name_str, event_name_str.lower())
    
    def make_hora_calculator(planet_name):
        def calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
            """Check if specific planet's hora is active"""
            lat = birth_details.get('latitude', 0)
            lon = birth_details.get('longitude', 0)
            
            current_hora_lord = get_hora_lord(time, lat, lon)
            
            is_active = (current_hora_lord == planet_name)
            
            # Benefic planets have higher strength
            benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon']
            strength = 80 if planet_name in benefics else 60
            category = 'auspicious' if planet_name in benefics else 'mixed'
            
            if is_active:
                return EventCalculatorResult(
                    occurring=True,
                    strength=strength,
                    description=f"{planet_name} Hora active - Favorable for {planet_name}-related activities",
                    category=category
                )
            
            return EventCalculatorResult(occurring=False)
        
        return calculator
    
    EventCalculator.register(getattr(EventName, event_name_str))(
        make_hora_calculator(planet)
    )

# Specific Muhurta combinations
@EventCalculator.register(EventName.VIJAYA_MUHURTA)
def vijaya_muhurta(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Vijaya Muhurta - Victory time (15th muhurta of day)"""
    lat = birth_details.get('latitude', 0)
    lon = birth_details.get('longitude', 0)
    
    jd = AstroCalculate.get_julian_day(time)
    sunrise_jd = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    sunset_jd = swe.rise_trans(jd, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    
    day_duration = (sunset_jd - sunrise_jd) * 24
    muhurta_duration = day_duration / 15
    
    # 15th muhurta (last muhurta of day)
    vijaya_start = sunrise_jd + (14 * muhurta_duration / 24)
    vijaya_end = sunset_jd
    
    is_vijaya = vijaya_start <= jd <= vijaya_end
    
    return EventCalculatorResult(
        occurring=is_vijaya,
        strength=85 if is_vijaya else 0,
        description="Vijaya Muhurta - Victory time, excellent for competitive activities",
        category='auspicious'
    )

@EventCalculator.register(EventName.NISHITA_MUHURTA)
def nishita_muhurta(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Nishita Muhurta - Midnight muhurta, powerful for spiritual practices"""
    lat = birth_details.get('latitude', 0)
    lon = birth_details.get('longitude', 0)
    
    jd = AstroCalculate.get_julian_day(time)
    
    # Get sunset and next sunrise
    sunset_jd = swe.rise_trans(jd, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    next_sunrise_jd = swe.rise_trans(jd + 1, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    
    night_duration = (next_sunrise_jd - sunset_jd) * 24
    muhurta_duration = night_duration / 15
    
    # 8th muhurta of night (middle of night)
    nishita_start = sunset_jd + (7 * muhurta_duration / 24)
    nishita_end = sunset_jd + (8 * muhurta_duration / 24)
    
    is_nishita = nishita_start <= jd <= nishita_end
    
    return EventCalculatorResult(
        occurring=is_nishita,
        strength=90 if is_nishita else 0,
        description="Nishita Muhurta - Midnight power, excellent for spiritual practices",
        category='auspicious'
    )

@EventCalculator.register(EventName.GODHULI_MUHURTA)
def godhuli_muhurta(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Godhuli Muhurta - Twilight time (dust of cow's hooves)"""
    lat = birth_details.get('latitude', 0)
    lon = birth_details.get('longitude', 0)
    
    jd = AstroCalculate.get_julian_day(time)
    sunset_jd = swe.rise_trans(jd, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    
    # Godhuli is approximately 24 minutes after sunset
    godhuli_start = sunset_jd
    godhuli_end = sunset_jd + (24 / (24 * 60))  # 24 minutes in JD
    
    is_godhuli = godhuli_start <= jd <= godhuli_end
    
    return EventCalculatorResult(
        occurring=is_godhuli,
        strength=80 if is_godhuli else 0,
        description="Godhuli Muhurta - Twilight time, good for spiritual activities",
        category='auspicious'
    )

@EventCalculator.register(EventName.PRATAH_SANDHYA)
def pratah_sandhya(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Pratah Sandhya - Morning twilight"""
    lat = birth_details.get('latitude', 0)
    lon = birth_details.get('longitude', 0)
    
    jd = AstroCalculate.get_julian_day(time)
    sunrise_jd = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    
    # 24 minutes before to 24 minutes after sunrise
    sandhya_start = sunrise_jd - (24 / (24 * 60))
    sandhya_end = sunrise_jd + (24 / (24 * 60))
    
    is_sandhya = sandhya_start <= jd <= sandhya_end
    
    return EventCalculatorResult(
        occurring=is_sandhya,
        strength=85 if is_sandhya else 0,
        description="Pratah Sandhya - Morning twilight, excellent for meditation and prayers",
        category='auspicious'
    )

@EventCalculator.register(EventName.SAYAM_SANDHYA)
def sayam_sandhya(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Sayam Sandhya - Evening twilight"""
    lat = birth_details.get('latitude', 0)
    lon = birth_details.get('longitude', 0)
    
    jd = AstroCalculate.get_julian_day(time)
    sunset_jd = swe.rise_trans(jd, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    
    # 24 minutes before to 24 minutes after sunset
    sandhya_start = sunset_jd - (24 / (24 * 60))
    sandhya_end = sunset_jd + (24 / (24 * 60))
    
    is_sandhya = sandhya_start <= jd <= sandhya_end
    
    return EventCalculatorResult(
        occurring=is_sandhya,
        strength=85 if is_sandhya else 0,
        description="Sayam Sandhya - Evening twilight, excellent for meditation and prayers",
        category='auspicious'
    )

# Weekday-specific auspicious times
@EventCalculator.register(EventName.MONDAY_AUSPICIOUS)
def monday_auspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Monday auspicious periods"""
    if time.weekday() != 0:  # Monday
        return EventCalculatorResult(occurring=False)
    
    # Monday is ruled by Moon - good for emotional matters, home, family
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    # Check if Moon is strong
    moon_long = positions['Moon']
    moon_rashi = int(moon_long / 30) + 1
    moon_strong = moon_rashi == 4  # Moon in Cancer (own sign)
    
    strength = 70
    if moon_strong:
        strength = 85
    
    return EventCalculatorResult(
        occurring=True,
        strength=strength,
        description="Monday - Favorable for emotional matters, home, family, and Moon-related activities",
        category='auspicious'
    )

@EventCalculator.register(EventName.WEDNESDAY_AUSPICIOUS)
def wednesday_auspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Wednesday auspicious periods"""
    if time.weekday() != 2:  # Wednesday
        return EventCalculatorResult(occurring=False)
    
    # Wednesday is ruled by Mercury - good for communication, business, education
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    mercury_long = positions.get('Mercury', 0)
    mercury_rashi = int(mercury_long / 30) + 1
    mercury_strong = mercury_rashi in [3, 6]  # Mercury in Gemini or Virgo
    
    strength = 75
    if mercury_strong:
        strength = 90
    
    return EventCalculatorResult(
        occurring=True,
        strength=strength,
        description="Wednesday - Favorable for communication, business, education, and Mercury activities",
        category='auspicious'
    )

@EventCalculator.register(EventName.THURSDAY_AUSPICIOUS)
def thursday_auspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Thursday auspicious periods"""
    if time.weekday() != 3:  # Thursday
        return EventCalculatorResult(occurring=False)
    
    # Thursday is ruled by Jupiter - best day for education, spirituality, growth
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    jupiter_long = positions.get('Jupiter', 0)
    jupiter_rashi = int(jupiter_long / 30) + 1
    jupiter_strong = jupiter_rashi in [9, 12]  # Jupiter in Sagittarius or Pisces
    
    strength = 85
    if jupiter_strong:
        strength = 95
    
    return EventCalculatorResult(
        occurring=True,
        strength=strength,
        description="Thursday - Most favorable for education, spirituality, growth, and Jupiter activities",
        category='auspicious'
    )

@EventCalculator.register(EventName.FRIDAY_AUSPICIOUS)
def friday_auspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Friday auspicious periods"""
    if time.weekday() != 4:  # Friday
        return EventCalculatorResult(occurring=False)
    
    # Friday is ruled by Venus - good for arts, beauty, relationships
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    venus_long = positions.get('Venus', 0)
    venus_rashi = int(venus_long / 30) + 1
    venus_strong = venus_rashi in [2, 7]  # Venus in Taurus or Libra
    
    strength = 80
    if venus_strong:
        strength = 90
    
    return EventCalculatorResult(
        occurring=True,
        strength=strength,
        description="Friday - Favorable for arts, beauty, relationships, and Venus activities",
        category='auspicious'
    )

# Specific muhurta combinations with nakshatras
@EventCalculator.register(EventName.AMRIT_SIDDHI_YOGA)
def amrit_siddhi_yoga(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Amrit Siddhi Yoga - Nectar of success combination"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    weekday = time.weekday()
    
    # Specific weekday-nakshatra combinations for Amrit Siddhi
    amrit_siddhi_combinations = {
        0: [1, 3, 6, 8, 13, 22],  # Monday
        1: [2, 7, 11, 15, 20],     # Tuesday
        2: [5, 10, 13, 17, 24],    # Wednesday
        3: [1, 6, 10, 15, 22],     # Thursday
        4: [2, 7, 12, 17, 27],     # Friday
        5: [3, 8, 13, 20, 26],     # Saturday
        6: [1, 7, 13, 22, 27]      # Sunday
    }
    
    favorable_nakshatras = amrit_siddhi_combinations.get(weekday, [])
    is_amrit_siddhi = current_nakshatra in favorable_nakshatras
    
    if is_amrit_siddhi:
        return EventCalculatorResult(
            occurring=True,
            strength=92,
            description="Amrit Siddhi Yoga - Nectar of success, highly auspicious for all activities",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.SARVARTHA_SIDDHI_YOGA)
def sarvartha_siddhi_yoga_extended(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Extended Sarvartha Siddhi Yoga calculation"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    weekday = time.weekday()
    
    # Extended combinations
    extended_combinations = {
        0: [3, 7, 8, 13, 22, 27],
        1: [2, 7, 11, 13, 15, 22],
        2: [5, 10, 11, 13, 15, 17, 24],
        3: [1, 6, 10, 13, 15, 22],
        4: [2, 7, 12, 17, 22, 27],
        5: [3, 8, 13, 20, 22, 26],
        6: [1, 3, 7, 13, 22, 27]
    }
    
    favorable = extended_combinations.get(weekday, [])
    is_favorable = current_nakshatra in favorable
    
    if is_favorable:
        return EventCalculatorResult(
            occurring=True,
            strength=88,
            description="Sarvartha Siddhi Yoga (Extended) - All-purpose success",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

# Additional specific time periods
@EventCalculator.register(EventName.MARANA_KARAK_MUHURTA)
def marana_karak_muhurta(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Marana Karak Muhurta - Death-inflicting time (avoid)"""
    lat = birth_details.get('latitude', 0)
    lon = birth_details.get('longitude', 0)
    
    jd = AstroCalculate.get_julian_day(time)
    sunrise_jd = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    sunset_jd = swe.rise_trans(jd, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, 0)[1][0]
    
    day_duration = (sunset_jd - sunrise_jd) * 24
    muhurta_duration = day_duration / 15
    
    weekday = time.weekday()
    
    # Marana karak muhurtas for each weekday
    marana_muhurtas = {
        0: [4, 9],   # Monday
        1: [3, 8],   # Tuesday
        2: [2, 7],   # Wednesday
        3: [1, 6],   # Thursday
        4: [5, 10],  # Friday
        5: [11, 14], # Saturday
        6: [12, 13]  # Sunday
    }
    
    bad_muhurtas = marana_muhurtas.get(weekday, [])
    
    # Check if current time falls in any marana muhurta
    is_marana = False
    for muhurta_num in bad_muhurtas:
        muhurta_start = sunrise_jd + ((muhurta_num - 1) * muhurta_duration / 24)
        muhurta_end = sunrise_jd + (muhurta_num * muhurta_duration / 24)
        
        if muhurta_start <= jd <= muhurta_end:
            is_marana = True
            break
    
    if is_marana:
        return EventCalculatorResult(
            occurring=True,
            strength=85,
            description="Marana Karak Muhurta - Death-inflicting time, avoid all important activities",
            category='inauspicious'
        )
    
    return EventCalculatorResult(occurring=False)

# General quality checkers
@EventCalculator.register(EventName.BENEFIC_HORA_ACTIVE)
def benefic_hora_active(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if benefic planet hora is active"""
    lat = birth_details.get('latitude', 0)
    lon = birth_details.get('longitude', 0)
    
    hora_lord = get_hora_lord(time, lat, lon)
    benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon']
    
    if hora_lord in benefics:
        return EventCalculatorResult(
            occurring=True,
            strength=80,
            description=f"Benefic Hora ({hora_lord}) - Favorable planetary hour",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.MALEFIC_HORA_ACTIVE)
def malefic_hora_active(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if malefic planet hora is active"""
    lat = birth_details.get('latitude', 0)
    lon = birth_details.get('longitude', 0)
    
    hora_lord = get_hora_lord(time, lat, lon)
    malefics = ['Saturn', 'Mars', 'Sun']
    
    if hora_lord in malefics:
        return EventCalculatorResult(
            occurring=True,
            strength=65,
            description=f"Malefic Hora ({hora_lord}) - Challenging planetary hour",
            category='inauspicious'
        )
    
    return EventCalculatorResult(occurring=False)
