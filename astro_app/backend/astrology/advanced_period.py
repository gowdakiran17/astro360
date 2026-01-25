import swisseph as swe
from datetime import datetime, timedelta
import math
from typing import List, Dict, Any, Tuple
import statistics

# Constants
SIDEREAL_MODE = swe.SIDM_LAHIRI
PLANETS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.TRUE_NODE,
    "Ketu": swe.TRUE_NODE # Ketu is opposite Rahu
}

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

RASHIS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

TITHIS = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
]

TARAS = [
    "Janma (Danger to Body)", "Sampat (Wealth)", "Vipat (Danger/Loss)", 
    "Kshema (Well-being)", "Pratyak (Obstacles)", "Sadhana (Achievement)", 
    "Naidhana (Danger/Death)", "Mitra (Friend)", "Parama Mitra (Best Friend)"
]

KARANAS = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
]

def get_julian_day(date: datetime) -> float:
    """Calculate Julian Day for 00:00 UTC (approx. Sunrise in Asia) on the given date."""
    # Using 06:00 AM UTC roughly approximates mid-day or morning in Asia/US averages
    # Better to stick to standard Ephemeris Noon (12:00 UTC) for stability, 
    # but for daily prediction, we want the Nakshatra ruling the day.
    # Let's use 06:00 UTC (11:30 IST) as a balanced point.
    return swe.julday(date.year, date.month, date.day, 6.0)

def normalize_degree(degree: float) -> float:
    return degree % 360

def get_nakshatra(longitude: float) -> int:
    """Get Nakshatra index (1-27) from longitude."""
    return int(longitude / (360 / 27)) + 1

def get_rashi(longitude: float) -> int:
    """Get Rashi index (1-12) from longitude. 1=Aries, 12=Pisces."""
    return int(longitude / 30) + 1

def calculate_tarabala(moon_lon: float, birth_moon_lon: float) -> float:
    """
    Calculate Tara Bala score (compatibility of Moon Nakshatra).
    Returns a score between 0 and 1.
    """
    daily_nak = get_nakshatra(moon_lon)
    birth_nak = get_nakshatra(birth_moon_lon)
    
    # Distance from birth nakshatra
    # Calculate 1-based position in the 9-Tara cycle
    # 1: Janma, 2: Sampat, ..., 9: Parama Mitra
    diff = (daily_nak - birth_nak + 27) % 27
    tara_position = (diff % 9) + 1
    
    # Tara Bala mapping (1=Janma (Bad), 2=Sampat (Good), etc.)
    # 1: Janma (Danger/Body) - Mixed/Bad
    # 2: Sampat (Wealth) - Very Good
    # 3: Vipat (Danger/Loss) - Bad
    # 4: Kshema (Well-being) - Good
    # 5: Pratyak (Obstacles) - Bad
    # 6: Sadhana (Achievement) - Very Good
    # 7: Naidhana (Death/Destruction) - Very Bad
    # 8: Mitra (Friend) - Very Good (User confirmed Green)
    # 9: Parama Mitra (Best Friend) - Excellent
    tara_scores = {
        1: 0.4, # Janma is mixed
        2: 0.9, 
        3: 0.2, 
        4: 0.8, 
        5: 0.3, 
        6: 0.9, 
        7: 0.1, 
        8: 0.9, 
        9: 1.0  
    }
    return tara_scores.get(tara_position, 0.5)

def calculate_chandrashtama(moon_lon: float, birth_moon_lon: float) -> bool:
    """
    Check for Chandrashtama (Moon in 8th house from Natal Moon).
    Calculated based on Rashi (Sign), not just degrees.
    """
    birth_rashi = get_rashi(birth_moon_lon)
    current_rashi = get_rashi(moon_lon)
    
    # Calculate house position (1-12)
    house_from_moon = (current_rashi - birth_rashi + 12) % 12 + 1
    
    return house_from_moon == 8

def get_day_lord(date: datetime) -> str:
    """Get the Day Lord (Vara) based on weekday."""
    weekdays = {
        0: "Moon",    # Monday
        1: "Mars",    # Tuesday
        2: "Mercury", # Wednesday
        3: "Jupiter", # Thursday
        4: "Venus",   # Friday
        5: "Saturn",  # Saturday
        6: "Sun"      # Sunday
    }
    return weekdays[date.weekday()]

