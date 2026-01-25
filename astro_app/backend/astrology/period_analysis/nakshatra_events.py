"""
Nakshatra Event Calculators
Implements nakshatra-specific qualities and activities
"""
from datetime import datetime
from typing import Dict
from .events import EventCalculator, EventName, EventCalculatorResult
from .core import AstroCalculate

# All 27 Nakshatras with their qualities and favorable activities
NAKSHATRA_DEFINITIONS = {
    1: {
        "name": "Ashwini",
        "quality": "auspicious",
        "strength": 75,
        "deity": "Ashwini Kumaras",
        "nature": "swift",
        "activities": ["travel", "healing", "medicine", "starting new ventures"],
        "description": "Swift and healing energy, excellent for medical matters and new beginnings"
    },
    2: {
        "name": "Bharani",
        "quality": "mixed",
        "strength": 50,
        "deity": "Yama",
        "nature": "fierce",
        "activities": ["transformation", "endings", "agriculture"],
        "description": "Transformative energy, good for endings and new cycles"
    },
    3: {
        "name": "Krittika",
        "quality": "auspicious",
        "strength": 70,
        "deity": "Agni",
        "nature": "sharp",
        "activities": ["purification", "cutting", "surgery", "fire rituals"],
        "description": "Sharp and purifying, good for decisive actions"
    },
    4: {
        "name": "Rohini",
        "quality": "auspicious",
        "strength": 90,
        "deity": "Brahma",
        "nature": "fixed",
        "activities": ["agriculture", "construction", "marriage", "wealth"],
        "description": "Most auspicious for material prosperity and growth"
    },
    5: {
        "name": "Mrigashira",
        "quality": "auspicious",
        "strength": 75,
        "deity": "Soma",
        "nature": "soft",
        "activities": ["search", "travel", "education", "art"],
        "description": "Good for seeking knowledge and creative pursuits"
    },
    6: {
        "name": "Ardra",
        "quality": "inauspicious",
        "strength": 30,
        "deity": "Rudra",
        "nature": "fierce",
        "activities": ["destruction", "research", "deep work"],
        "description": "Stormy energy, avoid auspicious activities"
    },
    7: {
        "name": "Punarvasu",
        "quality": "auspicious",
        "strength": 80,
        "deity": "Aditi",
        "nature": "movable",
        "activities": ["return", "renewal", "construction", "travel"],
        "description": "Renewal and return, excellent for fresh starts"
    },
    8: {
        "name": "Pushya",
        "quality": "auspicious",
        "strength": 95,
        "deity": "Brihaspati",
        "nature": "light",
        "activities": ["all auspicious activities", "education", "spiritual"],
        "description": "Most auspicious nakshatra, excellent for everything"
    },
    9: {
        "name": "Ashlesha",
        "quality": "inauspicious",
        "strength": 25,
        "deity": "Nagas",
        "nature": "sharp",
        "activities": ["occult", "strategy", "manipulation"],
        "description": "Serpent energy, avoid important activities"
    },
    10: {
        "name": "Magha",
        "quality": "auspicious",
        "strength": 80,
        "deity": "Pitris",
        "nature": "fierce",
        "activities": ["ancestral", "authority", "ceremonies"],
        "description": "Royal energy, good for authority and ceremonies"
    },
    11: {
        "name": "Purva Phalguni",
        "quality": "auspicious",
        "strength": 75,
        "deity": "Bhaga",
        "nature": "fierce",
        "activities": ["pleasure", "marriage", "creativity"],
        "description": "Enjoyment and creativity, good for relationships"
    },
    12: {
        "name": "Uttara Phalguni",
        "quality": "auspicious",
        "strength": 85,
        "deity": "Aryaman",
        "nature": "fixed",
        "activities": ["marriage", "contracts", "partnerships"],
        "description": "Partnership energy, excellent for commitments"
    },
    13: {
        "name": "Hasta",
        "quality": "auspicious",
        "strength": 85,
        "deity": "Savitar",
        "nature": "light",
        "activities": ["crafts", "skills", "trade", "healing"],
        "description": "Skillful hands, excellent for craftsmanship"
    },
    14: {
        "name": "Chitra",
        "quality": "mixed",
        "strength": 60,
        "deity": "Vishwakarma",
        "nature": "soft",
        "activities": ["design", "architecture", "beauty"],
        "description": "Creative brilliance, good for artistic work"
    },
    15: {
        "name": "Swati",
        "quality": "auspicious",
        "strength": 70,
        "deity": "Vayu",
        "nature": "movable",
        "activities": ["trade", "business", "travel", "communication"],
        "description": "Independent and flexible, good for commerce"
    },
    16: {
        "name": "Vishakha",
        "quality": "mixed",
        "strength": 55,
        "deity": "Indra-Agni",
        "nature": "sharp",
        "activities": ["achievement", "goals", "determination"],
        "description": "Goal-oriented energy, mixed results"
    },
    17: {
        "name": "Anuradha",
        "quality": "auspicious",
        "strength": 80,
        "deity": "Mitra",
        "nature": "soft",
        "activities": ["friendship", "devotion", "travel"],
        "description": "Friendship and devotion, very favorable"
    },
    18: {
        "name": "Jyeshtha",
        "quality": "inauspicious",
        "strength": 35,
        "deity": "Indra",
        "nature": "sharp",
        "activities": ["protection", "defense", "occult"],
        "description": "Elder energy, generally unfavorable"
    },
    19: {
        "name": "Mula",
        "quality": "inauspicious",
        "strength": 20,
        "deity": "Nirriti",
        "nature": "sharp",
        "activities": ["destruction", "research", "investigation"],
        "description": "Root destruction, avoid auspicious activities"
    },
    20: {
        "name": "Purva Ashadha",
        "quality": "auspicious",
        "strength": 75,
        "deity": "Apas",
        "nature": "fierce",
        "activities": ["purification", "victory", "invigoration"],
        "description": "Invincible energy, good for challenges"
    },
    21: {
        "name": "Uttara Ashadha",
        "quality": "auspicious",
        "strength": 85,
        "deity": "Vishwadevas",
        "nature": "fixed",
        "activities": ["victory", "permanence", "authority"],
        "description": "Universal victory, excellent for lasting success"
    },
    22: {
        "name": "Shravana",
        "quality": "auspicious",
        "strength": 90,
        "deity": "Vishnu",
        "nature": "movable",
        "activities": ["learning", "listening", "education", "travel"],
        "description": "Learning and knowledge, highly auspicious"
    },
    23: {
        "name": "Dhanishtha",
        "quality": "mixed",
        "strength": 60,
        "deity": "Vasus",
        "nature": "movable",
        "activities": ["music", "wealth", "group activities"],
        "description": "Wealth and music, mixed results"
    },
    24: {
        "name": "Shatabhisha",
        "quality": "mixed",
        "strength": 50,
        "deity": "Varuna",
        "nature": "movable",
        "activities": ["healing", "secrets", "research"],
        "description": "Hundred healers, good for medical work"
    },
    25: {
        "name": "Purva Bhadrapada",
        "quality": "inauspicious",
        "strength": 40,
        "deity": "Aja Ekapada",
        "nature": "fierce",
        "activities": ["occult", "transformation", "sacrifice"],
        "description": "Intense transformation, generally unfavorable"
    },
    26: {
        "name": "Uttara Bhadrapada",
        "quality": "auspicious",
        "strength": 80,
        "deity": "Ahir Budhnya",
        "nature": "fixed",
        "activities": ["depth", "wisdom", "stability"],
        "description": "Deep wisdom, very favorable"
    },
    27: {
        "name": "Revati",
        "quality": "auspicious",
        "strength": 85,
        "deity": "Pushan",
        "nature": "soft",
        "activities": ["completion", "travel", "nourishment"],
        "description": "Nourishing completion, excellent for endings and journeys"
    }
}

