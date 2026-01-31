"""
KP Dasha Calculations
Implements Vimshottari Dasha system for KP Astrology with:
- Mahadasha (Main period)
- Bhukti/Antardasha (Sub-period)
- Antara (Sub-sub period)
- Sookshama (Micro period)
"""

from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from .kp_core import get_nakshatra_info, VIMSHOTTARI_YEARS, SUB_SEQUENCE

# Total Vimshottari cycle
TOTAL_YEARS = 120


def calculate_dasha_balance(moon_longitude: float) -> Tuple[str, float]:
    """
    Calculate the balance of Mahadasha at birth based on Moon's position.
    
    Args:
        moon_longitude: Moon's longitude in degrees
        
    Returns:
        Tuple of (dasha_lord, balance_in_years)
    """
    nak_info = get_nakshatra_info(moon_longitude)
    dasha_lord = nak_info["lord"]
    
    # Position within nakshatra (0 to 13.333333 degrees)
    position_in_nak = nak_info["position_in_nakshatra"]
    nak_span = nak_info["nakshatra_span"]  # 13.333333 degrees
    
    # Total years for this dasha lord
    total_years = VIMSHOTTARI_YEARS[dasha_lord]
    
    # Proportion completed
    proportion_completed = position_in_nak / nak_span
    
    # Balance remaining
    balance_years = total_years * (1 - proportion_completed)
    
    return dasha_lord, balance_years


def generate_mahadasha_periods(
    birth_date: datetime,
    moon_longitude: float,
    years_ahead: int = 120
) -> List[Dict]:
    """
    Generate Mahadasha periods starting from birth.
    
    Args:
        birth_date: Date and time of birth
        moon_longitude: Moon's longitude at birth
        years_ahead: Number of years to generate (default: 120 for full cycle)
        
    Returns:
        List of Mahadasha period dicts
    """
    # Get starting dasha and balance
    start_lord, balance_years = calculate_dasha_balance(moon_longitude)
    
    # Find starting index in sequence
    start_index = SUB_SEQUENCE.index(start_lord)
    
    periods = []
    current_date = birth_date
    total_years_covered = 0
    
    # First period (balance of birth dasha)
    end_date = current_date + timedelta(days=balance_years * 365.25)
    periods.append({
        "lord": start_lord,
        "start_date": current_date.strftime("%d/%m/%Y"),
        "end_date": end_date.strftime("%d/%m/%Y"),
        "duration_years": balance_years,
        "is_balance": True
    })
    
    current_date = end_date
    total_years_covered += balance_years
    
    # Subsequent periods
    period_index = 1
    while total_years_covered < years_ahead:
        planet_index = (start_index + period_index) % 9
        lord = SUB_SEQUENCE[planet_index]
        duration = VIMSHOTTARI_YEARS[lord]
        
        end_date = current_date + timedelta(days=duration * 365.25)
        
        periods.append({
            "lord": lord,
            "start_date": current_date.strftime("%d/%m/%Y"),
            "end_date": end_date.strftime("%d/%m/%Y"),
            "duration_years": duration,
            "is_balance": False
        })
        
        current_date = end_date
        total_years_covered += duration
        period_index += 1
    
    return periods


def generate_antardasha_periods(
    mahadasha_lord: str,
    mahadasha_start: datetime,
    mahadasha_duration_years: float
) -> List[Dict]:
    """
    Generate Antardasha (Bhukti) periods within a Mahadasha.
    
    Args:
        mahadasha_lord: Lord of the Mahadasha
        mahadasha_start: Start date of Mahadasha
        mahadasha_duration_years: Duration of Mahadasha in years
        
    Returns:
        List of Antardasha period dicts
    """
    # Antardasha sequence starts from Mahadasha lord
    start_index = SUB_SEQUENCE.index(mahadasha_lord)
    
    periods = []
    current_date = mahadasha_start
    
    for i in range(9):
        planet_index = (start_index + i) % 9
        lord = SUB_SEQUENCE[planet_index]
        
        # Duration proportional to both lords
        # Formula: (MD years × AD years) / 120
        duration_years = (mahadasha_duration_years * VIMSHOTTARI_YEARS[lord]) / TOTAL_YEARS
        
        end_date = current_date + timedelta(days=duration_years * 365.25)
        
        periods.append({
            "lord": lord,
            "start_date": current_date.strftime("%d/%m/%Y"),
            "end_date": end_date.strftime("%d/%m/%Y"),
            "duration_years": duration_years,
            "duration_months": duration_years * 12
        })
        
        current_date = end_date
    
    return periods


