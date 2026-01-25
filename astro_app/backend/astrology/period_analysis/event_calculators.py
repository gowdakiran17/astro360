"""
Event Calculator Implementations
Individual calculators for specific astrological events
"""

from datetime import datetime
from typing import Dict
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate


@EventCalculator.register(EventName.CHANDRASHTAMA)
def calculate_chandrashtama(time: datetime, birth_moon_longitude: float, 
                            positions: Dict[str, float]) -> EventCalculatorResult:
    """
    Calculate Chandrashtama (8th Moon from birth Moon).
    
    VedAstro implements 3 nullification conditions:
    1. If birth Moon is in Kendra (1, 4, 7, 10) from Lagna
    2. If birth Moon is in Trikona (1, 5, 9) from Lagna
    3. If all malefics are in Upachaya houses (3, 6, 10, 11)
    
    Args:
        time: Current time
        birth_moon_longitude: Birth Moon longitude
        positions: Current planetary positions
        
    Returns:
        EventCalculatorResult
    """
    if 'Moon' not in positions:
        return EventCalculatorResult(occurred=False, description="Moon position not available")
    
    current_moon_long = positions['Moon']
    
    # Calculate birth and current Moon rashis
    birth_moon_rashi = AstroCalculate.get_rashi(birth_moon_longitude)
    current_moon_rashi = AstroCalculate.get_rashi(current_moon_long)
    
    # Calculate difference (8th house is 7 rashis away)
    rashi_diff = (current_moon_rashi - birth_moon_rashi) % 12
    
    # Chandrashtama occurs when Moon is in 8th rashi from birth Moon
    is_chandrashtama = (rashi_diff == 7)
    
    if not is_chandrashtama:
        return EventCalculatorResult(
            occurred=False,
            description="Not in Chandrashtama period"
        )
    
    # Check nullification conditions (if ascendant is available)
    nullified = False
    nullification_reason = ""
    
    if 'ascendant_longitude' in positions:
        asc_long = positions['ascendant_longitude']
        
        # Condition 1: Birth Moon in Kendra from Lagna
        if AstroCalculate.is_planet_in_kendra(birth_moon_longitude, asc_long):
            nullified = True
            nullification_reason = "Birth Moon in Kendra from Lagna"
        
        # Condition 2: Birth Moon in Trikona from Lagna
        elif AstroCalculate.is_planet_in_trikona(birth_moon_longitude, asc_long):
            nullified = True
            nullification_reason = "Birth Moon in Trikona from Lagna"
        
        # Condition 3: All malefics in Upachaya
        elif AstroCalculate.is_all_malefics_in_upachaya(positions, asc_long):
            nullified = True
            nullification_reason = "All malefics in Upachaya houses"
    
    if nullified:
        return EventCalculatorResult(
            occurred=True,
            strength=0.2,  # Low impact due to nullification
            description=f"Chandrashtama present but nullified: {nullification_reason}",
            metadata={'nullified': True, 'reason': nullification_reason}
        )
    else:
        return EventCalculatorResult(
            occurred=True,
            strength=0.8,  # High negative impact
            description="Chandrashtama: Moon in 8th from birth Moon (inauspicious)",
            metadata={'nullified': False}
        )


@EventCalculator.register(EventName.NEW_MOON)
def calculate_new_moon(time: datetime, positions: Dict[str, float]) -> EventCalculatorResult:
    """
    Calculate New Moon (Amavasya) event.
    
    Args:
        time: Current time
        positions: Planetary positions
        
    Returns:
        EventCalculatorResult
    """
    if 'Sun' not in positions or 'Moon' not in positions:
        return EventCalculatorResult(occurred=False, description="Sun/Moon position not available")
    
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    
    # Calculate angular separation
    separation = abs((moon_long - sun_long) % 360)
    if separation > 180:
        separation = 360 - separation
    
    # New Moon occurs when separation is less than 12 degrees
    is_new_moon = separation < 12
    
    if is_new_moon:
        # Strength based on proximity (closer = stronger)
        strength = 1.0 - (separation / 12.0)
        return EventCalculatorResult(
            occurred=True,
            strength=strength,
            description=f"New Moon (Amavasya): {separation:.1f}° separation",
            metadata={'separation_degrees': separation}
        )
    else:
        return EventCalculatorResult(occurred=False, description="Not a New Moon")


