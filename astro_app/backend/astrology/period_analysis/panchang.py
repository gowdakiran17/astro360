"""
Panchang Calculations Module
Implements Karana, Panchaka, and Tithi calculations following VedAstro logic
"""

from datetime import datetime
from typing import Dict, Tuple
from .core import AstroCalculate
import math


def calculate_karana(sun_longitude: float, moon_longitude: float) -> Tuple[int, str]:
    """
    Calculate Karana (half of a Tithi).
    
    VedAstro Logic:
    - There are 60 Karanas in a lunar month (2 per Tithi)
    - 11 Karanas total: 4 fixed (Shakuni, Chatushpada, Naga, Kimstughna) 
      and 7 movable (Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti/Bhadra)
    - Fixed Karanas occur once each in specific positions
    - Movable Karanas repeat 8 times each
    
    Args:
        sun_longitude: Sun's longitude in degrees
        moon_longitude: Moon's longitude in degrees
        
    Returns:
        Tuple of (karana_number, karana_name)
    """
    # Calculate elongation
    elongation = (moon_longitude - sun_longitude) % 360
    
    # Each Karana is 6 degrees (half of a Tithi which is 12 degrees)
    karana_index = int(elongation / 6)
    
    # Karana names (7 movable + 4 fixed)
    movable_karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti']
    fixed_karanas = ['Shakuni', 'Chatushpada', 'Naga', 'Kimstughna']
    
    # First 7 movable Karanas repeat 8 times (0-55)
    # Last 4 are fixed Karanas (56-59)
    if karana_index < 56:
        # Movable Karana (cycles through 7)
        movable_index = karana_index % 7
        karana_name = movable_karanas[movable_index]
    else:
        # Fixed Karana
        fixed_index = karana_index - 56
        if fixed_index < 4:
            karana_name = fixed_karanas[fixed_index]
        else:
            # Wrap around (shouldn't happen, but safety)
            karana_name = fixed_karanas[3]
    
    return karana_index + 1, karana_name


def calculate_panchaka(nakshatra: int) -> Tuple[bool, str]:
    """
    Calculate Panchaka (inauspicious period).
    
    VedAstro Logic:
    - Panchaka occurs when Moon is in specific Nakshatras
    - Bad Panchaka: Dhanishta (23), Shatabhisha (24), Purva Bhadrapada (25),
      Uttara Bhadrapada (26), Revati (27)
    - These are considered inauspicious for starting new ventures
    
    Args:
        nakshatra: Nakshatra number (1-27)
        
    Returns:
        Tuple of (is_panchaka, description)
    """
    # Bad Panchaka Nakshatras
    bad_panchaka_nakshatras = [23, 24, 25, 26, 27]
    nakshatra_names = {
        23: "Dhanishta",
        24: "Shatabhisha",
        25: "Purva Bhadrapada",
        26: "Uttara Bhadrapada",
        27: "Revati"
    }
    
    if nakshatra in bad_panchaka_nakshatras:
        return True, f"Panchaka (inauspicious): Moon in {nakshatra_names[nakshatra]}"
    else:
        return False, "Not in Panchaka period"


def calculate_tithi_detailed(sun_longitude: float, moon_longitude: float) -> Dict[str, any]:
    """
    Calculate detailed Tithi information.
    
    Args:
        sun_longitude: Sun's longitude in degrees
        moon_longitude: Moon's longitude in degrees
        
    Returns:
        Dictionary with tithi number, name, paksha, and percentage complete
    """
    # Get basic tithi
    tithi_num = AstroCalculate.get_tithi(sun_longitude, moon_longitude)
    
    # Calculate elongation for percentage
    elongation = (moon_longitude - sun_longitude) % 360
    
    # Each tithi is 12 degrees
    # Calculate how far through the current tithi we are
    tithi_progress = (elongation % 12) / 12.0 * 100
    
    # Tithi names
    tithi_names = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ]
    
    # Determine Paksha (waxing or waning)
    if tithi_num <= 15:
        paksha = "Shukla Paksha"  # Waxing
    else:
        paksha = "Krishna Paksha"  # Waning
    
    tithi_name = tithi_names[tithi_num - 1]
    
    return {
        'number': tithi_num,
        'name': tithi_name,
        'paksha': paksha,
        'progress_percent': round(tithi_progress, 2),
        'elongation_degrees': round(elongation, 2)
    }


def is_tithi_auspicious(tithi_num: int) -> Tuple[bool, str]:
    """
    Determine if a Tithi is auspicious for general activities.
    
    Args:
        tithi_num: Tithi number (1-30)
        
    Returns:
        Tuple of (is_auspicious, description)
    """
    # Generally auspicious Tithis
    auspicious_tithis = [2, 3, 5, 7, 10, 11, 12, 13]  # Dwitiya, Tritiya, Panchami, etc.
    
    # Inauspicious Tithis
    inauspicious_tithis = [4, 6, 8, 9, 14, 19, 21, 23, 29]  # Chaturthi, Shashthi, Ashtami, etc.
    
    # Special Tithis
    if tithi_num == 15:
        return True, "Purnima (Full Moon) - highly auspicious"
    elif tithi_num == 30:
        return False, "Amavasya (New Moon) - generally inauspicious"
    elif tithi_num in auspicious_tithis:
        return True, "Auspicious Tithi"
    elif tithi_num in inauspicious_tithis:
        return False, "Inauspicious Tithi"
    else:
        return None, "Neutral Tithi"


def is_karana_auspicious(karana_name: str) -> Tuple[bool, str]:
    """
    Determine if a Karana is auspicious.
    
    Args:
        karana_name: Name of the Karana
        
    Returns:
        Tuple of (is_auspicious, description)
    """
    # Auspicious Karanas
    auspicious_karanas = ['Bava', 'Balava', 'Kaulava', 'Taitila']
    
    # Inauspicious Karanas
    inauspicious_karanas = ['Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna']
    
    # Neutral Karanas
    neutral_karanas = ['Gara', 'Vanija']
    
    if karana_name in auspicious_karanas:
        return True, f"{karana_name} - auspicious Karana"
    elif karana_name in inauspicious_karanas:
        return False, f"{karana_name} - inauspicious Karana"
    else:
        return None, f"{karana_name} - neutral Karana"
