from datetime import datetime, timedelta
import math
from astro_app.backend.astrology.external_api import astrology_api_service
from typing import Optional, Dict, Any, List
import logging
import swisseph as swe
from astro_app.backend.astrology.utils import get_julian_day, get_nakshatra_idx_and_fraction, normalize_degree

logger = logging.getLogger(__name__)

# Constants
DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
DASHA_YEARS = {
    'Ketu': 7, 
    'Venus': 20, 
    'Sun': 6, 
    'Moon': 10, 
    'Mars': 7, 
    'Rahu': 18, 
    'Jupiter': 16, 
    'Saturn': 19, 
    'Mercury': 17
}

# Nakshatra Lords (0 to 26)
NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
]

AYANAMSA_MAP = {
    "LAHIRI": swe.SIDM_LAHIRI,
    "RAMAN": swe.SIDM_RAMAN,
    "KP": swe.SIDM_KRISHNAMURTI,
    "FAGAN_BRADLEY": swe.SIDM_FAGAN_BRADLEY,
    "YUKTESHWAR": swe.SIDM_YUKTESHWAR
}

def add_years(d: datetime, years: float) -> datetime:
    """Adds years to a date, handling leap years and fractions."""
    try:
        y = int(years)
        fraction = years - y
        days = fraction * 365.242199 # More precise tropical year length
        
        new_year = d.year + y
        # Handle leap year edge case
        try:
            new_date = d.replace(year=new_year)
        except ValueError:
            # Feb 29 to non-leap year -> Feb 28
            new_date = d.replace(year=new_year, day=28, month=2)
            
        final_date = new_date + timedelta(days=days)
        return final_date
    except Exception as e:
        logger.error(f"Error adding years: {e}")
        return d

def get_sub_period_duration(lord: str, parent_years: float) -> float:
    """Calculates sub-period duration in years."""
    lord_years = DASHA_YEARS[lord]
    return (parent_years * lord_years) / 120.0

def generate_sub_periods(parent_lord: str, start_date: datetime, parent_duration: float, level: int, target_date: datetime = None) -> List[Dict]:
    """
    Recursively generates sub-periods.
    level 1 = AD, 2 = PD, 3 = SD, 4 = PAD
    """
    if level > 4: # Stop after Prana (PAD)
        return []
        
    start_index = DASHA_ORDER.index(parent_lord)
    sub_periods = []
    current_start = start_date
    
    # We only generate deep levels (SD, PAD) if they contain the target_date (Current Moment)
    # or if strictly requested (not implemented to avoid explosion)
    
    for i in range(9):
        idx = (start_index + i) % 9
        lord = DASHA_ORDER[idx]
        
        duration = get_sub_period_duration(lord, parent_duration)
        end_date = add_years(current_start, duration)
        
        is_current = False
        if target_date:
            is_current = current_start <= target_date < end_date
            
        # Calculate progress if current
        progress_percent = 0
        time_remaining = ""
        
        if is_current and target_date:
            total_duration_days = (end_date - current_start).total_seconds() / 86400
            elapsed_days = (target_date - current_start).total_seconds() / 86400
            progress_percent = max(0, min(100, (elapsed_days / total_duration_days) * 100))
            
            remaining_days = total_duration_days - elapsed_days
            years_rem = int(remaining_days / 365)
            months_rem = int((remaining_days % 365) / 30)
            days_rem = int((remaining_days % 365) % 30)
            
            parts = []
            if years_rem > 0: parts.append(f"{years_rem}y")
            if months_rem > 0: parts.append(f"{months_rem}m")
            if days_rem > 0: parts.append(f"{days_rem}d")
            time_remaining = " ".join(parts) if parts else "ending soon"

        period_data = {
            "lord": lord,
            "start_date": current_start.strftime("%d %b %Y"), 
            "end_date": end_date.strftime("%d %b %Y"),
            "full_start": current_start.strftime("%d %b %Y %H:%M"),
            "full_end": end_date.strftime("%d %b %Y %H:%M"),
            "is_current": is_current,
            "level": level,
            "duration_years": duration,
            "progress_percent": round(progress_percent, 1),
            "time_remaining": time_remaining
        }
        
        # Recurse logic
        # Always generate AD (Level 1)
        # Always generate PD (Level 2)
        # Generate SD (Level 3) only if is_current
        # Generate PAD (Level 4) only if is_current
        
        should_recurse = False
        if level == 1: # Generating Antardashas
            should_recurse = True # Generate Pratyantardashas for all
        elif level == 2: # Generating Pratyantardashas
            if is_current: should_recurse = True
        elif level == 3: # Generating Sookshma
            if is_current: should_recurse = True
            
        if should_recurse:
            next_level_key = "sub_periods"
            if level == 1: next_level_key = "pratyantardashas"
            elif level == 2: next_level_key = "sookshma_dashas"
            elif level == 3: next_level_key = "prana_dashas"
            
            period_data[next_level_key] = generate_sub_periods(lord, current_start, duration, level + 1, target_date)
            
        sub_periods.append(period_data)
        current_start = end_date
        
    return sub_periods