def generate_antara_periods(
    mahadasha_lord: str,
    antardasha_lord: str,
    antardasha_start: datetime,
    antardasha_duration_years: float
) -> List[Dict]:
    """
    Generate Antara (sub-sub period) within an Antardasha.
    
    Args:
        mahadasha_lord: Lord of the Mahadasha
        antardasha_lord: Lord of the Antardasha
        antardasha_start: Start date of Antardasha
        antardasha_duration_years: Duration of Antardasha in years
        
    Returns:
        List of Antara period dicts
    """
    # Antara sequence starts from Antardasha lord
    start_index = SUB_SEQUENCE.index(antardasha_lord)
    
    periods = []
    current_date = antardasha_start
    
    for i in range(9):
        planet_index = (start_index + i) % 9
        lord = SUB_SEQUENCE[planet_index]
        
        # Duration: (MD years × AD years × Antara years) / (120 × 120)
        mahadasha_years = VIMSHOTTARI_YEARS[mahadasha_lord]
        duration_years = (antardasha_duration_years * VIMSHOTTARI_YEARS[lord]) / TOTAL_YEARS
        
        end_date = current_date + timedelta(days=duration_years * 365.25)
        
        periods.append({
            "lord": lord,
            "start_date": current_date.strftime("%d/%m/%Y"),
            "end_date": end_date.strftime("%d/%m/%Y"),
            "duration_days": duration_years * 365.25
        })
        
        current_date = end_date
    
    return periods


def get_current_dasha_period(
    birth_date: datetime,
    moon_longitude: float,
    current_date: datetime = None
) -> Dict:
    """
    Get the current running Dasha period.
    
    Args:
        birth_date: Date and time of birth
        moon_longitude: Moon's longitude at birth
        current_date: Date to check (default: now)
        
    Returns:
        Dict with current Mahadasha, Antardasha, and Antara
    """
    if current_date is None:
        current_date = datetime.now()
    
    # Generate Mahadasha periods
    mahadashas = generate_mahadasha_periods(birth_date, moon_longitude, years_ahead=120)
    
    # Find current Mahadasha
    current_mahadasha = None
    for md in mahadashas:
        md_start = datetime.strptime(md["start_date"], "%d/%m/%Y")
        md_end = datetime.strptime(md["end_date"], "%d/%m/%Y")
        
        if md_start <= current_date < md_end:
            current_mahadasha = md
            break
    
    if not current_mahadasha:
        return {"error": "Could not determine current Mahadasha"}
    
    # Generate Antardasha periods for current Mahadasha
    md_start = datetime.strptime(current_mahadasha["start_date"], "%d/%m/%Y")
    antardashas = generate_antardasha_periods(
        current_mahadasha["lord"],
        md_start,
        current_mahadasha["duration_years"]
    )
    
    # Find current Antardasha
    current_antardasha = None
    for ad in antardashas:
        ad_start = datetime.strptime(ad["start_date"], "%d/%m/%Y")
        ad_end = datetime.strptime(ad["end_date"], "%d/%m/%Y")
        
        if ad_start <= current_date < ad_end:
            current_antardasha = ad
            break
            
    # Generate and Find current Antara (Pratyantar Dasha)
    current_antara = None
    if current_antardasha:
        ad_start = datetime.strptime(current_antardasha["start_date"], "%d/%m/%Y")
        antaras = generate_antara_periods(
            current_mahadasha["lord"],
            current_antardasha["lord"],
            ad_start,
            current_antardasha["duration_years"]
        )
        
        for ant in antaras:
            ant_start = datetime.strptime(ant["start_date"], "%d/%m/%Y")
            ant_end = datetime.strptime(ant["end_date"], "%d/%m/%Y")
            
            if ant_start <= current_date < ant_end:
                current_antara = ant
                break
    
    return {
        "mahadasha": current_mahadasha,
        "antardasha": current_antardasha,
        "antara": current_antara,
        "current_date": current_date.strftime("%d/%m/%Y")
    }