# Register all 27 Nakshatra events dynamically
for nak_num, nak_info in NAKSHATRA_DEFINITIONS.items():
    # Create event name
    event_name_str = f"{nak_info['name'].upper().replace(' ', '_')}_NAKSHATRA"
    
    # Add to EventName enum if not exists
    if not hasattr(EventName, event_name_str):
        setattr(EventName, event_name_str, event_name_str.lower())
    
    # Create calculator function with closure
    def make_nakshatra_calculator(nakshatra_number, nakshatra_data):
        def nakshatra_calculator(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
            """Calculate if specific Nakshatra is active"""
            # Get current Moon position
            jd = AstroCalculate.get_julian_day(time)
            positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
            
            current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
            
            is_occurring = (current_nakshatra == nakshatra_number)
            
            return EventCalculatorResult(
                occurring=is_occurring,
                strength=nakshatra_data['strength'] if is_occurring else 0,
                description=nakshatra_data['description'],
                category=nakshatra_data['quality']
            )
        
        return nakshatra_calculator
    
    # Register the calculator
    calculator = make_nakshatra_calculator(nak_num, nak_info)
    EventCalculator.register(getattr(EventName, event_name_str))(calculator)

# General Nakshatra quality checkers
@EventCalculator.register(EventName.NAKSHATRA_AUSPICIOUS)
def nakshatra_auspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if current Nakshatra is highly auspicious (Pushya, Rohini, Shravana, etc.)"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    
    # Highly auspicious nakshatras (strength >= 85)
    highly_auspicious = [4, 8, 12, 13, 21, 22, 26, 27]  # Rohini, Pushya, Uttara Phalguni, Hasta, Uttara Ashadha, Shravana, Uttara Bhadrapada, Revati
    
    if current_nakshatra in highly_auspicious and current_nakshatra in NAKSHATRA_DEFINITIONS:
        nak_info = NAKSHATRA_DEFINITIONS[current_nakshatra]
        return EventCalculatorResult(
            occurring=True,
            strength=nak_info['strength'],
            description=f"Highly Auspicious Nakshatra: {nak_info['name']} - {nak_info['description']}",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.NAKSHATRA_INAUSPICIOUS)
def nakshatra_inauspicious(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if current Nakshatra is inauspicious (Ardra, Ashlesha, Jyeshtha, Mula, etc.)"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    
    # Inauspicious nakshatras
    inauspicious = [6, 9, 18, 19, 25]  # Ardra, Ashlesha, Jyeshtha, Mula, Purva Bhadrapada
    
    if current_nakshatra in inauspicious and current_nakshatra in NAKSHATRA_DEFINITIONS:
        nak_info = NAKSHATRA_DEFINITIONS[current_nakshatra]
        return EventCalculatorResult(
            occurring=True,
            strength=100 - nak_info['strength'],  # Invert for penalty
            description=f"Inauspicious Nakshatra: {nak_info['name']} - {nak_info['description']}",
            category='inauspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.NAKSHATRA_FIXED)
def nakshatra_fixed(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if current Nakshatra is fixed nature (good for permanent activities)"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    
    # Fixed nakshatras (good for permanent things)
    fixed_nakshatras = [4, 12, 21, 26]  # Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada
    
    if current_nakshatra in fixed_nakshatras and current_nakshatra in NAKSHATRA_DEFINITIONS:
        nak_info = NAKSHATRA_DEFINITIONS[current_nakshatra]
        return EventCalculatorResult(
            occurring=True,
            strength=nak_info['strength'],
            description=f"Fixed Nakshatra: {nak_info['name']} - Excellent for permanent activities like marriage, construction",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)

@EventCalculator.register(EventName.NAKSHATRA_MOVABLE)
def nakshatra_movable(time: datetime, birth_details: Dict, moon_longitude: float) -> EventCalculatorResult:
    """Check if current Nakshatra is movable nature (good for travel, change)"""
    jd = AstroCalculate.get_julian_day(time)
    positions = AstroCalculate.get_planetary_positions(jd, ayanamsa='lahiri')
    
    current_nakshatra = AstroCalculate.get_nakshatra(positions['Moon'])
    
    # Movable nakshatras (good for travel and change)
    movable_nakshatras = [7, 15, 22, 23, 24]  # Punarvasu, Swati, Shravana, Dhanishtha, Shatabhisha
    
    if current_nakshatra in movable_nakshatras and current_nakshatra in NAKSHATRA_DEFINITIONS:
        nak_info = NAKSHATRA_DEFINITIONS[current_nakshatra]
        return EventCalculatorResult(
            occurring=True,
            strength=nak_info['strength'],
            description=f"Movable Nakshatra: {nak_info['name']} - Good for travel, business, changes",
            category='auspicious'
        )
    
    return EventCalculatorResult(occurring=False)
