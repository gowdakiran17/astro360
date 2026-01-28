import swisseph as swe
from datetime import datetime, timedelta
from .utils import get_julian_day, ZODIAC_SIGNS
from astro_app.backend.astrology.external_api import astrology_api_service
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Constants
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

TITHIS = [
    "Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami",
    "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami",
    "Shukla Ekadashi", "Shukla Dwadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
    "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami",
    "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami",
    "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
]

YOGAS = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti",
    "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi",
    "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Indra", "Vaidhriti"
]

KARANAS = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
]

BAD_KARANAS = ["Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"]

NAKSHATRA_RULERS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
]

WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

def get_tithi_idx(jd):
    moon_res = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)
    sun_res = swe.calc_ut(jd, swe.SUN, swe.FLG_SIDEREAL)
    diff = (moon_res[0][0] - sun_res[0][0]) % 360
    return int(diff / 12)

def get_nakshatra_idx(jd):
    moon_res = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)
    return int(moon_res[0][0] / (360 / 27))

def get_yoga_idx(jd):
    sun_res = swe.calc_ut(jd, swe.SUN, swe.FLG_SIDEREAL)
    moon_res = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)
    total = (sun_res[0][0] + moon_res[0][0]) % 360
    return int(total / (360 / 27))

def get_karana_idx(jd):
    moon_res = swe.calc_ut(jd, swe.MOON, swe.FLG_SIDEREAL)
    sun_res = swe.calc_ut(jd, swe.SUN, swe.FLG_SIDEREAL)
    diff = (moon_res[0][0] - sun_res[0][0]) % 360
    idx_raw = int(diff / 6)
    if idx_raw == 0: return 10 # Kimstughna
    if 1 <= idx_raw <= 56: return (idx_raw - 1) % 7
    if idx_raw == 57: return 7 # Shakuni
    if idx_raw == 58: return 8 # Chatushpada
    if idx_raw == 59: return 9 # Naga
    return 0

def get_panchang_data(jd, lat, lon, jd_start=None):
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    
    t_idx = get_tithi_idx(jd)
    n_idx = get_nakshatra_idx(jd)
    y_idx = get_yoga_idx(jd)
    k_idx = get_karana_idx(jd)
    
    # Precise Rise/Set
    geopos = (lon, lat, 0)
    flags = swe.FLG_SWIEPH
    
    # Use start of day for rise/set search if provided, otherwise use current time
    jd_search = jd_start if jd_start is not None else jd
    
    # Sun events
    # swe.rise_trans(tjdut, body, rsmi, geopos, atpress, attemp, flags)
    lon_val, lat_val, alt_val = geopos
    
    res_rise = swe.rise_trans(jd_search, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, geopos, 0, 0, flags)
    # Handle tuple return (status is in first element which might be a tuple)
    rise_success = res_rise[0][0] == 0 if isinstance(res_rise[0], tuple) else res_rise[0] == 0
    sunrise = res_rise[1][0] if rise_success else None
    
    res_set = swe.rise_trans(jd_search, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, geopos, 0, 0, flags)
    set_success = res_set[0][0] == 0 if isinstance(res_set[0], tuple) else res_set[0] == 0
    sunset = res_set[1][0] if set_success else None
    
    # Moon events
    res_mrise = swe.rise_trans(jd_search, swe.MOON, swe.CALC_RISE | swe.BIT_DISC_CENTER, geopos, 0, 0, flags)
    mrise_success = res_mrise[0][0] == 0 if isinstance(res_mrise[0], tuple) else res_mrise[0] == 0
    moonrise = res_mrise[1][0] if mrise_success else None
    
    res_mset = swe.rise_trans(jd_search, swe.MOON, swe.CALC_SET | swe.BIT_DISC_CENTER, geopos, 0, 0, flags)
    mset_success = res_mset[0][0] == 0 if isinstance(res_mset[0], tuple) else res_mset[0] == 0
    moonset = res_mset[1][0] if mset_success else None
    
    # Moon Phase
    pheno = swe.pheno_ut(jd, swe.MOON, flags)
    illumination = pheno[0] * 100
    phase_angle = pheno[1]
    
    # Phase Name
    if illumination < 0.5: phase_name = "New Moon"
    elif illumination > 99.5: phase_name = "Full Moon"
    elif phase_angle < 180: phase_name = "Waxing"
    else: phase_name = "Waning"
    
    if 0.5 <= illumination <= 99.5:
        if illumination < 50: phase_name += " Crescent"
        else: phase_name += " Gibbous"

    # Moon Azimuth/Altitude
    m_res = swe.calc_ut(jd, swe.MOON, flags)
    m_lon = m_res[0][0]
    m_lat = m_res[0][1]
    m_dist = m_res[0][2]
    
    # swe.azalt(tjdut, flag, geopos, atpress, attemp, xin)
    res_az = swe.azalt(jd, swe.ECL2HOR, geopos, 0, 0, (m_lon, m_lat, m_dist))
    azimuth = res_az[0]
    elevation = res_az[1]

    # Day Progress (Tithi) - Find start and end of current Tithi
    # This is a bit expensive but manageable for a few iterations
    def find_boundary(jd_start, target_idx, direction):
        curr_jd = jd_start
        step = 0.01 * direction # ~14 mins
        for _ in range(200):
            next_jd = curr_jd + step
            if get_tithi_idx(next_jd) != target_idx:
                # Binary search for refinement
                low = curr_jd if direction > 0 else next_jd
                high = next_jd if direction > 0 else curr_jd
                for _ in range(10):
                    mid = (low + high) / 2
                    if get_tithi_idx(mid) == target_idx:
                        if direction > 0: low = mid
                        else: high = mid
                    else:
                        if direction > 0: high = mid
                        else: low = mid
                return mid if direction > 0 else low
            curr_jd = next_jd
        return curr_jd

    tithi_start = find_boundary(jd, t_idx, -1)
    tithi_end = find_boundary(jd, t_idx, 1)

    # Calculate Day Lord (Weekday)
    # swe.day_of_week returns 0=Monday, 1=Tuesday... 6=Sunday in some versions or 0=Sunday in others.
    # Actually swe.day_of_week(jd) returns 0 for Monday, 6 for Sunday.
    # Let's verify standard: (jd + 1.5) % 7 -> 0=Sunday, 1=Monday...
    dow_idx = int((jd + 1.5) % 7)
    day_lord = WEEKDAYS[dow_idx]

    # Calculate Day Length
    day_length = None
    if sunrise and sunset:
        diff_jd = sunset - sunrise
        # If sunset is next day relative to sunrise, diff is ~0.5. 
        # If they are same day events, diff is < 1.0.
        # Just ensure positive.
        if diff_jd < 0: diff_jd += 1.0
        
        total_hours = diff_jd * 24
        hours = int(total_hours)
        minutes = int((total_hours - hours) * 60)
        day_length = f"{hours}h {minutes}m"
    else:
        day_length = "--h --m"

    panchang_result = {
        "tithi": TITHIS[t_idx],
        "nakshatra": NAKSHATRAS[n_idx],
        "yoga": YOGAS[y_idx],
        "karana": KARANAS[k_idx],
        "day_lord": day_lord,
        "day_length": day_length,
        "sunrise": sunrise,
        "sunset": sunset,
        "moonrise": moonrise,
        "moonset": moonset,
        "illumination": illumination,
        "phase_name": phase_name,
        "azimuth": azimuth,
        "elevation": elevation,
        "tithi_progress": (jd - tithi_start) / (tithi_end - tithi_start) if (tithi_end - tithi_start) > 0 else 0,
        "tithi_start": tithi_start,
        "tithi_end": tithi_end
    }
    
    # Calculate Quality Score
    panchang_result["quality_score"] = calculate_quality_score(panchang_result)
    
    return panchang_result