def calculate_gochar_score(planet_name: str, current_lon: float, birth_moon_lon: float) -> float:
    """
    Calculate Transit (Gochar) score for a planet relative to Natal Moon.
    Returns 0.0 (Bad) to 1.0 (Good).
    """
    birth_rashi = get_rashi(birth_moon_lon)
    current_rashi = get_rashi(current_lon)
    
    # House position from Moon (1-12)
    house = (current_rashi - birth_rashi + 12) % 12 + 1
    
    # Standard Gochar Rules (Favorable Houses)
    favorable_houses = {
        "Sun": [3, 6, 10, 11],
        "Moon": [1, 3, 6, 7, 10, 11], # 1, 3, 6, 7, 10, 11 Good. 4, 8, 12 Bad. 2, 5, 9 Moderate.
        "Mars": [3, 6, 11],
        "Mercury": [2, 4, 6, 8, 10, 11],
        "Jupiter": [2, 5, 7, 9, 11],
        "Venus": [1, 2, 3, 4, 5, 8, 9, 11, 12], # Only 6, 7, 10 are bad/neutral? Venus is generally benefic.
        "Saturn": [3, 6, 11],
        "Rahu": [3, 6, 11],
        "Ketu": [3, 6, 11]
    }
    
    # Check Vedha (Obstruction) - Simplified for now (Future: Add specific Vedha pairs)
    # Ideally we check if another planet is in the Vedha house blocking the benefit.
    
    if house in favorable_houses.get(planet_name, []):
        return 1.0
    
    # Neutral/Mixed Houses
    neutral_houses = {
        "Sun": [1, 2, 5, 9],
        "Moon": [2, 5, 9],
        "Mars": [2, 5, 9],
        "Mercury": [1, 3, 5, 9],
        "Jupiter": [1, 3, 6, 10], # Jupiter in 1 is Hamsa Yoga but strictly Gochar says 2,5,7,9,11.
        "Venus": [10],
        "Saturn": [2, 5, 9], # Saturn in 9 is sometimes okay
        "Rahu": [],
        "Ketu": []
    }
    
    if house in neutral_houses.get(planet_name, []):
        return 0.5
        
    return 0.2 # Bad/Unfavorable

def calculate_vedha(planet_name: str, current_lon: float, birth_moon_lon: float, all_planets: Dict[str, float]) -> bool:
    """
    Check for Vedha (Obstruction) in Gochar.
    Returns True if the favorable transit is obstructed (blocked).
    """
    birth_rashi = get_rashi(birth_moon_lon)
    current_rashi = get_rashi(current_lon)
    
    # House position of the planet being checked (1-12)
    house = (current_rashi - birth_rashi + 12) % 12 + 1
    
    # Vedha Pairs (House -> Vedha House)
    # If planet is in 'House', it is blocked if ANY other planet is in 'Vedha House'.
    # Exceptions: Sun-Saturn and Moon-Mercury do not block each other.
    
    vedha_map = {
        "Sun": {3: 9, 6: 12, 10: 4, 11: 5},
        "Moon": {1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8},
        "Mars": {3: 12, 6: 9, 11: 5},
        "Mercury": {2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12}, # Note: 10->8 or 10->7? Classical varies. Using standard.
        "Jupiter": {2: 12, 5: 4, 7: 3, 9: 10, 11: 8},
        "Venus": {1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 3, 12: 6},
        "Saturn": {3: 12, 6: 9, 11: 5},
        "Rahu": {3: 12, 6: 9, 11: 5},
        "Ketu": {3: 12, 6: 9, 11: 5}
    }
    
    if planet_name not in vedha_map:
        return False
        
    if house not in vedha_map[planet_name]:
        return False # Not in a house that has Vedha (or not a good house)
        
    vedha_house = vedha_map[planet_name][house]
    
    # Check if ANY planet is in the Vedha house
    is_obstructed = False
    
    for other_p, other_lon in all_planets.items():
        if other_p == planet_name:
            continue
            
        # Exception Check: Father-Son do not cause Vedha
        if (planet_name == "Sun" and other_p == "Saturn") or \
           (planet_name == "Saturn" and other_p == "Sun"):
            continue
            
        if (planet_name == "Moon" and other_p == "Mercury") or \
           (planet_name == "Mercury" and other_p == "Moon"):
            continue
            
        other_rashi = get_rashi(other_lon)
        other_house = (other_rashi - birth_rashi + 12) % 12 + 1
        
        if other_house == vedha_house:
            is_obstructed = True
            break
            
    return is_obstructed

