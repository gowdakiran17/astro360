"""
Ghataka Chakra Module
Implements the complete Ghataka table for all 27 Nakshatras
"""

from typing import Dict, List, Tuple


# Complete Ghataka Chakra table for all 27 Nakshatras
# Format: nakshatra_number -> {tithi, nakshatra, weekday, lagna, rashi}
GHATAKA_TABLE = {
    1: {  # Ashwini
        'tithi': [4, 6, 12],
        'nakshatra': [9, 18],
        'weekday': [2],  # Tuesday (0=Sunday)
        'lagna': [5],  # Virgo
        'rashi': [5]   # Virgo
    },
    2: {  # Bharani
        'tithi': [5, 7, 13],
        'nakshatra': [10, 19],
        'weekday': [3],  # Wednesday
        'lagna': [6],  # Libra
        'rashi': [6]
    },
    3: {  # Krittika
        'tithi': [6, 8, 14],
        'nakshatra': [11, 20],
        'weekday': [4],  # Thursday
        'lagna': [7],  # Scorpio
        'rashi': [7]
    },
    4: {  # Rohini
        'tithi': [7, 9, 15],
        'nakshatra': [12, 21],
        'weekday': [5],  # Friday
        'lagna': [8],  # Sagittarius
        'rashi': [8]
    },
    5: {  # Mrigashira
        'tithi': [8, 10, 1],
        'nakshatra': [13, 22],
        'weekday': [6],  # Saturday
        'lagna': [9],  # Capricorn
        'rashi': [9]
    },
    6: {  # Ardra
        'tithi': [9, 11, 2],
        'nakshatra': [14, 23],
        'weekday': [0],  # Sunday
        'lagna': [10],  # Aquarius
        'rashi': [10]
    },
    7: {  # Punarvasu
        'tithi': [10, 12, 3],
        'nakshatra': [15, 24],
        'weekday': [1],  # Monday
        'lagna': [11],  # Pisces
        'rashi': [11]
    },
    8: {  # Pushya
        'tithi': [11, 13, 4],
        'nakshatra': [16, 25],
        'weekday': [2],  # Tuesday
        'lagna': [0],  # Aries
        'rashi': [0]
    },
    9: {  # Ashlesha
        'tithi': [12, 14, 5],
        'nakshatra': [17, 26],
        'weekday': [3],  # Wednesday
        'lagna': [1],  # Taurus
        'rashi': [1]
    },
    10: {  # Magha
        'tithi': [13, 15, 6],
        'nakshatra': [18, 27],
        'weekday': [4],  # Thursday
        'lagna': [2],  # Gemini
        'rashi': [2]
    },
    11: {  # Purva Phalguni
        'tithi': [14, 1, 7],
        'nakshatra': [19, 1],
        'weekday': [5],  # Friday
        'lagna': [3],  # Cancer
        'rashi': [3]
    },
    12: {  # Uttara Phalguni
        'tithi': [15, 2, 8],
        'nakshatra': [20, 2],
        'weekday': [6],  # Saturday
        'lagna': [4],  # Leo
        'rashi': [4]
    },
    13: {  # Hasta
        'tithi': [1, 3, 9],
        'nakshatra': [21, 3],
        'weekday': [0],  # Sunday
        'lagna': [5],  # Virgo
        'rashi': [5]
    },
    14: {  # Chitra
        'tithi': [2, 4, 10],
        'nakshatra': [22, 4],
        'weekday': [1],  # Monday
        'lagna': [6],  # Libra
        'rashi': [6]
    },
    15: {  # Swati
        'tithi': [3, 5, 11],
        'nakshatra': [23, 5],
        'weekday': [2],  # Tuesday
        'lagna': [7],  # Scorpio
        'rashi': [7]
    },
    16: {  # Vishakha
        'tithi': [4, 6, 12],
        'nakshatra': [24, 6],
        'weekday': [3],  # Wednesday
        'lagna': [8],  # Sagittarius
        'rashi': [8]
    },
    17: {  # Anuradha
        'tithi': [5, 7, 13],
        'nakshatra': [25, 7],
        'weekday': [4],  # Thursday
        'lagna': [9],  # Capricorn
        'rashi': [9]
    },
    18: {  # Jyeshtha
        'tithi': [6, 8, 14],
        'nakshatra': [26, 8],
        'weekday': [5],  # Friday
        'lagna': [10],  # Aquarius
        'rashi': [10]
    },
    19: {  # Mula
        'tithi': [7, 9, 15],
        'nakshatra': [27, 9],
        'weekday': [6],  # Saturday
        'lagna': [11],  # Pisces
        'rashi': [11]
    },
    20: {  # Purva Ashadha
        'tithi': [8, 10, 1],
        'nakshatra': [1, 10],
        'weekday': [0],  # Sunday
        'lagna': [0],  # Aries
        'rashi': [0]
    },
    21: {  # Uttara Ashadha
        'tithi': [9, 11, 2],
        'nakshatra': [2, 11],
        'weekday': [1],  # Monday
        'lagna': [1],  # Taurus
        'rashi': [1]
    },
    22: {  # Shravana
        'tithi': [10, 12, 3],
        'nakshatra': [3, 12],
        'weekday': [2],  # Tuesday
        'lagna': [2],  # Gemini
        'rashi': [2]
    },
    23: {  # Dhanishta
        'tithi': [11, 13, 4],
        'nakshatra': [4, 13],
        'weekday': [3],  # Wednesday
        'lagna': [3],  # Cancer
        'rashi': [3]
    },
    24: {  # Shatabhisha
        'tithi': [12, 14, 5],
        'nakshatra': [5, 14],
        'weekday': [4],  # Thursday
        'lagna': [4],  # Leo
        'rashi': [4]
    },
    25: {  # Purva Bhadrapada
        'tithi': [13, 15, 6],
        'nakshatra': [6, 15],
        'weekday': [5],  # Friday
        'lagna': [5],  # Virgo
        'rashi': [5]
    },
    26: {  # Uttara Bhadrapada
        'tithi': [14, 1, 7],
        'nakshatra': [7, 16],
        'weekday': [6],  # Saturday
        'lagna': [6],  # Libra
        'rashi': [6]
    },
    27: {  # Revati
        'tithi': [15, 2, 8],
        'nakshatra': [8, 17],
        'weekday': [0],  # Sunday
        'lagna': [7],  # Scorpio
        'rashi': [7]
    }
}


