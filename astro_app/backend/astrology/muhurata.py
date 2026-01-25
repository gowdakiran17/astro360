import swisseph as swe
from datetime import datetime, timedelta
from .utils import get_julian_day

# Constants for Muhuratas
DAY_MUHURATAS = [
    ("Rudra", "Poor"), ("Ahi", "Avoid"), ("Mitra", "Good"), ("Pitru", "Poor"),
    ("Vasu", "Good"), ("Vara", "Excellent"), ("Vishwadev", "Excellent"), ("Vidhi", "Excellent"),
    ("Satamukhi", "Good"), ("Puruhuta", "Good"), ("Vahini", "Poor"), ("Naktanchara", "Avoid"),
    ("Varuna", "Good"), ("Aryaman", "Good"), ("Bhaga", "Poor")
]

NIGHT_MUHURATAS = [
    ("Girisha", "Good"), ("Ajapada", "Poor"), ("Ahirbudhnya", "Good"), ("Pashu", "Poor"),
    ("Yama", "Avoid"), ("Yamyagni", "Avoid"), ("Shambara", "Poor"), ("Varada", "Good"),
    ("Nala", "Poor"), ("Ajirak", "Poor"), ("Jiva", "Excellent"), ("Amrita", "Excellent"),
    ("Brahma", "Excellent"), ("Vishnu", "Excellent"), ("Shiva", "Excellent")
]

CHOGHADIYA_LABELS = {
    "Udveg": ("Udveg", "Avoid", "Sun"),
    "Chal": ("Chal", "Poor", "Venus"),
    "Labh": ("Labh", "Good", "Mercury"),
    "Amrit": ("Amrit", "Excellent", "Moon"),
    "Kaal": ("Kaal", "Avoid", "Saturn"),
    "Shubh": ("Shubh", "Good", "Jupiter"),
    "Rog": ("Rog", "Avoid", "Mars")
}

