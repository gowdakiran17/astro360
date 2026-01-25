from typing import Dict, Any, List
from datetime import datetime, timedelta
import math
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.astrology.panchang import calculate_panchang, get_julian_day, get_tithi_idx, get_yoga_idx, get_karana_idx, TITHIS, YOGAS, KARANAS
from astro_app.backend.astrology.utils import get_nakshatra_pada, normalize_degree, get_zodiac_sign, get_nakshatra, ZODIAC_SIGNS, parse_timezone
from astro_app.backend.astrology.matching import RASHI_VARNA, RASHI_VASHYA, NAK_YONI, NAK_GANA, NAK_NADI, PLANET_LORDS
from astro_app.backend.astrology.dasha import NAKSHATRA_LORDS, DASHA_YEARS
import swisseph as swe

# Constants for Favourable Points
PLANET_GEMS = {
    "Sun": "Ruby", "Moon": "Pearl", "Mars": "Red Coral", "Mercury": "Emerald",
    "Jupiter": "Yellow Sapphire", "Venus": "Diamond", "Saturn": "Blue Sapphire",
    "Rahu": "Hessonite", "Ketu": "Cat's Eye"
}

PLANET_COLORS = {
    "Sun": "Orange/Red", "Moon": "White", "Mars": "Red", "Mercury": "Green",
    "Jupiter": "Yellow", "Venus": "White/Pink", "Saturn": "Blue/Black",
    "Rahu": "Smoke/Blue", "Ketu": "Smoke/Grey"
}

PLANET_DAYS = {
    "Sun": "Sunday", "Moon": "Monday", "Mars": "Tuesday", "Mercury": "Wednesday",
    "Jupiter": "Thursday", "Venus": "Friday", "Saturn": "Saturday",
    "Rahu": "Saturday", "Ketu": "Tuesday"
}

PLANET_METALS = {
    "Sun": "Copper", "Moon": "Silver", "Mars": "Copper", "Mercury": "Bronze",
    "Jupiter": "Gold", "Venus": "Silver", "Saturn": "Iron",
    "Rahu": "Lead", "Ketu": "Iron"
}

PAYA_MAPPING = {
    1: "Gold", 6: "Gold", 11: "Gold",
    2: "Silver", 5: "Silver", 9: "Silver",
    3: "Copper", 7: "Copper", 10: "Copper",
    4: "Iron", 8: "Iron", 12: "Iron"
}