def get_tithi_quality(tithi_idx: int) -> str:
    """
    Get quality of Tithi (1-30).
    Rikta Tithis (4, 9, 14, 19, 24, 29) are generally negative for auspicious works.
    """
    # Map 16-30 (Krishna) to 1-15
    t = tithi_idx
    if t > 15:
        t = t - 15
        
    if t in [4, 9, 14]:
        return "Bad" # Rikta (Empty)
    elif t in [1, 6, 11]:
        return "Good" # Nanda (Happiness)
    elif t in [2, 7, 12]:
        return "Good" # Bhadra (Good)
    elif t in [3, 8, 13]:
        return "Good" # Jaya (Victory)
    elif t in [5, 10, 15]:
        return "Excellent" # Purna (Full)
    return "Average"

def get_yoga_quality(jd: float) -> str:
    """
    Get Yoga quality (Good/Bad).
    Bad Yogas: Vishkumbha(1), Atiganda(6), Shula(9), Ganda(10), 
    Vyaghata(13), Vajra(15), Vyatipata(17), Parigha(19), Vaidhriti(27).
    """
    # Calculate Yoga Index
    swe.set_sid_mode(SIDEREAL_MODE, 0, 0)
    sun_res = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
    moon_res = swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
    total = (sun_res[0][0] + moon_res[0][0]) % 360
    yoga_idx = int(total / (360 / 27)) + 1 # 1-27
    
    bad_yogas = [1, 6, 9, 10, 13, 15, 17, 19, 27]
    if yoga_idx in bad_yogas:
        return "Bad"
    return "Good"

def get_karana(sun_lon: float, moon_lon: float) -> str:
    """
    Get Karana (Half-Tithi).
    1 Karana = 6 degrees difference between Moon and Sun.
    There are 60 Karanas in a lunar month (30 Tithis * 2).
    """
    diff = (moon_lon - sun_lon + 360) % 360
    karana_idx = int(diff / 6) + 1 # 1-60
    
    # Logic to map 1-60 to the 11 Karana names
    # 1: Kimstughna
    # 2-57: Cycle of 7 movable karanas (Bava...Vishti) repeating 8 times
    # 58: Shakuni
    # 59: Chatushpada
    # 60: Naga
    
    if karana_idx == 1:
        return "Kimstughna"
    elif karana_idx >= 58:
        if karana_idx == 58: return "Shakuni"
        if karana_idx == 59: return "Chatushpada"
        return "Naga"
    else:
        # Movable Karanas cycle: Bava(1), Balava(2), Kaulava(3), Taitila(4), Gara(5), Vanija(6), Vishti(7)
        # Starting from index 2.
        # (idx - 2) % 7 gives 0-6 index into movable list
        movable_idx = (karana_idx - 2) % 7
        movable_karanas = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)"]
        return movable_karanas[movable_idx]

def get_sunrise_sunset(date: datetime, lat: float, lon: float) -> Tuple[datetime, datetime]:
    """
    Calculate Sunrise and Sunset for the given date and location.
    Returns UTC datetimes.
    """
    swe.set_topo(lon, lat, 0) # Altitude 0 for simplicity
    jd = get_julian_day(date)
    
    # Calculate Sunrise
    # Args: tjdut, body, rsmi, geopos, atpress, attemp, flags
    res_rise = swe.rise_trans(
        jd, swe.SUN, swe.CALC_RISE | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, swe.FLG_SWIEPH
    )
    # Calculate Sunset
    res_set = swe.rise_trans(
        jd, swe.SUN, swe.CALC_SET | swe.BIT_DISC_CENTER, (lon, lat, 0), 0, 0, swe.FLG_SWIEPH
    )
    
    # Convert JD to datetime
    # Note: res_rise[1][0] is the JD of rise
    rise_dt = None
    set_dt = None
    
    if res_rise[0] != -2: # Error check
        rise_jd = res_rise[1][0]
        y, m, d, h = swe.revjul(rise_jd)
        # Convert decimal hour to time
        hour = int(h)
        minute = int((h - hour) * 60)
        rise_dt = datetime(y, m, d, hour, minute)
        
    if res_set[0] != -2:
        set_jd = res_set[1][0]
        y, m, d, h = swe.revjul(set_jd)
        hour = int(h)
        minute = int((h - hour) * 60)
        set_dt = datetime(y, m, d, hour, minute)
        
    return rise_dt, set_dt