def calculate_quality_score(panchang):
    """
    Calculates a basic quality score (0-100) for the day based on Panchang elements.
    """
    score = 60 # Base score
    
    # 1. Tithi (Moon Phase)
    # Waxing is generally better for growth, Waning for letting go
    if "Shukla" in panchang.get("tithi", ""):
        score += 10
    
    # Avoid Rikta Tithis (4, 9, 14) roughly mapped
    tithi_name = panchang.get("tithi", "")
    if any(x in tithi_name for x in ["Chaturthi", "Navami", "Chaturdashi"]):
        score -= 15
        
    # 2. Yoga
    # Malefic Yogas
    bad_yogas = ["Vishkumbha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra", "Vyatipata", "Parigha", "Vaidhriti"]
    if panchang.get("yoga") in bad_yogas:
        score -= 15
    else:
        score += 5
        
    # 3. Karana
    # Vishti (Bhadra) is inauspicious
    if panchang.get("karana") == "Vishti":
        score -= 20
    if panchang.get("karana") in ["Shakuni", "Chatushpada", "Naga", "Kimstughna"]:
        score -= 10
        
    # 4. Weekday
    if panchang.get("day_lord") in ["Thursday", "Friday"]:
        score += 10
    elif panchang.get("day_lord") in ["Tuesday", "Saturday"]:
        score -= 5
        
    return max(0, min(100, score))

def get_lagna_journey(date_str, timezone_str, lat, lon):
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    start_jd = get_julian_day(date_str, "00:00", timezone_str)
    journey = []
    for i in range(145): # Every 10 mins including end of day
        jd = start_jd + (i * 10 / 1440.0)
        res_houses = swe.houses_ex(jd, lat, lon, b'P', swe.FLG_SIDEREAL)
        asc_sidereal = res_houses[0][0]
        journey.append({
            "time": i * 10,
            "sign_idx": int(asc_sidereal / 30),
            "sign": ZODIAC_SIGNS[int(asc_sidereal / 30)]
        })
    return journey

