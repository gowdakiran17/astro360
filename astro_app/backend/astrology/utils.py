from datetime import datetime, timedelta
from typing import Optional
import re
import swisseph as swe
import pytz

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

NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
]

# Simplified Nama Nakshatra Mapping (Phonetic start)
# This is a basic approximation. A full mapping covers all Padas.
NAMA_NAKSHATRA_MAP = {
    "chu": "Ashwini", "che": "Ashwini", "cho": "Ashwini", "la": "Ashwini",
    "li": "Bharani", "lu": "Bharani", "le": "Bharani", "lo": "Bharani",
    "a": "Krittika", "i": "Krittika", "u": "Krittika", "e": "Krittika",
    "o": "Rohini", "va": "Rohini", "vi": "Rohini", "vu": "Rohini",
    "we": "Mrigashira", "wo": "Mrigashira", "ka": "Mrigashira", "ki": "Mrigashira",
    "ku": "Ardra", "gha": "Ardra", "ng": "Ardra", "chha": "Ardra",
    "ke": "Punarvasu", "ko": "Punarvasu", "ha": "Punarvasu", "hi": "Punarvasu",
    "hu": "Pushya", "he": "Pushya", "ho": "Pushya", "da": "Pushya",
    "di": "Ashlesha", "du": "Ashlesha", "de": "Ashlesha", "do": "Ashlesha",
    "ma": "Magha", "mi": "Magha", "mu": "Magha", "me": "Magha",
    "mo": "Purva Phalguni", "ta": "Purva Phalguni", "ti": "Purva Phalguni", "tu": "Purva Phalguni",
    "te": "Uttara Phalguni", "to": "Uttara Phalguni", "pa": "Uttara Phalguni", "pi": "Uttara Phalguni",
    "pu": "Hasta", "sha": "Hasta", "na": "Hasta", "tha": "Hasta",
    "pe": "Chitra", "po": "Chitra", "ra": "Chitra", "ri": "Chitra",
    "ru": "Swati", "re": "Swati", "ro": "Swati", "ta": "Swati",
    "ti": "Vishakha", "tu": "Vishakha", "te": "Vishakha", "to": "Vishakha",
    "na": "Anuradha", "ni": "Anuradha", "nu": "Anuradha", "ne": "Anuradha",
    "no": "Jyeshtha", "ya": "Jyeshtha", "yi": "Jyeshtha", "yu": "Jyeshtha",
    "ye": "Mula", "yo": "Mula", "ba": "Mula", "bi": "Mula",
    "bu": "Purva Ashadha", "dha": "Purva Ashadha", "bha": "Purva Ashadha", "dha": "Purva Ashadha",
    "bhe": "Uttara Ashadha", "bho": "Uttara Ashadha", "ja": "Uttara Ashadha", "ji": "Uttara Ashadha",
    "ju": "Shravana", "je": "Shravana", "jo": "Shravana", "gha": "Shravana",
    "ga": "Dhanishta", "gi": "Dhanishta", "gu": "Dhanishta", "ge": "Dhanishta",
    "go": "Shatabhisha", "sa": "Shatabhisha", "si": "Shatabhisha", "su": "Shatabhisha",
    "se": "Purva Bhadrapada", "so": "Purva Bhadrapada", "da": "Purva Bhadrapada", "di": "Purva Bhadrapada",
    "du": "Uttara Bhadrapada", "tha": "Uttara Bhadrapada", "jna": "Uttara Bhadrapada", "da": "Uttara Bhadrapada",
    "de": "Revati", "do": "Revati", "cha": "Revati", "chi": "Revati"
}

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

def get_nakshatra_pada(longitude: float) -> int:
    """
    Get nakshatra pada (1-4) from longitude.
    Each nakshatra (13°20') is divided into 4 padas of 3°20' each.
    """
    nakshatra_span = 360 / 27
    pada_span = nakshatra_span / 4
    deg_in_nakshatra = normalize_degree(longitude) % nakshatra_span
    pada = int(deg_in_nakshatra / pada_span) + 1
    return pada