def calculate_muhurtas(date: datetime, rise: datetime, set: datetime) -> Dict[str, str]:
    """
    Calculate Rahu Kaal, Yamaganda, Gulika Kaal based on Day Length.
    """
    if not rise or not set:
        return {}
        
    day_duration = (set - rise).total_seconds() / 60 # minutes
    segment = day_duration / 8
    
    weekday = date.weekday() # 0=Mon, 6=Sun
    
    # Rahu Kaal Segments (1-based index of 8 segments)
    # Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3, Sun=8
    rahu_map = {0: 2, 1: 7, 2: 5, 3: 6, 4: 4, 5: 3, 6: 8}
    
    # Yamaganda Map
    # Mon=4, Tue=3, Wed=2, Thu=1, Fri=7, Sat=6, Sun=5
    yama_map = {0: 4, 1: 3, 2: 2, 3: 1, 4: 7, 5: 6, 6: 5}
    
    def get_time_str(start_min_from_rise, duration_min):
        start_dt = rise + timedelta(minutes=start_min_from_rise)
        end_dt = start_dt + timedelta(minutes=duration_min)
        return f"{start_dt.strftime('%H:%M')} - {end_dt.strftime('%H:%M')}"
        
    rahu_idx = rahu_map[weekday]
    rahu_start = (rahu_idx - 1) * segment
    rahu_kaal = get_time_str(rahu_start, segment)
    
    yama_idx = yama_map[weekday]
    yama_start = (yama_idx - 1) * segment
    yamaganda = get_time_str(yama_start, segment)
    
    return {
        "rahu_kaal": rahu_kaal,
        "yamaganda": yamaganda,
        "sunrise": rise.strftime('%H:%M'),
        "sunset": set.strftime('%H:%M')
    }