def get_timeline_segments(date_str, timezone_str, lat, lon):
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    start_jd = get_julian_day(date_str, "00:00", timezone_str)
    
    def get_segments(getter, names):
        segments = []
        last_idx = -1
        for i in range(289): # 5 min intervals
            jd = start_jd + (i * 5 / 1440.0)
            idx = getter(jd)
            if idx != last_idx:
                if segments:
                    segments[-1]["end"] = i * 5
                segments.append({
                    "name": names[idx],
                    "start": i * 5,
                    "end": 1440
                })
                last_idx = idx
        return segments

    return {
        "tithi": get_segments(get_tithi_idx, TITHIS),
        "nakshatra": get_segments(get_nakshatra_idx, NAKSHATRAS),
        "yoga": get_segments(get_yoga_idx, YOGAS),
        "karana": get_segments(get_karana_idx, KARANAS)
    }
async def calculate_panchang(date_str, time_str, timezone_str, latitude=12.97, longitude=77.59):
    """
    Calculates the Panchang. Uses external API if available for high precision.
    """
    # 1. Try external API
    birth_details = {
        "date": date_str,
        "time": time_str,
        "timezone": timezone_str,
        "latitude": latitude,
        "longitude": longitude
    }
    
    external_data = await astrology_api_service.get_panchang(birth_details)
    if external_data:
        logger.info("Successfully fetched Panchang from astrology-api.io")
        # Ensure it matches the expected return format
        result = {
            "tithi": external_data.get("tithi", ""),
            "nakshatra": external_data.get("nakshatra", ""),
            "yoga": external_data.get("yoga", ""),
            "karana": external_data.get("karana", ""),
            "sunrise": external_data.get("sunrise", ""),
            "sunset": external_data.get("sunset", ""),
            "day_of_week": datetime.strptime(date_str, "%d/%m/%Y").strftime("%A")
        }
        # Add day_lord alias and day_length
        result["day_lord"] = result["day_of_week"]
        # Calculate day_length if sunrise/sunset available
        try:
             rise = datetime.strptime(result["sunrise"], "%H:%M")
             set_time = datetime.strptime(result["sunset"], "%H:%M")
             # Handle crossing midnight if needed, but sunrise/sunset usually same day
             diff = set_time - rise
             hours = diff.seconds // 3600
             minutes = (diff.seconds % 3600) // 60
             result["day_length"] = f"{hours}h {minutes}m"
        except:
             result["day_length"] = "--h --m"

        result["quality_score"] = calculate_quality_score({
            "tithi": result["tithi"],
            "yoga": result["yoga"],
            "karana": result["karana"],
            "day_lord": result["day_of_week"]
        })
        return result

    # 2. Fallback to local calculation
    jd = get_julian_day(date_str, time_str, timezone_str)
    
    # Calculate start of day JD for rise/set calculations
    jd_start = get_julian_day(date_str, "00:00", timezone_str)
    
    data = get_panchang_data(jd, latitude, longitude, jd_start)
    
    # Return in legacy-compatible format
    # Format time with timezone offset
    rise_str = format_jd_to_time(data['sunrise'], timezone_str)
    set_str = format_jd_to_time(data['sunset'], timezone_str)
    
    result = {
        "tithi": data["tithi"],
        "nakshatra": data["nakshatra"],
        "yoga": data["yoga"],
        "karana": data["karana"],
        "sunrise": rise_str,
        "sunset": set_str,
        "day_of_week": datetime.strptime(date_str, "%d/%m/%Y").strftime("%A")
    }
    
    result["day_lord"] = result["day_of_week"]
    
    # Calculate day_length
    try:
         if data['sunrise'] and data['sunset']:
             # JD difference * 24 = hours
             diff_jd = data['sunset'] - data['sunrise']
             total_hours = diff_jd * 24
             hours = int(total_hours)
             minutes = int((total_hours - hours) * 60)
             result["day_length"] = f"{hours}h {minutes}m"
         else:
             result["day_length"] = "--h --m"
    except:
         result["day_length"] = "--h --m"

    result["quality_score"] = calculate_quality_score({
        "tithi": result["tithi"],
        "yoga": result["yoga"],
        "karana": result["karana"],
        "day_lord": result["day_of_week"]
    })
    return result

def format_jd_to_time(jd, timezone_str="+00:00"):
    if jd is None: return "--:--"
    
    # Parse timezone
    try:
        sign = 1 if timezone_str.startswith("+") else -1
        parts = timezone_str.strip("+-").split(":")
        hours = int(parts[0])
        minutes = int(parts[1]) if len(parts) > 1 else 0
        offset_hours = sign * (hours + minutes / 60.0)
    except:
        offset_hours = 0
        
    # Convert JD (UT) to Local JD
    jd_local = jd + (offset_hours / 24.0)
    
    # Convert to time
    # (JD + 0.5) fraction part gives time from midnight
    frac = (jd_local + 0.5) % 1.0
    total_seconds = frac * 86400
    
    h = int(total_seconds // 3600)
    m = int((total_seconds % 3600) // 60)
    
    return f"{h:02d}:{m:02d}"
