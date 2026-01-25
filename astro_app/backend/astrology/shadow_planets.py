import swisseph as swe
from datetime import datetime, timedelta
from .utils import calculate_ascendant, get_julian_day

def calculate_aprakasha_grahas(sun_longitude: float):
    """
    Calculates the 5 Non-luminous planets (Aprakasha Grahas).
    """
    # 1. Dhoom: Sun + 133° 20'
    dhoom = (sun_longitude + 133.333333) % 360
    
    # 2. Vyatipata: 360° - Dhoom
    vyatipata = (360 - dhoom) % 360
    
    # 3. Parivesha: Vyatipata + 180°
    parivesha = (vyatipata + 180) % 360
    
    # 4. Indrachapa: 360° - Parivesha
    indrachapa = (360 - parivesha) % 360
    
    # 5. Upaketu: Indrachapa + 16° 40'
    upaketu = (indrachapa + 16.666667) % 360
    
    return {
        "Dhoom": dhoom,
        "Vyatipata": vyatipata,
        "Parivesha": parivesha,
        "Indrachapa": indrachapa,
        "Upaketu": upaketu
    }

def calculate_upagrahas(jd: float, lat: float, lon: float, t_offset: float):
    """
    Calculates the Upagrahas (Secondary planets).
    Gulika, Mandi, Yamaghantaka, Ardhaprahara, Kaala, Mrityu.
    """
    # 1. Get Sunrise and Sunset
    # swe.rise_trans returns (success, rise_time, trans_time, set_time) in UTC
    # We use swe.RISE | swe.BIT_DISC_CENTER for standard sunrise
    
    # Simple sunrise/sunset approximation or use swe.rise_trans
    # For speed and precision, we use swe.rise_trans
    
    # Calculate for the day of JD
    # We need to know if it's day or night birth
    
    # swe.rise_trans(jd, body, lon, lat, alt, press, temp, calc_flag, eph_flag)
    res = swe.rise_trans(jd, swe.SUN, lon, lat, 0, 0, 0, swe.CALC_RISE | swe.BIT_DISC_CENTER, swe.FLG_SWIEPH)
    sunrise_utc = res[1][0]
    
    res = swe.rise_trans(jd, swe.SUN, lon, lat, 0, 0, 0, swe.CALC_SET | swe.BIT_DISC_CENTER, swe.FLG_SWIEPH)
    sunset_utc = res[1][0]
    
    # Determine birth time in UTC
    birth_utc = jd
    
    is_day = sunrise_utc <= birth_utc <= sunset_utc
    
    if not is_day and birth_utc < sunrise_utc:
        # Birth before sunrise, use previous sunset
        res_prev = swe.rise_trans(jd - 1, swe.SUN, lon, lat, 0, 0, 0, swe.CALC_SET | swe.BIT_DISC_CENTER, swe.FLG_SWIEPH)
        sunset_utc = res_prev[1][0]
        # Current sunrise stays the same
        period_start = sunset_utc
        period_end = sunrise_utc
    elif not is_day and birth_utc > sunset_utc:
        # Birth after sunset, use next sunrise
        res_next = swe.rise_trans(jd + 1, swe.SUN, lon, lat, 0, 0, 0, swe.CALC_RISE | swe.BIT_DISC_CENTER, swe.FLG_SWIEPH)
        sunrise_next_utc = res_next[1][0]
        period_start = sunset_utc
        period_end = sunrise_next_utc
    else:
        period_start = sunrise_utc
        period_end = sunset_utc

    duration = period_end - period_start
    part_duration = duration / 8.0
    
    # SWISSEPH: swe.day_of_week(jd) returns 0..6 (0=Monday, 1=Tuesday... 6=Sunday)
    wd_swe = swe.day_of_week(jd)
    # Weekday mapping: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    # We want 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    weekday = (wd_swe + 1) % 7
    
    # Planet order: Sun=0, Mon=1, Mar=2, Mer=3, Jup=4, Ven=5, Sat=6
    
    if is_day:
        start_idx = weekday
    else:
        # Night starts with the ruler of the 5th day from the day ruler
        start_idx = (weekday + 4) % 7
        
    part_lords = []
    for i in range(7):
        part_lords.append((start_idx + i) % 7)
    
    # Upagraha mappings:
    # Kaala: Sun (0)
    # Gulika: Saturn (6)
    # Mandi: Saturn (6)
    # Yamaghantaka: Jupiter (4)
    # Ardhaprahara: Mercury (3)
    # Mrityu: Mars (2)
    
    mappings = {
        0: "Kaala",
        2: "Mrityu",
        3: "Ardhaprahara",
        4: "Yamaghantaka",
        6: "Gulika"
    }
    
    upagrahas = {}
    
    for i, lord in enumerate(part_lords):
        if lord in mappings:
            # Calculate Lagna at start of this part
            part_start_jd = period_start + (i * part_duration)
            lagna = calculate_ascendant(part_start_jd, lat, lon)
            upagrahas[mappings[lord]] = lagna
            
    # Mandi logic: often same as Gulika or slightly offset. 
    # Reference image has them identical.
    if "Gulika" in upagrahas:
        upagrahas["Mandi"] = upagrahas["Gulika"]
        
    return upagrahas

def calculate_shadow_planets(jd: float, lat: float, lon: float, t_offset: float):
    # Set Sidereal Mode
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    
    # Get Sidereal Sun longitude for Aprakasha Grahas
    # Aprakasha Grahas are calculated FROM the Nirayana Sun
    res = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
    sun_long = res[0][0]
    
    aprakasha = calculate_aprakasha_grahas(sun_long)
    upagrahas = calculate_upagrahas(jd, lat, lon, t_offset)
    
    # Merge and format
    results = {}
    
    # Mapping to Symbols
    symbols = {
        "Dhoom": "Dh",
        "Vyatipata": "Vy",
        "Parivesha": "Pv",
        "Indrachapa": "In",
        "Upaketu": "Up",
        "Gulika": "Gu",
        "Yamaghantaka": "Ya",
        "Ardhaprahara": "Ar",
        "Kaala": "Ka",
        "Mrityu": "Mr",
        "Mandi": "Ma"
    }
    
    combined = {**aprakasha, **upagrahas}
    
    final = []
    for name, long in combined.items():
        # Get Sign and Degree
        sign_idx = int(long / 30)
        deg_in_sign = long % 30
        
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        
        # DMS formatting
        d = int(deg_in_sign)
        m = int((deg_in_sign - d) * 60)
        s = int(((deg_in_sign - d) * 60 - m) * 60)
        
        final.append({
            "name": name,
            "symbol": symbols.get(name, ""),
            "longitude": long,
            "sign": signs[sign_idx],
            "sign_idx": sign_idx,
            "degree": f"{d}° {m}' {s}\"",
            "deg_in_sign": deg_in_sign
        })
        
    return final