def calculate_ghataka_chakra(birth_nakshatra: int, current_tithi: int, 
                             current_nakshatra: int, current_weekday: int,
                             current_lagna_rashi: int = None,
                             current_moon_rashi: int = None) -> Dict[str, any]:
    """
    Calculate Ghataka Chakra obstructions based on birth nakshatra.
    
    Ghataka means "killer" or "destroyer" - these are inauspicious combinations
    that should be avoided for important activities.
    
    Args:
        birth_nakshatra: Birth nakshatra (1-27)
        current_tithi: Current tithi (1-30)
        current_nakshatra: Current nakshatra (1-27)
        current_weekday: Current weekday (0=Sunday, 1=Monday, etc.)
        current_lagna_rashi: Current lagna rashi (0-11), optional
        current_moon_rashi: Current Moon rashi (0-11), optional
        
    Returns:
        Dictionary with ghataka status and details
    """
    if birth_nakshatra not in GHATAKA_TABLE:
        return {
            'has_ghataka': False,
            'ghataka_types': [],
            'description': "Invalid birth nakshatra"
        }
    
    ghataka_data = GHATAKA_TABLE[birth_nakshatra]
    ghataka_types = []
    
    # Check Tithi Ghataka
    if current_tithi in ghataka_data['tithi']:
        ghataka_types.append(f"Tithi Ghataka (Tithi {current_tithi})")
    
    # Check Nakshatra Ghataka
    if current_nakshatra in ghataka_data['nakshatra']:
        ghataka_types.append(f"Nakshatra Ghataka (Nakshatra {current_nakshatra})")
    
    # Check Weekday Ghataka
    if current_weekday in ghataka_data['weekday']:
        weekday_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        ghataka_types.append(f"Weekday Ghataka ({weekday_names[current_weekday]})")
    
    # Check Lagna Ghataka (if provided)
    if current_lagna_rashi is not None and current_lagna_rashi in ghataka_data['lagna']:
        rashi_names = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        ghataka_types.append(f"Lagna Ghataka ({rashi_names[current_lagna_rashi]})")
    
    # Check Rashi Ghataka (if provided)
    if current_moon_rashi is not None and current_moon_rashi in ghataka_data['rashi']:
        rashi_names = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        ghataka_types.append(f"Moon Rashi Ghataka ({rashi_names[current_moon_rashi]})")
    
    has_ghataka = len(ghataka_types) > 0
    
    if has_ghataka:
        description = f"Ghataka present: {', '.join(ghataka_types)}"
        strength = min(len(ghataka_types) * 0.3, 1.0)  # More types = stronger obstruction
    else:
        description = "No Ghataka obstructions"
        strength = 0.0
    
    return {
        'has_ghataka': has_ghataka,
        'ghataka_types': ghataka_types,
        'count': len(ghataka_types),
        'strength': strength,
        'description': description
    }


def get_ghataka_for_nakshatra(nakshatra: int) -> Dict[str, List[int]]:
    """
    Get the Ghataka table entry for a specific nakshatra.
    
    Args:
        nakshatra: Nakshatra number (1-27)
        
    Returns:
        Dictionary with ghataka tithis, nakshatras, weekdays, lagnas, and rashis
    """
    if nakshatra in GHATAKA_TABLE:
        return GHATAKA_TABLE[nakshatra]
    else:
        return {
            'tithi': [],
            'nakshatra': [],
            'weekday': [],
            'lagna': [],
            'rashi': []
        }