def get_nakshatra_from_sound(name: str) -> str:
    """
    Maps a name string to a Nakshatra based on phonetic start (Nama Nakshatra).
    Returns 'Unknown' if no match.
    """
    clean_name = name.lower().strip()
    
    # Try 3 chars, then 2 chars, then 1 char
    if len(clean_name) >= 3:
        prefix = clean_name[:3]
        if prefix in NAMA_NAKSHATRA_MAP:
            return NAMA_NAKSHATRA_MAP[prefix]
            
    if len(clean_name) >= 2:
        prefix = clean_name[:2]
        if prefix in NAMA_NAKSHATRA_MAP:
            return NAMA_NAKSHATRA_MAP[prefix]
            
    if len(clean_name) >= 1:
        prefix = clean_name[:1]
        if prefix in NAMA_NAKSHATRA_MAP:
            return NAMA_NAKSHATRA_MAP[prefix]
            
    return "Unknown"

def get_nakshatra_idx_and_fraction(jd_ut: float) -> tuple:
    """
    Calculates the Nakshatra index (0-26) and the fraction passed (0.0-1.0)
    for the Moon at a given Julian Day UT.
    """
    # 1. Set Sidereal Mode
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    
    # 2. Calculate Moon's position
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
    res = swe.calc_ut(jd_ut, swe.MOON, flags)
    moon_lon = res[0][0]
    
    # 3. Nakshatra calculation
    # Each nakshatra is 13°20' = 13.333333... degrees
    nak_span = 360.0 / 27.0
    
    nak_idx = int(moon_lon / nak_span)
    fraction = (moon_lon % nak_span) / nak_span
    
    return nak_idx, fraction

def validate_date(date_str: str) -> bool:
    """
    Validates date string format DD/MM/YYYY.
    """
    try:
        datetime.strptime(date_str, "%d/%m/%Y")
        return True
    except ValueError:
        return False

def validate_time(time_str: str) -> bool:
    """
    Validates time string format HH:MM or HH:MM:SS (24-hour).
    """
    try:
        datetime.strptime(time_str, "%H:%M")
        return True
    except ValueError:
        try:
            datetime.strptime(time_str, "%H:%M:%S")
            return True
        except ValueError:
            return False

def validate_timezone(timezone_str: str) -> bool:
    """
    Validates timezone format: +HH:MM, -HH:MM, or named timezone (e.g. Asia/Kolkata).
    """
    # 1. Check if it's a numeric offset
    # Matches: +HH:MM, -HH:MM, +H:MM, -H:MM, +H.H, -H.H, +HHMM, -HHMM
    # Also handles cases like +5 (implied +05:00)
    
    # Simple regex for colon format
    if re.match(r"^[+-]?\d{1,2}:\d{2}$", timezone_str):
        return True
        
    # Regex for decimal format (e.g. 5.5, -5.0)
    if re.match(r"^[+-]?\d{1,2}(\.\d+)?$", timezone_str):
        return True
        
    # Regex for compact format (e.g. +0530)
    if re.match(r"^[+-]?\d{4}$", timezone_str):
        return True
            
    # 2. Check if it's a named timezone
    try:
        pytz.timezone(timezone_str)
        return True
    except (pytz.UnknownTimeZoneError, ValueError):
        return False

def validate_coordinates(latitude: float, longitude: float) -> bool:
    """
    Validates latitude (-90 to 90) and longitude (-180 to 180).
    """
    if not (-90 <= latitude <= 90):
        return False
    if not (-180 <= longitude <= 180):
        return False
    return True