@EventCalculator.register(EventName.FULL_MOON)
def calculate_full_moon(time: datetime, positions: Dict[str, float]) -> EventCalculatorResult:
    """
    Calculate Full Moon (Purnima) event.
    
    Args:
        time: Current time
        positions: Planetary positions
        
    Returns:
        EventCalculatorResult
    """
    if 'Sun' not in positions or 'Moon' not in positions:
        return EventCalculatorResult(occurred=False, description="Sun/Moon position not available")
    
    sun_long = positions['Sun']
    moon_long = positions['Moon']
    
    # Calculate angular separation
    separation = abs((moon_long - sun_long) % 360)
    
    # Full Moon occurs when separation is close to 180 degrees (within 12 degrees)
    deviation_from_180 = abs(separation - 180)
    is_full_moon = deviation_from_180 < 12
    
    if is_full_moon:
        # Strength based on proximity to exact opposition
        strength = 1.0 - (deviation_from_180 / 12.0)
        return EventCalculatorResult(
            occurred=True,
            strength=strength,
            description=f"Full Moon (Purnima): {separation:.1f}° separation",
            metadata={'separation_degrees': separation}
        )
    else:
        return EventCalculatorResult(occurred=False, description="Not a Full Moon")


@EventCalculator.register(EventName.TARABALA_FAVORABLE)
def calculate_tarabala_favorable(time: datetime, birth_moon_longitude: float,
                                 positions: Dict[str, float]) -> EventCalculatorResult:
    """
    Calculate favorable Tarabala (Tara strength).
    
    Favorable taras: 1 (Janma), 3 (Sampat), 5 (Kshema), 7 (Mitra)
    
    Args:
        time: Current time
        birth_moon_longitude: Birth Moon longitude
        positions: Planetary positions
        
    Returns:
        EventCalculatorResult
    """
    if 'Moon' not in positions:
        return EventCalculatorResult(occurred=False, description="Moon position not available")
    
    current_moon_long = positions['Moon']
    
    # Calculate nakshatras
    birth_nakshatra = AstroCalculate.get_nakshatra(birth_moon_longitude)
    current_nakshatra = AstroCalculate.get_nakshatra(current_moon_long)
    
    # Calculate Tara (1-9 cycle)
    tara = ((current_nakshatra - birth_nakshatra) % 27) % 9
    if tara == 0:
        tara = 9
    
    # Favorable taras
    favorable_taras = [1, 3, 5, 7]
    
    if tara in favorable_taras:
        tara_names = {1: "Janma", 3: "Sampat", 5: "Kshema", 7: "Mitra"}
        strength_map = {1: 0.6, 3: 0.9, 5: 0.8, 7: 0.7}
        
        return EventCalculatorResult(
            occurred=True,
            strength=strength_map[tara],
            description=f"Favorable Tara: {tara_names[tara]} ({tara}/9)",
            metadata={'tara': tara, 'tara_name': tara_names[tara]}
        )
    else:
        return EventCalculatorResult(occurred=False, description=f"Tara {tara}/9 is not favorable")


