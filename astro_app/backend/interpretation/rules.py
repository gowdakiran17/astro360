# Mahadasha Themes
MAHADASHA_THEMES = {
    "Ketu": "Detachment, spirituality, confusion, sudden changes, past life karma.",
    "Venus": "Luxury, relationships, creativity, comfort, material gain.",
    "Sun": "Authority, ego, career, vitality, government, father.",
    "Moon": "Emotions, mind, mother, home, fluctuations, popularity.",
    "Mars": "Energy, action, courage, conflict, land, technical skills.",
    "Rahu": "Ambition, illusion, foreign lands, innovation, unconventional path.",
    "Jupiter": "Wisdom, expansion, wealth, spirituality, children, gurus.",
    "Saturn": "Discipline, delay, hard work, responsibility, longevity, karma.",
    "Mercury": "Communication, intellect, business, education, flexibility."
}

# Planetary Strengths (Simplified for Deterministic Rules)
# Exaltation Signs (Approximate whole sign)
EXALTATION_SIGNS = {
    "Sun": "Aries",
    "Moon": "Taurus",
    "Mars": "Capricorn",
    "Mercury": "Virgo",
    "Jupiter": "Cancer",
    "Venus": "Pisces",
    "Saturn": "Libra",
    "Rahu": "Taurus", # Debatable, often Taurus or Gemini
    "Ketu": "Scorpio"  # Debatable, often Scorpio or Sagittarius
}

DEBILITATION_SIGNS = {
    "Sun": "Libra",
    "Moon": "Scorpio",
    "Mars": "Cancer",
    "Mercury": "Pisces",
    "Jupiter": "Capricorn",
    "Venus": "Virgo",
    "Saturn": "Aries",
    "Rahu": "Scorpio",
    "Ketu": "Taurus"
}

OWN_SIGNS = {
    "Sun": ["Leo"],
    "Moon": ["Cancer"],
    "Mars": ["Aries", "Scorpio"],
    "Mercury": ["Gemini", "Virgo"],
    "Jupiter": ["Sagittarius", "Pisces"],
    "Venus": ["Taurus", "Libra"],
    "Saturn": ["Capricorn", "Aquarius"],
    "Rahu": ["Aquarius"], # Co-lord
    "Ketu": ["Scorpio"]   # Co-lord
}

# House Activation Meanings
HOUSE_THEMES = {
    1: "Self, personality, physical body, beginnings.",
    2: "Wealth, family, speech, food.",
    3: "Courage, siblings, communication, short trips.",
    4: "Mother, home, happiness, vehicles, land.",
    5: "Children, creativity, intelligence, past karma.",
    6: "Enemies, debts, diseases, service, litigation.",
    7: "Marriage, partnerships, business, spouse.",
    8: "Longevity, transformation, occult, sudden events.",
    9: "Luck, father, guru, higher learning, religion.",
    10: "Career, reputation, authority, karma.",
    11: "Gains, desires, friends, older siblings.",
    12: "Losses, foreign lands, spirituality, isolation."
}

def interpret_mahadasha(planet_name: str) -> dict:
    """
    Returns the general theme of a Mahadasha.
    """
    theme = MAHADASHA_THEMES.get(planet_name, "General period.")
    return {
        "planet": planet_name,
        "interpretation": f"Period of {planet_name}: {theme}",
        "reasoning": f"Standard Vedic attribution for {planet_name} Mahadasha."
    }

def interpret_planetary_strength(planet_name: str, zodiac_sign: str) -> dict:
    """
    Determines if a planet is Exalted, Debilitated, or in Own Sign.
    """
    status = "Neutral"
    reason = f"{planet_name} is in {zodiac_sign}."
    
    if zodiac_sign == EXALTATION_SIGNS.get(planet_name):
        status = "Exalted"
        reason = f"{planet_name} is at its highest strength in {zodiac_sign}."
    elif zodiac_sign == DEBILITATION_SIGNS.get(planet_name):
        status = "Debilitated"
        reason = f"{planet_name} is at its lowest strength in {zodiac_sign}."
    elif zodiac_sign in OWN_SIGNS.get(planet_name, []):
        status = "Own Sign"
        reason = f"{planet_name} is comfortable in its own house {zodiac_sign}."
        
    return {
        "planet": planet_name,
        "sign": zodiac_sign,
        "strength_status": status,
        "reasoning": reason
    }

def interpret_house_activation(house_number: int, planet_name: str = None) -> dict:
    """
    Explains what a house activation means, optionally linked to a planet.
    """
    theme = HOUSE_THEMES.get(house_number, "Unknown House")
    
    if planet_name:
        interpretation = f"{planet_name} in House {house_number} activates: {theme}"
        reasoning = f"{planet_name} brings its energy to the {house_number}th house matters."
    else:
        interpretation = f"House {house_number} represents: {theme}"
        reasoning = "Standard House signification."
        
    return {
        "house": house_number,
        "interpretation": interpretation,
        "reasoning": reasoning
    }