async def calculate_vimshottari_dasha(
    date_str: str, 
    time_str: str, 
    timezone_str: str, 
    latitude: float, 
    longitude: float,
    moon_longitude: Optional[float] = None,
    ayanamsa: str = "LAHIRI"
):
    """
    Calculates Vimshottari Dasha with high precision (Mahadasha to Prana).
    """
    
    # 1. Calculate Julian Day
    birth_jd = get_julian_day(date_str, time_str, timezone_str)
    
    # 2. Calculate Moon Longitude if not provided
    if moon_longitude is None:
        swe_ayanamsa = AYANAMSA_MAP.get(ayanamsa.upper(), swe.SIDM_LAHIRI)
        swe.set_sid_mode(swe_ayanamsa, 0, 0)
        res = swe.calc_ut(birth_jd, swe.MOON, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        moon_longitude = res[0][0]
        
    # 3. Determine Nakshatra and Balance
    # Nakshatra extent is 13deg 20min = 13.3333... degrees
    nak_extent = 13.0 + (20.0/60.0)
    nak_idx = int(moon_longitude / nak_extent)
    nak_fraction_traversed = (moon_longitude % nak_extent) / nak_extent
    fraction_remaining = 1.0 - nak_fraction_traversed
    
    first_lord = NAKSHATRA_LORDS[nak_idx]
    first_lord_years = DASHA_YEARS[first_lord]
    balance_years = first_lord_years * fraction_remaining
    
    # 4. Calculate Hypothetical Start Date
    # The date when the first Mahadasha effectively started
    years_elapsed = first_lord_years * nak_fraction_traversed
    
    # Parse Birth DateTime
    dt_str = f"{date_str} {time_str}"
    birth_dt = datetime.strptime(dt_str, "%d/%m/%Y %H:%M")
    
    # Subtract years_elapsed from birth_dt to get hypothetical start
    # Since add_years adds, we need subtract_years logic or just negative add
    hypothetical_start = add_years(birth_dt, -years_elapsed)
    
    # 5. Generate Timeline
    dashas = []
    first_lord_idx = DASHA_ORDER.index(first_lord)
    
    current_start = hypothetical_start
    now = datetime.now()
    
    summary = {
        "current_mahadasha": None,
        "current_antardasha": None,
        "current_pratyantardasha": None,
        "current_sookshma": None,
        "current_prana": None
    }
    
    # We iterate through the 120 year cycle starting from the first lord
    # Note: A full cycle is 120 years. 
    # If the person lives > 120, the cycle repeats.
    # We will generate for 120 years from birth (approx) or just the standard sequence.
    # Standard is to list the sequence starting from Birth Nakshatra Lord.
    
    for i in range(9):
        lord = DASHA_ORDER[(first_lord_idx + i) % 9]
        duration = DASHA_YEARS[lord]
        end_date = add_years(current_start, duration)
        
        # Check if this MD overlaps with life (Birth to Birth+120)
        # Actually we just list them.
        
        # Check if current time falls in this MD
        is_current_md = current_start <= now < end_date
        
        md_data = {
            "lord": lord,
            "start_date": current_start.strftime("%d %b %Y"),
            "end_date": end_date.strftime("%d %b %Y"),
            "duration_years": duration,
            "is_current": is_current_md,
            "antardashas": []
        }

        if is_current_md:
            # Calculate progress for MD
            total_duration_days = (end_date - current_start).total_seconds() / 86400
            elapsed_days = (now - current_start).total_seconds() / 86400
            progress_percent = max(0, min(100, (elapsed_days / total_duration_days) * 100))
            
            remaining_days = total_duration_days - elapsed_days
            years_rem = int(remaining_days / 365)
            months_rem = int((remaining_days % 365) / 30)
            days_rem = int((remaining_days % 365) % 30)
            
            parts = []
            if years_rem > 0: parts.append(f"{years_rem}y")
            if months_rem > 0: parts.append(f"{months_rem}m")
            if days_rem > 0: parts.append(f"{days_rem}d")
            time_remaining = " ".join(parts) if parts else "ending soon"

            md_data["progress_percent"] = round(progress_percent, 1)
            md_data["time_remaining"] = time_remaining
            
            summary["current_mahadasha"] = md_data
        
        # Generate ADs (Level 1)
        # This will recursively generate PDs, SDs, PADs based on 'is_current' logic
        md_data["antardashas"] = generate_sub_periods(lord, current_start, duration, 1, now)
        
        # Populate summary from children if current
        if is_current_md:
            for ad in md_data["antardashas"]:
                if ad["is_current"]:
                    summary["current_antardasha"] = ad
                    for pd in ad.get("pratyantardashas", []):
                        if pd["is_current"]:
                            summary["current_pratyantardasha"] = pd
                            for sd in pd.get("sookshma_dashas", []):
                                if sd["is_current"]:
                                    summary["current_sookshma"] = sd
                                    for pad in sd.get("prana_dashas", []):
                                        if pad["is_current"]:
                                            summary["current_prana"] = pad

        dashas.append(md_data)
        current_start = end_date
        
    # Filter out MDs that ended before birth? 
    # Usually we show the starting MD with its start date (which might be before birth)
    # But usually users want to see "Balance of Dasha" as the start.
    # For UI clarity, we can keep the full MD but mark the "birth" point.
    # Or we can just return the standard list.
    
    return {
        "birth_details": {
            "date": date_str,
            "time": time_str
        },
        "moon_longitude": moon_longitude,
        "nakshatra_idx": nak_idx,
        "nakshatra": get_nakshatra_name(nak_idx),
        "balance_years": round(balance_years, 4),
        "balance_lord": first_lord,
        "summary": summary,
        "dashas": dashas
    }

def get_nakshatra_name(idx):
    names = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", 
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", 
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", 
        "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ]
    return names[idx % 27]