@EventCalculator.register(EventName.TARABALA_UNFAVORABLE)
def calculate_tarabala_unfavorable(time: datetime, birth_moon_longitude: float,
                                   positions: Dict[str, float]) -> EventCalculatorResult:
    """
    Calculate unfavorable Tarabala (Tara strength).
    
    Unfavorable taras: 2 (Vipat), 4 (Pratyak), 6 (Vadha), 8 (Mrityu), 9 (Naidhana)
    
    Args:
        time: Current time
        birth_moon_longitude: Birth Moon longitude
        positions: Planetary positions
        
    Returns:
        EventCalculatorResult
    """
    if 'Moon' not in positions:
        return EventCalculatorResult(occurred=False, description="Moon position not available")
    
    current_moon_long = positions['Moon']
    
    # Calculate nakshatras
    birth_nakshatra = AstroCalculate.get_nakshatra(birth_moon_longitude)
    current_nakshatra = AstroCalculate.get_nakshatra(current_moon_long)
    
    # Calculate Tara (1-9 cycle)
    tara = ((current_nakshatra - birth_nakshatra) % 27) % 9
    if tara == 0:
        tara = 9
    
    # Unfavorable taras
    unfavorable_taras = [2, 4, 6, 8, 9]
    
    if tara in unfavorable_taras:
        tara_names = {2: "Vipat", 4: "Pratyak", 6: "Vadha", 8: "Mrityu", 9: "Naidhana"}
        # Higher tara number = more unfavorable
        strength_map = {2: 0.5, 4: 0.6, 6: 0.7, 8: 0.9, 9: 0.8}
        
        return EventCalculatorResult(
            occurred=True,
            strength=strength_map[tara],
            description=f"Unfavorable Tara: {tara_names[tara]} ({tara}/9)",
            metadata={'tara': tara, 'tara_name': tara_names[tara]}
        )
    else:
        return EventCalculatorResult(occurred=False, description=f"Tara {tara}/9 is not unfavorable")


@EventCalculator.register(EventName.DAY_LORD_FAVORABLE)
def calculate_day_lord_favorable(time: datetime, birth_moon_longitude: float) -> EventCalculatorResult:
    """
    Calculate if day lord is favorable based on birth Moon nakshatra.
    
    Args:
        time: Current time
        birth_moon_longitude: Birth Moon longitude
        
    Returns:
        EventCalculatorResult
    """
    # Day lords (0=Monday, 6=Sunday)
    day_lords = ['Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Sun']
    weekday = time.weekday()  # 0=Monday
    day_lord = day_lords[weekday]
    
    # Get birth nakshatra
    birth_nakshatra = AstroCalculate.get_nakshatra(birth_moon_longitude)
    
    # Simplified compatibility (can be expanded with full Vedha logic)
    # For now, use basic benefic/malefic classification
    benefic_lords = ['Jupiter', 'Venus', 'Mercury', 'Moon']
    
    if day_lord in benefic_lords:
        return EventCalculatorResult(
            occurred=True,
            strength=0.7,
            description=f"Favorable day lord: {day_lord} ({time.strftime('%A')})",
            metadata={'day_lord': day_lord, 'weekday': time.strftime('%A')}
        )
    else:
        return EventCalculatorResult(occurred=False, description=f"Day lord {day_lord} is not particularly favorable")


@EventCalculator.register(EventName.DAY_LORD_UNFAVORABLE)
def calculate_day_lord_unfavorable(time: datetime, birth_moon_longitude: float) -> EventCalculatorResult:
    """
    Calculate if day lord is unfavorable based on birth Moon nakshatra.
    
    Args:
        time: Current time
        birth_moon_longitude: Birth Moon longitude
        
    Returns:
        EventCalculatorResult
    """
    # Day lords (0=Monday, 6=Sunday)
    day_lords = ['Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Sun']
    weekday = time.weekday()  # 0=Monday
    day_lord = day_lords[weekday]
    
    # Malefic lords
    malefic_lords = ['Saturn', 'Mars', 'Sun']
    
    if day_lord in malefic_lords:
        strength_map = {'Saturn': 0.8, 'Mars': 0.7, 'Sun': 0.6}
        return EventCalculatorResult(
            occurred=True,
            strength=strength_map[day_lord],
            description=f"Unfavorable day lord: {day_lord} ({time.strftime('%A')})",
            metadata={'day_lord': day_lord, 'weekday': time.strftime('%A')}
        )
    else:
        return EventCalculatorResult(occurred=False, description=f"Day lord {day_lord} is not unfavorable")
