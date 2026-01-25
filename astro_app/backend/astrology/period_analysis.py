"""
Period Analysis Service
Calculates day scores, events, predictions, and period scores for astrological analysis.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import math
import random
import swisseph as swe
import statistics

# Import from existing modules
from astro_app.backend.astrology.dasha import DASHA_ORDER, DASHA_YEARS, NAKSHATRA_LORDS, calculate_vimshottari_dasha
from astro_app.backend.astrology.advanced_period import (
    calculate_gochar_score, calculate_tarabala, calculate_vedha, 
    get_julian_day, get_nakshatra, get_rashi, get_day_lord,
    PLANETS, RASHIS
)
from astro_app.backend.astrology.utils import normalize_degree
from astro_app.backend.astrology.strength import calculate_vimsopaka_bala, calculate_ishta_kashta_phala
from astro_app.backend.astrology.shadbala import calculate_shadbala

# Planet characteristics for scoring
PLANET_NATURE = {
    'Sun': {'benefic': True, 'strength': 0.8},
    'Moon': {'benefic': True, 'strength': 0.7},
    'Mars': {'benefic': False, 'strength': 0.6},
    'Mercury': {'benefic': True, 'strength': 0.75},
    'Jupiter': {'benefic': True, 'strength': 0.9},
    'Venus': {'benefic': True, 'strength': 0.85},
    'Saturn': {'benefic': False, 'strength': 0.5},
    'Rahu': {'benefic': False, 'strength': 0.4},
    'Ketu': {'benefic': False, 'strength': 0.45}
}

def get_moon_nakshatra_lord(moon_longitude: float) -> str:
    """Get the Nakshatra lord for a given Moon longitude."""
    nakshatra_index = int(moon_longitude / (360.0 / 27.0))
    return NAKSHATRA_LORDS[nakshatra_index % 27]


def get_daily_planetary_positions(target_date: datetime) -> Dict[str, float]:
    """
    Get planetary longitudes for a specific date (Noon UTC).
    """
    jd = get_julian_day(target_date)
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    
    positions = {}
    for p_name, p_id in PLANETS.items():
        flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
        res = swe.calc_ut(jd, p_id, flags)
        positions[p_name] = res[0][0]
        
    return positions


def calculate_day_score(
    birth_date: datetime,
    moon_longitude: float,
    target_date: datetime
) -> Dict[str, Any]:
    """
    Calculate the score for a specific day based on:
    - Gochar (Transits) relative to Moon
    - Tara Bala (Moon-Moon compatibility)
    - Day Lord
    """
    # 1. Get Daily Planetary Positions
    daily_planets = get_daily_planetary_positions(target_date)
    
    # 2. Calculate Gochar Score (Average of all major planets)
    # Major planets for transit: Jupiter, Saturn, Rahu/Ketu are long term.
    # Sun, Mars, Venus, Mercury are monthly/weekly.
    # Moon is daily.
    
    weights = {
        "Moon": 0.4, # Moon is most important for daily
        "Sun": 0.1,
        "Jupiter": 0.15,
        "Saturn": 0.1,
        "Mars": 0.05,
        "Venus": 0.1,
        "Mercury": 0.05,
        "Rahu": 0.025,
        "Ketu": 0.025
    }
    
    total_score = 0
    total_weight = 0
    
    influences = []
    
    for planet, weight in weights.items():
        if planet not in daily_planets: continue
        
        raw_score = calculate_gochar_score(planet, daily_planets[planet], moon_longitude)
        
        # Check Vedha (Obstruction)
        is_obstructed = calculate_vedha(planet, daily_planets[planet], moon_longitude, daily_planets)
        if is_obstructed and raw_score > 0.5:
             raw_score = 0.4 # Reduced if obstructed
             
        total_score += raw_score * weight
        total_weight += weight
        
        if raw_score >= 0.8:
            influences.append(f"Favorable {planet}")
        elif raw_score <= 0.3:
            influences.append(f"Challenging {planet}")

    normalized_gochar = (total_score / total_weight) * 100
    
    # 3. Tara Bala (Star Strength)
    daily_moon_lon = daily_planets["Moon"]
    tara_score = calculate_tarabala(daily_moon_lon, moon_longitude) * 100 # 0-100
    
    # 4. Day Lord Compatibility (Simplified)
    day_lord = get_day_lord(target_date)
    birth_nak_lord = get_moon_nakshatra_lord(moon_longitude)
    
    # Check if Day Lord is friend of Birth Nak Lord (Using PLANET_NATURE benefic proxy for now)
    day_lord_benefic = PLANET_NATURE.get(day_lord, {}).get('benefic', True)
    birth_lord_benefic = PLANET_NATURE.get(birth_nak_lord, {}).get('benefic', True)
    
    day_score_bonus = 10 if day_lord_benefic == birth_lord_benefic else 0
    
    # 5. Final Score Calculation
    # Weight: Tara Bala (40%), Gochar (40%), Day Lord (20%)
    final_score = (tara_score * 0.4) + (normalized_gochar * 0.4) + (50 + day_score_bonus) * 0.2
    
    # Clamp
    score = max(0, min(100, int(final_score)))
    
    # Determine type
    if score >= 75: day_type = 'favorable'
    elif score >= 50: day_type = 'neutral'
    elif score >= 35: day_type = 'mixed'
    else: day_type = 'unfavorable'
    
    # Theme determination based on dominant influence
    if "Favorable Jupiter" in influences: theme = "Wisdom & Growth"
    elif "Favorable Venus" in influences: theme = "Love & Comfort"
    elif "Favorable Mercury" in influences: theme = "Communication"
    elif "Favorable Sun" in influences: theme = "Vitality & Success"
    elif "Favorable Moon" in influences: theme = "Peace & Harmony"
    elif "Challenging Saturn" in influences: theme = "Hard Work & Patience"
    elif "Challenging Mars" in influences: theme = "Caution & Energy"
    else: theme = "General"

    # Energy level
    energy = int((normalized_gochar / 100) * 10)
    
    return {
        'date': target_date.strftime('%Y-%m-%d'),
        'day': target_date.strftime('%A'),
        'score': score,
        'type': day_type,
        'day_lord': day_lord,
        'influences': influences[:3], # Top 3 influences
        'theme': theme,
        'energy': max(1, min(10, energy)),
        'best': "10 AM - 12 PM", # Placeholder for now, could be calculated from Choghadiya
        'caution': "Avoid risks" if score < 40 else "None"
    }


def calculate_calendar_data(
    birth_date_str: str,
    moon_longitude: float,
    month: int,
    year: int
) -> List[Dict[str, Any]]:
    """Generate calendar data for a full month."""
    # Parse birth date
    try:
        birth_date = datetime.strptime(birth_date_str, '%d/%m/%Y')
    except ValueError:
        try:
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d')
        except ValueError:
            # Fallback for testing
            birth_date = datetime.now() 
    
    # Get first and last day of month
    first_day = datetime(year, month, 1)
    if month == 12:
        last_day = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = datetime(year, month + 1, 1) - timedelta(days=1)
    
    calendar_data = []
    current = first_day
    
    while current <= last_day:
        day_data = calculate_day_score(birth_date, moon_longitude, current)
        calendar_data.append(day_data)
        current += timedelta(days=1)
    
    return calendar_data


def get_period_events(month: int, year: int) -> List[Dict[str, Any]]:
    """
    Get astrological events for the specified month using Swisseph.
    Returns ingresses (sign changes) and major aspects.
    """
    events = []
    
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)
        
    current = start_date
    prev_positions = get_daily_planetary_positions(current - timedelta(days=1))
    
    # Planets to track for events
    track_planets = ["Sun", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"]
    
    while current < end_date:
        curr_positions = get_daily_planetary_positions(current)
        
        for planet in track_planets:
            prev_sign = get_rashi(prev_positions[planet])
            curr_sign = get_rashi(curr_positions[planet])
            
            if prev_sign != curr_sign:
                # Ingress Event!
                sign_name = RASHIS[curr_sign - 1]
                events.append({
                    'date': current.strftime('%Y-%m-%d'),
                    'type': 'transit',
                    'title': f"{planet} enters {sign_name}",
                    'description': f"{planet} moves into {sign_name}, shifting energy in that area of life.",
                    'impact': 'neutral'
                })
        
        # Check for Moon Phases
        prev_sun = prev_positions["Sun"]
        prev_moon = prev_positions["Moon"]
        curr_sun = curr_positions["Sun"]
        curr_moon = curr_positions["Moon"]
        
        prev_angle = (prev_moon - prev_sun) % 360
        curr_angle = (curr_moon - curr_sun) % 360
        
        # New Moon
        if prev_angle > 300 and curr_angle < 60:
             events.append({
                'date': current.strftime('%Y-%m-%d'),
                'type': 'new_moon',
                'title': "New Moon",
                'description': "A time for new beginnings and setting intentions.",
                'impact': 'favorable'
            })
            
        # Full Moon
        if prev_angle < 180 and curr_angle >= 180:
             events.append({
                'date': current.strftime('%Y-%m-%d'),
                'type': 'full_moon',
                'title': "Full Moon",
                'description': "A time of culmination and emotional height.",
                'impact': 'neutral'
            })
            
        prev_positions = curr_positions
        current += timedelta(days=1)
    
    # Sort by date
    events.sort(key=lambda x: x['date'])
    
    return events


def generate_predictions(
    birth_date_str: str,
    moon_longitude: float,
    month: int,
    year: int
) -> Dict[str, Dict[str, Any]]:
    """
    Generate predictions based on aggregated Gochar scores for the month.
    """
    # 1. Calculate average scores for the month (simplified, reusing one day sample for perf)
    # Ideally should be average of whole month, but one mid-month calculation is okay for "general" tone
    mid_month = datetime(year, month, 15)
    planets = get_daily_planetary_positions(mid_month)
    
    def get_area_prediction(planet_name: str) -> Dict[str, Any]:
        score = calculate_gochar_score(planet_name, planets[planet_name], moon_longitude)
        
        # Normalize 0-1 to 1-5 rating
        rating = 1 + (score * 4) 
        
        status = "Excellent" if score > 0.8 else "Good" if score > 0.5 else "Average" if score > 0.3 else "Challenging"
        
        return {
            'rating': min(5, max(1, rating)),
            'status': status,
            'planet': planet_name
        }

    # Generate predictions
    predictions = {
        'health': {
            **get_area_prediction("Sun"),
            'title': 'Health & Vitality',
            'summary': f"Sun's transit influences your vitality.",
            'details': "Focus on maintaining a balanced routine and getting enough sunlight.",
            'remedies': ['Sun Salutation', 'Drink water in copper vessel']
        },
        'career': {
            **get_area_prediction("Saturn"), 
            'title': 'Career & Profession',
            'summary': "Saturn's position highlights professional responsibilities.",
            'details': "Hard work and discipline will be rewarded. Avoid shortcuts.",
            'remedies': ['Light lamp for Saturn', 'Help the needy']
        },
        'relationships': {
            **get_area_prediction("Venus"),
            'title': 'Love & Relationships',
            'summary': "Venus governs your connections this month.",
            'details': "A good time to nurture existing bonds and express affection.",
            'remedies': ['Wear clean clothes', 'Respect partner']
        },
        'finance': {
            **get_area_prediction("Jupiter"),
            'title': 'Wealth & Finance',
            'summary': "Jupiter's transit affects your financial wisdom.",
            'details': "Review investments and avoid unnecessary expenses.",
            'remedies': ['Donate to education', 'Wear yellow on Thursday']
        },
        'spiritual': {
            **get_area_prediction("Ketu"),
            'title': 'Spiritual Growth',
            'summary': "Ketu brings detachment and insight.",
            'details': "Meditation and introspection will be fruitful.",
            'remedies': ['Meditation', 'Feed stray dogs']
        }
    }
    
    return predictions

async def get_full_period_analysis(
    birth_details: Dict[str, Any],
    moon_longitude: float,
    month: int,
    year: int
) -> Dict[str, Any]:
    """
    Orchestrator for Period Analysis Page.
    """
    birth_date_str = birth_details.get('date', '')
    
    # 1. Calculate Daily Scores (Calendar)
    calendar_data = calculate_calendar_data(birth_date_str, moon_longitude, month, year)
    
    # 2. Get Events
    events = get_period_events(month, year)
    
    # 3. Generate Predictions
    predictions = generate_predictions(birth_date_str, moon_longitude, month, year)
    
    # 4. Calculate Overall Score
    overall_score = int(statistics.mean([d['score'] for d in calendar_data])) if calendar_data else 50
    
    # 5. Generate Forecast Structures for Frontend (Weekly/Monthly)
    weeks = []
    current_week = []
    week_num = 1
    
    for day in calendar_data:
        current_week.append(day)
        dt = datetime.strptime(day['date'], '%Y-%m-%d')
        if dt.weekday() == 6 or day == calendar_data[-1]:
            week_avg = int(statistics.mean([d['score'] for d in current_week]))
            start_date = current_week[0]['date']
            end_date = current_week[-1]['date']
            
            # Simple theme based on best day's influence
            best_day = max(current_week, key=lambda x: x['score'])
            theme = best_day.get('theme', "Mixed Energy")
            
            weeks.append({
                'id': week_num,
                'range': f"{start_date[8:]}-{end_date[8:]}", # "01-07"
                'score': week_avg,
                'theme': theme
            })
            week_num += 1
            current_week = []

    monthly_forecast = {
        'month': datetime(year, month, 1).strftime("%B %Y"),
        'score': overall_score,
        'quality': 'Excellent' if overall_score > 75 else 'Good' if overall_score > 60 else 'Average' if overall_score > 40 else 'Challenging',
        'theme': "Growth & Opportunity" if overall_score > 60 else "Patience & Reflection",
        'summary': f"The month of {datetime(year, month, 1).strftime('%B')} carries an overall score of {overall_score}/100. "
                   f"The focus is on {predictions['career']['status']} career progress and {predictions['relationships']['status']} relationships.",
        'weeks': weeks,
        'focusAreas': [v['title'] for k, v in predictions.items() if v['rating'] >= 3.5]
    }
    
    # Weekly Data (For the "This Week" view)
    # Find week containing today (or first week if not found)
    today_dt = datetime.now()
    today_date_str = today_dt.strftime('%Y-%m-%d')
    
    current_week_days = []
    
    # Try to find the week containing today
    found_week = False
    for w_idx, w in enumerate(weeks):
        # Parse range "DD-DD"
        # This is tricky because weeks are aggregated. 
        # Better to iterate calendar_data and group by ISO week or simple chunks
        pass

    # Re-implement weekly grouping logic to be robust
    weekly_data = None
    
    # Group by standard weeks (Sunday to Saturday or similar)
    # Actually, let's just slide through calendar_data
    
    # Find index of today
    today_index = -1
    for i, d in enumerate(calendar_data):
        if d['date'] == today_date_str:
            today_index = i
            break
            
    if today_index != -1:
        # Get surrounding week (e.g. today - 3 to today + 3, or standard week)
        # Let's try to align with the "weeks" generated above if possible, but they are just stats.
        # We need list of days.
        
        # Let's take 7 days starting from Monday of current week
        today_weekday = today_dt.weekday() # Mon=0, Sun=6
        start_offset = today_weekday 
        start_index = max(0, today_index - start_offset)
        end_index = min(len(calendar_data), start_index + 7)
        
        # If we are near end of month, we might get less than 7 days.
        # Ideally we should fetch next month data too, but for this scope, let's just take what we have
        # or pad with next month if we had it.
        # For now, just take the slice.
        current_week_days = calendar_data[start_index:end_index]
    else:
        # Today not in this month (user requested future/past month)
        # Return first week
        current_week_days = calendar_data[:7]

    # Calculate stats for this specific week of days
    if current_week_days:
        wk_score = int(statistics.mean([d['score'] for d in current_week_days]))
        wk_start = current_week_days[0]['date']
        wk_end = current_week_days[-1]['date']
        
        # Theme from best day
        best_day = max(current_week_days, key=lambda x: x['score'])
        wk_theme = best_day.get('theme', "Mixed Energy")
        
        weekly_data = {
            'range': f"{wk_start[8:]}-{wk_end[8:]}", # "DD-DD"
            'score': wk_score,
            'quality': 'Good Week' if wk_score > 60 else 'Average Week',
            'theme': wk_theme,
            'energy': 8, 
            'summary': f"Forecast for {wk_start} to {wk_end}.",
            'days': current_week_days
        }
    else:
        # Fallback
        weekly_data = {
             'range': "",
             'score': 0,
             'quality': "N/A",
             'theme': "",
             'energy': 0,
             'summary': "No data available",
             'days': []
        }
    
    # Current Day (Today)
    today_str = datetime.now().strftime('%Y-%m-%d')
    current_day = next((d for d in calendar_data if d['date'] == today_str), calendar_data[0] if calendar_data else None)

    return {
        "calendar_scores": calendar_data,
        "events": events,
        "predictions": list(predictions.values()), # Frontend expects array sometimes? Or dict?
        "prediction_dict": predictions, # Keep dict version
        "overall_score": overall_score,
        "monthly_forecast": monthly_forecast,
        "weekly_forecast": weekly_data,
        "current_day": current_day
    }