def parse_timezone(timezone_str: str, dt_for_dst: Optional[datetime] = None) -> float:
    """
    Parses timezone string (e.g., "+05:30", "-04:00", "Asia/Kolkata") to decimal hours.
    Returns 0.0 if parsing fails.
    """
    try:
        if not timezone_str:
            return 0.0
        
        # 1. Try named timezone (handles DST if dt_for_dst is provided)
        try:
            tz = pytz.timezone(timezone_str)
            if dt_for_dst is None:
                dt_for_dst = datetime.now()
            
            # If naive, assume it's local time in that zone
            if dt_for_dst.tzinfo is None:
                localized = tz.localize(dt_for_dst)
            else:
                localized = dt_for_dst.astimezone(tz)
                
            return localized.utcoffset().total_seconds() / 3600.0
        except (pytz.UnknownTimeZoneError, ValueError):
            pass

        # 2. Try numeric parsing
        # Handle cases: "+05:30", "5.5", "-5", "+530", "5:30"
        
        # Clean string
        tz_str = timezone_str.strip()
        sign = 1
        if tz_str.startswith('-'):
            sign = -1
            tz_str = tz_str[1:]
        elif tz_str.startswith('+'):
            tz_str = tz_str[1:]
            
        # Decimal format (e.g. 5.5)
        if '.' in tz_str:
            return sign * float(tz_str)
            
        # Colon format (e.g. 5:30)
        if ':' in tz_str:
            parts = tz_str.split(':')
            hours = int(parts[0])
            minutes = int(parts[1]) if len(parts) > 1 else 0
            return sign * (hours + minutes / 60.0)
            
        # Compact format or just hours (e.g. 0530 or 5)
        if len(tz_str) >= 3: # Likely HHMM (e.g. 530 or 0530)
            # Pad to at least 3 digits? No, assume last 2 are minutes if length >= 3 and numeric
            if tz_str.isdigit():
                 minutes = int(tz_str[-2:])
                 hours = int(tz_str[:-2])
                 return sign * (hours + minutes / 60.0)
        
        # Just hours (e.g. 5)
        if tz_str.isdigit():
            return sign * float(tz_str)
            
    except Exception:
        pass
    return 0.0

def get_julian_day(date_str: str, time_str: str, timezone_str: str) -> float:
    """
    Converts local date, time and timezone to Julian Day (UTC).
    Supports offset strings (+HH:MM) and named timezones (Asia/Kolkata).
    """
    try:
        dt = datetime.strptime(f"{date_str} {time_str}", "%d/%m/%Y %H:%M")
        tz_offset = parse_timezone(timezone_str, dt)
        
        # Convert local time to UTC
        utc_dt = dt - timedelta(hours=tz_offset)
                
        # Calculate Decimal Hour for Swiss Ephemeris
        decimal_hour = utc_dt.hour + (utc_dt.minute / 60.0) + (utc_dt.second / 3600.0)
        
        # Get Julian Day
        jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, decimal_hour)
        return jd
    except Exception as e:
        # Final safety fallback
        import traceback
        print(f"CRITICAL ERROR in get_julian_day: {e}")
        traceback.print_exc()
        return 2440587.5 # 1970-01-01

