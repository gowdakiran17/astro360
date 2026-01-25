import math

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

def normalize_degree(degree: float) -> float:
    """Normalize degree to 0-360 range."""
    return degree % 360

def get_zodiac_sign(longitude: float) -> str:
    """Get zodiac sign name from longitude."""
    index = int(normalize_degree(longitude) / 30)
    return ZODIAC_SIGNS[index]

def get_nakshatra(longitude: float) -> str:
    """Get nakshatra name from longitude."""
    # Each nakshatra is 13 degrees 20 minutes = 13.3333... degrees
    nakshatra_span = 360 / 27
    index = int(normalize_degree(longitude) / nakshatra_span)
    return NAKSHATRAS[index]

def dms_to_decimal(deg, min, sec):
    return deg + min/60 + sec/3600