# Ghatak Chakra Data (Expanded)
# Rashi -> {Month, Tithi, Day, Nakshatra, Yoga, Karana, Prahar, Moon, BadLagna, BadPlanets}
GHATAK_DATA = {
    "Aries": {"month": "Kartik", "tithi": "1, 6, 11", "day": "Sunday", "nakshatra": "Magha", "yoga": "Vishkumbha", "karana": "Bava", "prahar": "1", "moon": "Aries", "bad_lagna": "Aries", "bad_planets": "Saturn"},
    "Taurus": {"month": "Margashirsha", "tithi": "5, 10, 15", "day": "Saturday", "nakshatra": "Hasta", "yoga": "Atiganda", "karana": "Kaulava", "prahar": "2", "moon": "Virgo", "bad_lagna": "Virgo", "bad_planets": "Jupiter, Rahu, Ketu"},
    "Gemini": {"month": "Paush", "tithi": "2, 7, 12", "day": "Monday", "nakshatra": "Swati", "yoga": "Sukarma", "karana": "Taitila", "prahar": "3", "moon": "Aquarius", "bad_lagna": "Aquarius", "bad_planets": "Mars"},
    "Cancer": {"month": "Magha", "tithi": "3, 8, 13", "day": "Wednesday", "nakshatra": "Anuradha", "yoga": "Dhriti", "karana": "Gara", "prahar": "4", "moon": "Leo", "bad_lagna": "Leo", "bad_planets": "Venus"},
    "Leo": {"month": "Phalguna", "tithi": "4, 9, 14", "day": "Saturday", "nakshatra": "Mula", "yoga": "Shula", "karana": "Vanija", "prahar": "1", "moon": "Capricorn", "bad_lagna": "Capricorn", "bad_planets": "Saturn"},
    "Virgo": {"month": "Chaitra", "tithi": "5, 10, 15", "day": "Saturday", "nakshatra": "Shravana", "yoga": "Ganda", "karana": "Vishti", "prahar": "2", "moon": "Gemini", "bad_lagna": "Gemini", "bad_planets": "Mars"},
    "Libra": {"month": "Vaisakha", "tithi": "1, 6, 11", "day": "Thursday", "nakshatra": "Purva Bhadrapada", "yoga": "Vyaghata", "karana": "Shakuni", "prahar": "3", "moon": "Sagittarius", "bad_lagna": "Sagittarius", "bad_planets": "Sun"},
    "Scorpio": {"month": "Jyeshtha", "tithi": "2, 7, 12", "day": "Friday", "nakshatra": "Revati", "yoga": "Vajra", "karana": "Chatushpada", "prahar": "4", "moon": "Taurus", "bad_lagna": "Taurus", "bad_planets": "Venus"},
    "Sagittarius": {"month": "Ashadha", "tithi": "3, 8, 13", "day": "Friday", "nakshatra": "Rohini", "yoga": "Vyatipata", "karana": "Naga", "prahar": "1", "moon": "Pisces", "bad_lagna": "Pisces", "bad_planets": "Mercury"},
    "Capricorn": {"month": "Shravana", "tithi": "4, 9, 14", "day": "Tuesday", "nakshatra": "Punarvasu", "yoga": "Parigha", "karana": "Kimstughna", "prahar": "2", "moon": "Leo", "bad_lagna": "Leo", "bad_planets": "Moon"},
    "Aquarius": {"month": "Bhadrapada", "tithi": "5, 10, 15", "day": "Thursday", "nakshatra": "Ardra", "yoga": "Shiva", "karana": "Bava", "prahar": "3", "moon": "Cancer", "bad_lagna": "Cancer", "bad_planets": "Sun"},
    "Pisces": {"month": "Ashwin", "tithi": "1, 6, 11", "day": "Friday", "nakshatra": "Ashlesha", "yoga": "Siddha", "karana": "Kaulava", "prahar": "4", "moon": "Aquarius", "bad_lagna": "Aquarius", "bad_planets": "Mercury"}
}

def decimal_to_dms(deg):
    d = int(deg)
    m = int((deg - d) * 60)
    s = int(((deg - d) * 60 - m) * 60)
    return f"{d:02d}:{m:02d}:{s:02d}"

def decimal_time_to_str(hours):
    h = int(hours)
    m = int((hours - h) * 60)
    s = int(((hours - h) * 60 - m) * 60)
    return f"{h:02d}:{m:02d}:{s:02d}"