def get_planet_positions(jd: float) -> Dict[str, float]:
    """Get planetary positions for a given Julian Day."""
    swe.set_sid_mode(SIDEREAL_MODE, 0, 0)
    positions = {}
    for name, pid in PLANETS.items():
        if name == "Ketu":
            # Ketu is exactly opposite Rahu
            rahu_pos = positions["Rahu"]
            positions["Ketu"] = normalize_degree(rahu_pos + 180)
        else:
            res = swe.calc_ut(jd, pid, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
            positions[name] = res[0][0]
    return positions

class PeriodAnalyzer:
    def __init__(self, birth_details: Dict[str, Any], natal_moon_lon: float):
        self.birth_details = birth_details
        self.natal_moon_lon = natal_moon_lon
        
    def calculate_daily_score(self, date: datetime) -> Dict[str, Any]:
        """
        Calculate a comprehensive score for a specific day using Vedic Panchang logic.
        """
        jd = get_julian_day(date)
        current_planets = get_planet_positions(jd)
        
        # 1. Tara Bala (Nakshatra Strength) - Weight: 35%
        # Primary factor for daily mental state and luck.
        moon_score = calculate_tarabala(current_planets['Moon'], self.natal_moon_lon)
        
        # 2. Chandrashtama (Moon in 8th) - Critical Check
        is_chandrashtama = calculate_chandrashtama(current_planets['Moon'], self.natal_moon_lon)
        if is_chandrashtama:
            # Check for Exceptions (Vipareeta/Anukul)
            # If Tara Bala is Parama Mitra (9) or Sampat (2), it mitigates slightly.
            # In some apps, Chandrashtama is shown as Yellow (Caution) rather than Red (Bad).
            if moon_score >= 0.9:
                moon_score *= 0.6 # Mitigated
            else:
                moon_score *= 0.4 # Penalty but not zero
            
        # 3. Gochar (Planetary Transits) - Weight: 50% (Increased from 45% due to Vedha rigor)
        # Sum of all planets' transit strength
        gochar_total = 0
        planet_weights = {
            "Sun": 1.5,   # Vitality
            "Moon": 2.0,  # Mind (Covered by Tara/Chandrashtama partially, but House matters too)
            "Mars": 1.0,  # Energy
            "Mercury": 1.0, # Intellect
            "Jupiter": 2.5, # Wisdom/Grace (Major Benefic)
            "Venus": 1.5, # Comfort
            "Saturn": 2.0, # Karma/Stress (Major Malefic)
            "Rahu": 1.0,
            "Ketu": 0.5
        }
        
        max_possible_gochar = sum(planet_weights.values())
        
        # Collect Gochar Details for Frontend
        gochar_details = []
        
        for planet, weight in planet_weights.items():
            score = calculate_gochar_score(planet, current_planets[planet], self.natal_moon_lon)
            
            # Calculate house manually for details
            birth_rashi = get_rashi(self.natal_moon_lon)
            current_rashi = get_rashi(current_planets[planet])
            house = (current_rashi - birth_rashi + 12) % 12 + 1
            
            status = "Neutral"
            if score >= 1.0:
                status = "Good"
            elif score <= 0.2:
                status = "Bad"
            
            # CHECK VEDHA (Obstruction)
            # If the score is good (1.0), check if it's obstructed.
            is_obstructed = False
            if score > 0.6: # Only check Vedha for good transits
                if calculate_vedha(planet, current_planets[planet], self.natal_moon_lon, current_planets):
                    score = 0.3 # Obstructed! Becomes poor/mixed.
                    status = "Obstructed"
                    is_obstructed = True
                    
            gochar_total += score * weight
            
            gochar_details.append({
                "planet": planet,
                "house": house,
                "status": status,
                "score": score,
                "is_obstructed": is_obstructed
            })
            
        gochar_normalized = gochar_total / max_possible_gochar
        
        # 4. Planetary Geometry (Tithi/Yoga) - Weight: 20%
        # Sun-Moon Angle (Tithi)
        tithi_angle = normalize_degree(current_planets['Moon'] - current_planets['Sun'])
        tithi_idx = int(tithi_angle / 12) + 1 # 1-30
        
        # Tithi Quality Check
        tithi_quality = get_tithi_quality(tithi_idx)
        tithi_name = TITHIS[tithi_idx - 1] if 1 <= tithi_idx <= 30 else "Unknown"
        
        tithi_score_base = 0.5
        
        if tithi_quality == "Excellent":
            tithi_score_base = 1.0
        elif tithi_quality == "Good":
            tithi_score_base = 0.8
        elif tithi_quality == "Bad":
            tithi_score_base = 0.2
        else:
            tithi_score_base = 0.5
            
        # Yoga Quality Check
        swe.set_sid_mode(SIDEREAL_MODE, 0, 0)
        sun_res = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        moon_res = swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        total_yoga_deg = (sun_res[0][0] + moon_res[0][0]) % 360
        yoga_idx = int(total_yoga_deg / (360 / 27)) + 1 # 1-27
        
        yoga_quality = get_yoga_quality(jd)
        if yoga_quality == "Bad":
            tithi_score_base *= 0.6 # Penalty for Bad Yoga (Vishkumbha etc)
            
        # Karana Calculation
        karana_name = get_karana(current_planets['Sun'], current_planets['Moon'])

        # Muhurtas Calculation
        lat = float(self.birth_details.get('latitude', 0))
        lon = float(self.birth_details.get('longitude', 0))
        
        rise, set_time = get_sunrise_sunset(date, lat, lon)
        muhurtas = calculate_muhurtas(date, rise, set_time)
        
        # Weighted Total Score (0-100)
        total_score = (
            (moon_score * 0.30) +          # Daily Moon/Star (Short term) - Reduced to 30%
            (gochar_normalized * 0.50) +   # Planetary Transits (Medium/Long term) - Increased to 50%
            (tithi_score_base * 0.20)      # Lunar Phase/Yoga (Energy)
        ) * 100
        
        # Clamp
        total_score = max(0, min(100, total_score))

        # Determine Special Icons
        special_icons = []
        
        # Crown: Excellent Day
        if total_score >= 80:
            special_icons.append("crown")
        elif moon_score >= 0.9 and gochar_normalized >= 0.7:
             special_icons.append("crown")

        # Coin: Good for Wealth (Tara 2, 6, 9 or Jupiter/Venus Good)
        # Tara 2=Sampat, 6=Sadhana, 9=Parama Mitra
        # Recalculate raw Tara position for checking specific Taras
        daily_nak = get_nakshatra(current_planets['Moon'])
        birth_nak = get_nakshatra(self.natal_moon_lon)
        tara_pos = ((daily_nak - birth_nak + 27) % 27) % 9 + 1
        tara_name = TARAS[tara_pos - 1]
        nakshatra_name = NAKSHATRAS[daily_nak - 1]
        
        if tara_pos in [2, 6, 9]:
            special_icons.append("coin")
        elif total_score > 70: # Generally good days also get coin often
            special_icons.append("coin")
            
        # Moon: Chandrashtama or Mind Focus
        if is_chandrashtama:
            special_icons.append("moon")
        
        return {
            "date": date.strftime("%Y-%m-%d"),
            "score": round(total_score, 1),
            "components": {
                "tara_bala": round(moon_score, 2),
                "gochar": round(gochar_normalized, 2),
                "lunar_phase": round(tithi_score_base, 2)
            },
            "details": {
                "panchang": {
                    "tithi": tithi_name,
                    "tithi_quality": tithi_quality,
                    "nakshatra": nakshatra_name,
                    "tara": tara_name,
                    "yoga_idx": yoga_idx,
                    "yoga_quality": yoga_quality,
                    "karana": karana_name
                },
                "muhurtas": muhurtas,
                "gochar": gochar_details
            },
            "is_chandrashtama": is_chandrashtama,
            "special_icons": list(set(special_icons)), # Dedupe,
            "day_lord": get_day_lord(date)
        }

    def analyze_period(self, start_date: datetime, days: int = 30) -> Dict[str, Any]:
        """
        Perform rigorous time-series analysis on the period.
        """
        daily_data = []
        scores = []
        
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            day_result = self.calculate_daily_score(current_date)
            daily_data.append(day_result)
            scores.append(day_result['score'])
            
        # Statistical Analysis
        if not scores:
            return {}
            
        mean_score = statistics.mean(scores)
        try:
            std_dev = statistics.stdev(scores)
        except:
            std_dev = 0
            
        # Time Series Decomposition (Simple Moving Average Trend)
        trend = []
        window_size = 7
        for i in range(len(scores)):
            start_idx = max(0, i - window_size // 2)
            end_idx = min(len(scores), i + window_size // 2 + 1)
            window = scores[start_idx:end_idx]
            trend.append(sum(window) / len(window))
            
        # Residuals
        residuals = [s - t for s, t in zip(scores, trend)]
        
        # Pattern Detection (Peaks)
        peaks = []
        for i in range(1, len(scores) - 1):
            if scores[i] > scores[i-1] and scores[i] > scores[i+1]:
                peaks.append({
                    "date": daily_data[i]["date"],
                    "score": scores[i],
                    "type": "local_max"
                })
                
        # Classify Days based on Statistics
        for day in daily_data:
            score = day['score']
            if score >= mean_score + std_dev:
                day['classification'] = 'Excellent'
            elif score >= mean_score:
                day['classification'] = 'Good'
            elif score >= mean_score - std_dev:
                day['classification'] = 'Average'
            else:
                day['classification'] = 'Challenging'
                
        return {
            "daily_scores": daily_data,
            "statistics": {
                "mean": round(mean_score, 2),
                "std_dev": round(std_dev, 2),
                "min": min(scores),
                "max": max(scores)
            },
            "analysis": {
                "trend": trend,
                "residuals": residuals,
                "peaks": peaks
            }
        }