# Day Choghadiya sequence by weekday (Sun=0)
DAY_CHOGHADIYA_SEQ = [
    ["Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],   # Sun
    ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit"],   # Mon
    ["Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],     # Tue
    ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh"],    # Wed
    ["Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal", "Shubh"],   # Thu
    ["Chal", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Chal"],    # Fri
    ["Kaal", "Shubh", "Rog", "Udveg", "Chal", "Labh", "Amrit", "Kaal"],    # Sat
]

NIGHT_CHOGHADIYA_SEQ = [
    ["Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh"],  # Sun
    ["Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal"],  # Mon
    ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal"],  # Tue
    ["Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg"],  # Wed
    ["Amrit", "Chal", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"],  # Thu
    ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog"],    # Fri
    ["Labh", "Udveg", "Shubh", "Amrit", "Chal", "Rog", "Kaal", "Labh"]    # Sat
]

HORA_SEQUENCE = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"]

PLANET_QUALITY = {
    "Jupiter": "Excellent",
    "Venus": "Good",
    "Moon": "Good",
    "Mercury": "Good",
    "Sun": "Poor",
    "Saturn": "Avoid",
    "Mars": "Avoid"
}

def get_muhurata_data(jd, lat, lon):
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    geopos = (lon, lat, 0)
    flags = swe.FLG_SWIEPH
    
    # Sun events for current day
    # swe.rise_trans(jd, body, rsmi, geopos, press, temp, flags)
    res_rise = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, flags)
    sunrise = res_rise[1][0] if res_rise[0] == 0 else jd
    
    res_set = swe.rise_trans(jd, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, flags)
    sunset = res_set[1][0] if res_set[0] == 0 else jd + 0.5
    
    # Next sunrise for night calculations
    res_next_rise = swe.rise_trans(jd + 1, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, flags)
    next_sunrise = res_next_rise[1][0] if res_next_rise[0] == 0 else jd + 1.0
    
    day_duration = sunset - sunrise
    night_duration = next_sunrise - sunset
    
    # If duration is negative or zero, fallback to standard 12h
    if day_duration <= 0: day_duration = 0.5
    if night_duration <= 0: night_duration = 0.5

    weekday = (int(jd + 1.5) % 7) # Sunday=0
    
    periods = []
    
    # 1. Choghadiya (16 periods)
    day_ch_seq = DAY_CHOGHADIYA_SEQ[weekday]
    part_day = day_duration / 8
    for i in range(8):
        label = day_ch_seq[i]
        name, quality, ruler = CHOGHADIYA_LABELS[label]
        periods.append({
            "name": f"Day {name}",
            "type": "Choghadiya",
            "start": sunrise + (i * part_day),
            "end": sunrise + ((i+1) * part_day),
            "quality": quality,
            "ruler": ruler
        })
        
    night_ch_seq = NIGHT_CHOGHADIYA_SEQ[weekday]
    part_night = night_duration / 8
    for i in range(8):
        label = night_ch_seq[i]
        name, quality, ruler = CHOGHADIYA_LABELS[label]
        periods.append({
            "name": f"Night {name}",
            "type": "Choghadiya",
            "start": sunset + (i * part_night),
            "end": sunset + ((i+1) * part_night),
            "quality": quality,
            "ruler": ruler
        })

    # 2. Hora (24 periods)
    # Day rulers start index
    day_lords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    day_lord_name = day_lords[weekday]
    start_idx = HORA_SEQUENCE.index(day_lord_name)
    
    part_hora_day = day_duration / 12
    # The day has 12 horas, and night has 12 horas.
    # Total 24 horas from sunrise to next sunrise.
    for i in range(24):
        p_idx = (start_idx + i) % 7
        ruler = HORA_SEQUENCE[p_idx]
        hr_start = sunrise + (i * (day_duration/12)) if i < 12 else sunset + ((i-12) * (night_duration/12))
        hr_end = sunrise + ((i+1) * (day_duration/12)) if i < 12 else sunset + ((i-11) * (night_duration/12))
        
        periods.append({
            "name": f"{ruler} Hora",
            "type": "Hora",
            "start": hr_start,
            "end": hr_end,
            "quality": PLANET_QUALITY[ruler],
            "ruler": ruler
        })

    # 3. Vedic Muhuratas (30 periods)
    part_muhurata_day = day_duration / 15
    for i, (name, qual) in enumerate(DAY_MUHURATAS):
        periods.append({
            "name": name,
            "type": "Vedic Muhurata",
            "start": sunrise + (i * part_muhurata_day),
            "end": sunrise + ((i+1) * part_muhurata_day),
            "quality": qual
        })
        
    part_muhurata_night = night_duration / 15
    for i, (name, qual) in enumerate(NIGHT_MUHURATAS):
        periods.append({
            "name": name,
            "type": "Vedic Muhurata",
            "start": sunset + (i * part_muhurata_night),
            "end": sunset + ((i+1) * part_muhurata_night),
            "quality": qual
        })

    # 4. Special Periods (Rahu Kaal, Yamaganda, Gulika)
    # Rahu Kaal Day sequence
    rahu_parts = [8, 2, 7, 5, 6, 4, 3] # Sun=0...Sat=6
    rahu_part = rahu_parts[weekday]
    periods.append({
        "name": "Rahu Kaal",
        "type": "Special",
        "start": sunrise + ((rahu_part - 1) * (day_duration/8)),
        "end": sunrise + (rahu_part * (day_duration/8)),
        "quality": "Avoid"
    })
    
    yamaganda_parts = [5, 4, 3, 2, 1, 7, 6]
    yama_part = yamaganda_parts[weekday]
    periods.append({
        "name": "Yamaganda",
        "type": "Special",
        "start": sunrise + ((yama_part - 1) * (day_duration/8)),
        "end": sunrise + (yama_part * (day_duration/8)),
        "quality": "Avoid"
    })
    
    gulika_parts = [7, 6, 5, 4, 3, 2, 1]
    guli_part = gulika_parts[weekday]
    periods.append({
        "name": "Gulika Kaal",
        "type": "Special",
        "start": sunrise + ((guli_part - 1) * (day_duration/8)),
        "end": sunrise + (guli_part * (day_duration/8)),
        "quality": "Poor"
    })

    # Abhijit Muhurata (Special designation for the 8th Muhurata of the day)
    # It's already in the Vedic Muhurata list as Vidhi/Vara? No, Abhijit is usually around solar noon.
    # 8th is 11:36 - 12:24 if day is 12h.
    # Abhijit is effectively the 8th muhurata (Vidhi/Abhijit) of the day.
    abhijit_start = sunrise + (7 * part_muhurata_day)
    abhijit_end = sunrise + (8 * part_muhurata_day)
    periods.append({
        "name": "Abhijit Muhurata",
        "type": "Special",
        "start": abhijit_start,
        "end": abhijit_end,
        "quality": "Excellent" # Golden Moment
    })
    
    def jd_to_time_str(jd_val):
        """Helper to convert JD decimal to HH:MM AM/PM"""
        # JD fractional part is time. 0.5 is midnight.
        # Simple extraction for local display (assuming JD is in target TZ or relative)
        # 1.0 = 24 hours. 0.04166... = 1 hour.
        # Add 0.5 to shift JD start from noon to midnight for easier math
        t = (jd_val + 0.5) % 1.0
        total_minutes = int(t * 1440)
        h = (total_minutes // 60) % 24
        m = total_minutes % 60
        ampm = "AM" if h < 12 else "PM"
        h_disp = h if 0 < h <= 12 else (12 if h == 0 else h - 12)
        return f"{h_disp:02d}:{m:02d} {ampm}"

    # Sort periods and add formatted times
    sorted_periods = sorted(periods, key=lambda x: x["start"])
    for p in sorted_periods:
        p["start_time"] = jd_to_time_str(p["start"])
        p["end_time"] = jd_to_time_str(p["end"])
    
    return {
        "periods": sorted_periods,
        "sunrise": sunrise,
        "sunset": sunset,
        "next_sunrise": next_sunrise,
        "summary": {
            "Excellent": len([p for p in periods if p["quality"] == "Excellent"]),
            "Good": len([p for p in periods if p["quality"] == "Good"]),
            "Poor": len([p for p in periods if p["quality"] == "Poor"]),
            "Avoid": len([p for p in periods if p["quality"] == "Avoid"])
        }
    }