def calculate_ascendant(jd_ut: float, lat: float, lon: float) -> float:
    """
    Calculates the Nirayana (Sidereal) Ascendant for a given JD UT.
    Uses Lahiri Ayanamsa.
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)
    
    # Calculate Tropical Houses (Placidus 'P' or any, doesn't matter for Ascendant)
    res_houses = swe.houses(jd_ut, lat, lon, b'P')
    ascendant_tropical = res_houses[1][0]
    
    # Nirvana Ascendant = Tropical Ascendant - Ayanamsa
    ascendant_nirayana = (ascendant_tropical - ayanamsa) % 360
    return ascendant_nirayana

def get_nakshatra_details(longitude: float) -> dict:
    """Gets detailed nakshatra info: name, pada, lord."""
    nak_span = 360.0 / 27.0
    idx = int(longitude / nak_span) % 27
    pada = int((longitude % nak_span) / (nak_span / 4)) + 1
    return {
        "name": NAKSHATRAS[idx],
        "index": idx,
        "pada": pada,
        "lord": NAKSHATRA_LORDS[idx]
    }

def get_planetary_dignity(planet_name: str, sign_idx: int) -> str:
    """Returns basic dignity of a planet in a sign."""
    dignity_map = {
        "Sun": {0: "Exalted", 6: "Debilitated", 4: "Own Sign"},
        "Moon": {1: "Exalted", 7: "Debilitated", 3: "Own Sign"},
        "Mars": {9: "Exalted", 3: "Debilitated", 0: "Own Sign", 7: "Own Sign"},
        "Mercury": {5: "Exalted", 11: "Debilitated", 2: "Own Sign", 5: "Own Sign"},
        "Jupiter": {3: "Exalted", 9: "Debilitated", 8: "Own Sign", 11: "Own Sign"},
        "Venus": {11: "Exalted", 5: "Debilitated", 1: "Own Sign", 6: "Own Sign"},
        "Saturn": {6: "Exalted", 0: "Debilitated", 9: "Own Sign", 10: "Own Sign"}
    }
    
    if planet_name in dignity_map:
        return dignity_map[planet_name].get(sign_idx, "Neutral")
    return "Neutral"

def calculate_special_points(asc_lon: float, sun_lon: float, moon_lon: float, rahu_lon: float, is_day_birth: bool = True) -> dict:
    """
    Calculates Special Sensitive Points:
    1. Bhrigu Bindu: Midpoint of Moon and Rahu.
    2. Pars Fortuna (Part of Fortune):
       Day: Asc + Moon - Sun
       Night: Asc + Sun - Moon
    3. Yogi Point: Sun + Moon + 93 deg 20 min (Pushya Start)
    4. Avayogi Point: Yogi + 186 deg 40 min (6th Nakshatra from Yogi)
    """
    
    # 1. Bhrigu Bindu
    # CAUTION: Rahu is typically retrograde. Ensure Rahu lon is correct (True Node)
    # Midpoint = (Lon1 + Lon2) / 2. Handle 360 crossover.
    # Shortest arc path logic? Bhrigu Bindu usually (Moon + Rahu)/2 is fine. 
    # If arc > 180, take other side? Usually simpler average.
    bb_raw = (moon_lon + rahu_lon) / 2
    if abs(moon_lon - rahu_lon) > 180:
        bb_raw += 180
    bhrigu_bindu = normalize_degree(bb_raw)
    
    # 2. Pars Fortuna
    if is_day_birth:
        pf_raw = asc_lon + moon_lon - sun_lon
    else:
        pf_raw = asc_lon + sun_lon - moon_lon
    fortuna = normalize_degree(pf_raw)
    
    # 3. Yogi Point
    # Sun Longitude + Moon Longitude + Constant (often Pushya/Cancer start? No, it's specific)
    # Standard: Sun + Moon + 93deg 20min (Start of Pushya is where simplistic Yoga starts? No)
    # Actually Yoga = Sun + Moon.
    # Yogi Point = (Sun + Moon) + 93deg 20min (Constant).
    # 93 deg 20 min = 93.3333...
    yogi_point = normalize_degree(sun_lon + moon_lon + 93.33333333)
    
    # 4. Avayogi Point
    # Yogi Point + 6 Nakshatras (186 deg 40 min) ?? No.
    # Avayogi is the lord of the 6th Nakshatra from Yogi Star. 
    # But usually the point itself is considered opposite or square. 
    # Standard: Yogi Point + 186.6666 (Approx 186 deg 40 min? No 6 * 13.33 = 80? Wait.)
    # Avayogi Point = Yogi Point + 93deg 20min? No.
    # Correct Formula: Yogi Point + 186° 40' (approx 6 signs + 6 deg 40 min).
    avayogi_point = normalize_degree(yogi_point + 186.66666667)
    
    return {
        "Bhrigu Bindu": {
            "longitude": bhrigu_bindu,
            "sign": get_zodiac_sign(bhrigu_bindu),
            "nakshatra": get_nakshatra(bhrigu_bindu)
        },
        "Fortuna": {
            "longitude": fortuna,
            "sign": get_zodiac_sign(fortuna),
            "nakshatra": get_nakshatra(fortuna)
        },
        "Yogi Point": {
            "longitude": yogi_point,
            "sign": get_zodiac_sign(yogi_point),
            "nakshatra": get_nakshatra(yogi_point)
        },
        "Avayogi Point": {
            "longitude": avayogi_point,
            "sign": get_zodiac_sign(avayogi_point),
            "nakshatra": get_nakshatra(avayogi_point)
        }
    }