def get_basic_details(birth_details: Dict[str, Any]) -> Dict[str, Any]:
    # 1. Calculate Chart
    chart = calculate_chart(
        birth_details["date"],
        birth_details["time"],
        birth_details["timezone"],
        birth_details["latitude"],
        birth_details["longitude"]
    )
    
    # 2. Calculate Panchang (Birth Time)
    jd = get_julian_day(birth_details["date"], birth_details["time"], birth_details["timezone"])
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    
    t_idx = get_tithi_idx(jd)
    y_idx = get_yoga_idx(jd)
    k_idx = get_karana_idx(jd)
    
    tithi = TITHIS[t_idx]
    yoga = YOGAS[y_idx]
    karana = KARANAS[k_idx]
    
    # 3. Sun/Moon Details
    moon = next(p for p in chart['planets'] if p['name'] == 'Moon')
    sun = next(p for p in chart['planets'] if p['name'] == 'Sun')
    ascendant = chart['ascendant']
    
    moon_lon = moon['longitude']
    moon_sign = moon['zodiac_sign']
    moon_nak = moon['nakshatra']
    
    # Nakshatra Index for Lookups
    nak_span = 360 / 27
    nak_idx = int(normalize_degree(moon_lon) / nak_span)
    
    # Pada
    pada = get_nakshatra_pada(moon_lon)
    
    # Lords
    sign_lord = PLANET_LORDS.get(moon_sign, "Unknown")
    nak_lord = NAKSHATRA_LORDS[nak_idx]
    
    # Varna, Vashya, Yoni, Gana, Nadi
    varna_score = RASHI_VARNA.get(moon_sign, 0)
    VARNA_NAMES = {1: "Shudra", 2: "Vaishya", 3: "Kshatriya", 4: "Brahman"}
    varna = VARNA_NAMES.get(varna_score, "Unknown")
    
    vashya_score = RASHI_VASHYA.get(moon_sign, 0)
    VASHYA_NAMES = {1: "Chatushpada", 2: "Manava", 3: "Jalchar", 4: "Vanachar", 5: "Keeta"}
    vashya = VASHYA_NAMES.get(vashya_score, "Unknown")
    
    yoni_idx = NAK_YONI[nak_idx] # 1-14
    YONI_NAMES = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Lion", "Mongoose"]
    yoni = YONI_NAMES[yoni_idx - 1] if 1 <= yoni_idx <= 14 else "Unknown"
    
    gana_idx = NAK_GANA[nak_idx] # 1-3
    GANA_NAMES = ["Deva", "Manushya", "Rakshasa"]
    gana = GANA_NAMES[gana_idx - 1] if 1 <= gana_idx <= 3 else "Unknown"
    
    nadi_idx = NAK_NADI[nak_idx] # 1-3
    NADI_NAMES = ["Aadi", "Madhya", "Antya"]
    nadi = NADI_NAMES[nadi_idx - 1] if 1 <= nadi_idx <= 3 else "Unknown"
    
    # Paya
    asc_sign_idx = int(ascendant['longitude'] / 30)
    moon_sign_idx = int(moon_lon / 30)
    moon_house = (moon_sign_idx - asc_sign_idx + 12) % 12 + 1
    paya = PAYA_MAPPING.get(moon_house, "Unknown")
    
    # 4. Favourable Points
    lagna_sign = ascendant['zodiac_sign']
    lagna_lord = PLANET_LORDS.get(lagna_sign, "Mars")
    
    lucky_stone = PLANET_GEMS.get(lagna_lord, "Unknown")
    lucky_color = PLANET_COLORS.get(lagna_lord, "Unknown")
    lucky_day = PLANET_DAYS.get(lagna_lord, "Unknown")
    lucky_metal = PLANET_METALS.get(lagna_lord, "Unknown")
    
    day_of_birth_num = int(birth_details["date"].split("/")[0])
    def get_root_number(n):
        while n > 9:
            n = sum(int(d) for d in str(n))
        return n
    lucky_number = get_root_number(day_of_birth_num)
    
    # Simple Numerology Logic
    FRIENDLY_NUMBERS = {
        1: [1, 2, 3, 5, 9], 2: [1, 2, 3, 5], 3: [1, 2, 3, 9], 4: [4, 5, 6, 8],
        5: [1, 2, 5, 6, 8], 6: [4, 5, 6, 8], 7: [1, 2, 7, 9], 8: [4, 5, 6, 8], 9: [1, 2, 3, 7, 9]
    }
    EVIL_NUMBERS = {
        1: [4, 6, 8], 2: [4, 6, 8], 3: [6, 8], 4: [1, 2, 7, 9],
        5: [], 6: [1, 2, 7, 9], 7: [4, 6, 8], 8: [1, 2, 7, 9], 9: [4, 6, 8]
    }
    
    good_numbers = ", ".join(map(str, FRIENDLY_NUMBERS.get(lucky_number, [])))
    evil_numbers = ", ".join(map(str, EVIL_NUMBERS.get(lucky_number, [])))
    
    good_years = "18, 27, 36, 45" # Placeholder logic
    
    # Friendly Signs (Triad from Lagna)
    trine_1 = lagna_sign
    trine_2 = ZODIAC_SIGNS[(asc_sign_idx + 4) % 12]
    trine_3 = ZODIAC_SIGNS[(asc_sign_idx + 8) % 12]
    friendly_signs = f"{trine_1}, {trine_2}, {trine_3}"
    
    good_lagna = f"{trine_2}, {trine_3}"
    
    # 5. Ghatak Chakra
    ghatak = GHATAK_DATA.get(moon_sign, {})
    
    # 6. Person Details (Advanced)
    # Sunrise/Sunset
    geopos = (birth_details["longitude"], birth_details["latitude"], 0)
    res_rise = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, geopos, 0, 0, swe.FLG_SWIEPH)
    res_set = swe.rise_trans(jd, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, geopos, 0, 0, swe.FLG_SWIEPH)
    
    sunrise_jd = res_rise[1][0] if res_rise[0] == 0 else jd
    sunset_jd = res_set[1][0] if res_set[0] == 0 else jd
    
    # Convert JD to Time String (Local)
    def jd_to_time_str(j, tz_offset):
        dt_utc = swe.jdut1_to_utc(j, swe.GREG_CAL) # Y, M, D, H, M, S
        # Fraction of hour to H, M, S
        hour_fraction = dt_utc[3] + (dt_utc[4]/60.0) + (dt_utc[5]/3600.0)
        # Add timezone
        local_hour = (hour_fraction + parse_timezone(tz_offset)) % 24
        return decimal_time_to_str(local_hour)

    sunrise_str = jd_to_time_str(sunrise_jd, birth_details["timezone"])
    sunset_str = jd_to_time_str(sunset_jd, birth_details["timezone"])
    
    # Day Duration
    day_len_hours = (sunset_jd - sunrise_jd) * 24
    day_duration_str = decimal_time_to_str(day_len_hours)
    
    # Ishtkaal (Birth Time - Sunrise) * 2.5
    # Birth Time as fraction of day
    birth_h, birth_m = map(int, birth_details["time"].split(":"))
    birth_time_fraction = birth_h + (birth_m / 60.0)
    
    # Sunrise as fraction of day (Local)
    sunrise_local_h = int(sunrise_str.split(":")[0]) + (int(sunrise_str.split(":")[1])/60.0) + (int(sunrise_str.split(":")[2])/3600.0)
    
    diff_hours = birth_time_fraction - sunrise_local_h
    if diff_hours < 0: diff_hours += 24
    ishtkaal_val = diff_hours * 2.5 # Ghati
    ishtkaal_str = f"{int(ishtkaal_val)}:{int((ishtkaal_val - int(ishtkaal_val))*60)}"
    
    # Hindu Week Day
    # If birth before sunrise, it's previous day
    birth_dt = datetime.strptime(f"{birth_details['date']} {birth_details['time']}", "%d/%m/%Y %H:%M")
    day_name = birth_dt.strftime("%A")
    if birth_time_fraction < sunrise_local_h:
        prev_day = birth_dt - timedelta(days=1)
        hindu_weekday = prev_day.strftime("%A")
    else:
        hindu_weekday = day_name
        
    # Paksha
    paksha = "Shukla" if t_idx < 15 else "Krishna"
    
    # LMT, GMT
    # LMT = GMT + (Longitude/15) hours
    # GMT = Local - Timezone
    tz = parse_timezone(birth_details["timezone"])
    gmt_time = birth_time_fraction - tz
    lmt_offset = (birth_details["longitude"] / 15.0)
    lmt_time = gmt_time + lmt_offset
    
    lmt_str = decimal_time_to_str(lmt_time % 24)
    gmt_str = decimal_time_to_str(gmt_time % 24)
    
    # 7. Avkahada Extended
    ayanamsa_val = swe.get_ayanamsa_ut(jd)
    ayanamsa_str = decimal_to_dms(ayanamsa_val)
    
    # Western Sun Sign (Tropical)
    sun_lon_tropical = (sun['longitude'] + ayanamsa_val) % 360
    sun_sign_western = get_zodiac_sign(sun_lon_tropical)
    
    obliquity_val = swe.calc_ut(jd, swe.ECL_NUT)[0][1]
    obliquity_str = decimal_to_dms(obliquity_val)
    
    sidereal_val = swe.sidtime(jd)
    sidereal_str = decimal_time_to_str(sidereal_val)
    
    # Balance of Dasha
    # Degree traversed in Nakshatra
    nak_start = nak_idx * (360/27)
    traversed = moon_lon - nak_start
    total_nak_len = 360/27
    remaining_fraction = 1 - (traversed / total_nak_len)
    
    dasha_lord = NAKSHATRA_LORDS[nak_idx]
    total_years = DASHA_YEARS[dasha_lord]
    balance_years = total_years * remaining_fraction
    
    b_y = int(balance_years)
    b_m = int((balance_years - b_y) * 12)
    b_d = int(((balance_years - b_y) * 12 - b_m) * 30)
    balance_dasha = f"{dasha_lord.upper()} {b_y} Y {b_m} M {b_d} D"
    
    # LMT Correction (Standard Time - LMT)
    # LMT = GMT + Lon/15
    # Std Time = GMT + TZ
    # Diff = LMT - Std Time = (GMT + Lon/15) - (GMT + TZ) = Lon/15 - TZ
    lmt_correction_hours = (birth_details["longitude"] / 15.0) - parse_timezone(birth_details["timezone"])
    lmt_correction_str = decimal_time_to_str(abs(lmt_correction_hours))
    if lmt_correction_hours < 0:
        lmt_correction_str = "-" + lmt_correction_str
    else:
        lmt_correction_str = "+" + lmt_correction_str

    # Lucky God Mapping
    PLANET_DEITIES = {
        "Sun": "Shiva", "Moon": "Parvati", "Mars": "Hanuman", "Mercury": "Vishnu",
        "Jupiter": "Brahma", "Venus": "Lakshmi", "Saturn": "Bhairav",
        "Rahu": "Saraswati", "Ketu": "Ganesha"
    }
    lucky_god = PLANET_DEITIES.get(lagna_lord, "Unknown")

    return {
        "person_details": {
            "sex": "Male", # Placeholder or from profile
            "date_of_birth": birth_details["date"],
            "time_of_birth": birth_details["time"],
            "day_of_birth": day_name,
            "hindu_week_day": hindu_weekday,
            "ishtkaal": ishtkaal_str,
            "place_of_birth": "Unknown", # Requires geocoding or input
            "timezone": str(birth_details["timezone"]),
            "latitude": f"{birth_details['latitude']:.2f}",
            "longitude": f"{birth_details['longitude']:.2f}",
            "lmt_correction": lmt_correction_str,
            "local_mean_time": lmt_str,
            "sidereal_time": sidereal_str,
            "julian_day": f"{jd:.2f}",
            "ayanamsa": ayanamsa_str,
            "ayanamsa_name": "Lahiri",
            "sunrise": sunrise_str,
            "sunset": sunset_str,
            "day_duration": day_duration_str
        },
        "avkahada": {
            "paya": paya,
            "varna": varna,
            "yoni": yoni,
            "gana": gana,
            "vashya": vashya,
            "nadi": nadi,
            "balance_of_dasha": balance_dasha,
            "lagna": lagna_sign,
            "lagna_lord": lagna_lord,
            "sign": moon_sign,
            "sign_lord": sign_lord,
            "nakshatra": moon_nak,
            "charan": pada,
            "nakshatra_lord": nak_lord,
            "julian_day": f"{jd:.2f}",
            "sun_sign": sun['zodiac_sign'],
            "sun_sign_western": sun_sign_western,
            "ayanamsa": ayanamsa_str,
            "ayanamsa_name": "Lahiri",
            "obliquity": obliquity_str,
            "sidereal_time": sidereal_str
        },
        "favourable": {
            "lucky_number": str(lucky_number),
            "best_numbers": good_numbers,
            "evil_numbers": evil_numbers,
            "good_years": good_years,
            "lucky_day": lucky_day,
            "lucky_color": lucky_color,
            "lucky_stone": lucky_stone,
            "lucky_god": lucky_god,
            "lucky_metal": lucky_metal,
            "lagna": lagna_sign,
            "lagna_lord": lagna_lord,
            "rashi": moon_sign,
            "rashi_lord": sign_lord
        },
        "ghatak": ghatak
    }
