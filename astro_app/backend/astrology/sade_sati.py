import swisseph as swe
from datetime import datetime, timedelta
from .utils import get_nakshatra_details, get_planetary_dignity, ZODIAC_SIGNS, NAKSHATRAS
import logging

logger = logging.getLogger(__name__)

def get_saturn_long(jd):
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
    res = swe.calc_ut(jd, swe.SATURN, flags)
    return res[0][0]

def get_sign_from_long(lon):
    return int(lon / 30) % 12

def find_ingress_date(target_sign, start_jd, search_forward=True, max_days=12000):
    """
    Finds the date when Saturn enters the target_sign.
    If search_forward is True: looks for the first entry into target_sign from now.
    If search_forward is False: looks for the most recent entry into target_sign from the past (i.e. start date of current transit).
    """
    step = 5 if search_forward else -5
    current_jd = start_jd
    
    # We are looking for a boundary crossing.
    # Forward: current != target, next == target
    # Backward: current == target, prev != target (This gives the start of the residency)
    
    # To find the START of a phase that we are currently in (or passed):
    # We search backwards until we find a time when Saturn was NOT in the target sign.
    # The moment it switched FROM non-target TO target is the start.
    
    found_jd = None
    
    for _ in range(int(max_days / abs(step))):
        next_jd = current_jd + step
        curr_lon = get_saturn_long(current_jd)
        next_lon = get_saturn_long(next_jd)
        
        curr_sign = get_sign_from_long(curr_lon)
        next_sign = get_sign_from_long(next_lon)
        
        if search_forward:
            # Looking for entry
            if curr_sign != target_sign and next_sign == target_sign:
                # Refine
                return refine_ingress(current_jd, next_jd, target_sign)
        else:
            # Looking for start (searching backwards)
            # We want the moment it BECAME target_sign
            # So looking backwards: current is target, next (past) is NOT target
            if curr_sign == target_sign and next_sign != target_sign:
                # The crossing happened between next_jd and current_jd
                # next_jd is outside, current_jd is inside
                return refine_ingress(next_jd, current_jd, target_sign)
                
        current_jd = next_jd
        
    return None

def refine_ingress(jd_outside, jd_inside, target_sign):
    """
    Binary search to find exact ingress moment.
    jd_outside: Time when Saturn is NOT in target
    jd_inside: Time when Saturn IS in target
    """
    low = min(jd_outside, jd_inside)
    high = max(jd_outside, jd_inside)
    
    for _ in range(15): # Precision to ~1 minute
        mid = (low + high) / 2
        mid_lon = get_saturn_long(mid)
        mid_sign = get_sign_from_long(mid_lon)
        
        if mid_sign == target_sign:
            # mid is inside
            if jd_inside > jd_outside: # Forward case: low=out, high=in
                high = mid
            else: # Backward case: low=out, high=in (Wait, if searching back, we found out->in transition in reverse)
                # Let's standardize: 
                # We want the boundary where t < T is out, t >= T is in.
                pass
    
    # Simplified refinement: linear scan day by day then hour
    # Because binary search is tricky with retrogrades (oscillations near border).
    # Let's just find the first day it's inside.
    
    start = min(jd_outside, jd_inside)
    end = max(jd_outside, jd_inside)
    
    curr = start
    while curr <= end:
        s = get_sign_from_long(get_saturn_long(curr))
        if s == target_sign:
            return curr
        curr += 0.05 # ~1.2 hours
        
    return end

def calculate_sade_sati_details(birth_date, moon_sign_index):
    """
    Calculates detailed Sade Sati status and dates.
    """
    if isinstance(birth_date, str):
        try:
            birth_date = datetime.strptime(birth_date, "%d/%m/%Y")
        except ValueError:
            try:
                birth_date = datetime.strptime(birth_date, "%Y-%m-%d")
            except ValueError:
                logger.error(f"Invalid date format for sade sati: {birth_date}")
                birth_date = datetime.now()

    current_date = datetime.now()
    current_jd = swe.julday(current_date.year, current_date.month, current_date.day, 
                           current_date.hour + current_date.minute/60.0)
    
    saturn_lon_now = get_saturn_long(current_jd)
    saturn_sign_now = get_sign_from_long(saturn_lon_now)
    
    # Signs relative to Moon
    s12 = (moon_sign_index - 1) % 12
    s1 = moon_sign_index
    s2 = (moon_sign_index + 1) % 12
    
    is_in_sade_sati = False
    phase_name = ""
    phase_desc = ""
    intensity = "low"
    
    # Timelines
    start_date_jd = None
    end_date_jd = None
    
    # Current Status Determination
    if saturn_sign_now == s12:
        is_in_sade_sati = True
        phase_name = "Rising Phase"
        phase_desc = "Saturn in 12th from Moon. Financial stress, unwanted travel, and mental anxiety."
        intensity = "medium"
        # Find Start (Entry into s12)
        start_date_jd = find_ingress_date(s12, current_jd, search_forward=False)
        # Find End (Entry into s1 + 2 signs -> leaving s2)
        # Actually we want the end of the WHOLE Sade Sati (leaving s2)
        # But for now let's get the phases.
        
    elif saturn_sign_now == s1:
        is_in_sade_sati = True
        phase_name = "Peak Phase"
        phase_desc = "Saturn on Moon. Mental heaviness, health issues, and challenges in relationships."
        intensity = "high"
        # Start of Sade Sati was when it entered s12
        # So search back to s12 entry from s1 start
        # First find start of s1
        s1_start = find_ingress_date(s1, current_jd, search_forward=False)
        if s1_start:
            # Search back for s12 entry from s1_start
            start_date_jd = find_ingress_date(s12, s1_start - 10, search_forward=False)
            
    elif saturn_sign_now == s2:
        is_in_sade_sati = True
        phase_name = "Setting Phase"
        phase_desc = "Saturn in 2nd from Moon. Financial recovery begins, but family disputes may occur."
        intensity = "medium"
        # Find start of s12 (way back)
        s2_start = find_ingress_date(s2, current_jd, search_forward=False)
        if s2_start:
            s1_start = find_ingress_date(s1, s2_start - 10, search_forward=False)
            if s1_start:
                start_date_jd = find_ingress_date(s12, s1_start - 10, search_forward=False)

    # Other Saturn Periods (if not Sade Sati)
    other_period = None
    if not is_in_sade_sati:
        dist = (saturn_sign_now - moon_sign_index) % 12
        if dist == 3: # 4th House
            other_period = {
                "name": "Ardha Sade Sati (Dhaiya)",
                "type": "ardha",
                "description": "Saturn is in the 4th house from your Moon. This can bring domestic changes, property issues, or career shifts.",
                "intensity": "medium"
            }
        elif dist == 7: # 8th House
            other_period = {
                "name": "Ashtama Shani",
                "type": "ashtama",
                "description": "Saturn is in the 8th house from your Moon. This is a transformative period that may bring sudden changes or health checks.",
                "intensity": "high"
            }

    # Dates formatting
    # If in Sade Sati, find the END date (When Saturn leaves s2)
    # i.e., enters s2 + 1
    s3 = (moon_sign_index + 2) % 12
    
    if is_in_sade_sati:
        end_date_jd = find_ingress_date(s3, current_jd, search_forward=True)
    else:
        # Not in Sade Sati. Find NEXT start.
        phase_name = "Not Active"
        phase_desc = "You are free from Sade Sati. Enjoy this period of growth."
        start_date_jd = find_ingress_date(s12, current_jd, search_forward=True)
        # End date would be ~7.5 years later
        if start_date_jd:
            # Rough estimate for end to avoid massive calculation
            end_date_jd = start_date_jd + (7.5 * 365.25)

    # Convert JDs to Strings
    def jd_to_str(jd):
        if not jd: return "Unknown"
        y, m, d, h = swe.revjul(jd)
        return f"{int(d):02d} {datetime(y, m, int(d)).strftime('%b')} {y}"

    # Planetary Details for Expert Analysis
    sat_nak = get_nakshatra_details(saturn_lon_now)
    sat_dignity = get_planetary_dignity("Saturn", saturn_sign_now)
    
    # We need natal Moon for dignity/nakshatra
    # Note: moon_sign_index is 0-11. For dignity we just need this.
    moon_dignity = get_planetary_dignity("Moon", moon_sign_index)

    # Calculate Intensity Score
    intensity_data = calculate_intensity_score(
        moon_sign_index, 
        saturn_sign_now, 
        sat_dignity, 
        birth_date,
        current_date,
        is_in_sade_sati
    )

    return {
        "is_in_sade_sati": is_in_sade_sati,
        "phase": phase_name,
        "description": phase_desc,
        "intensity": intensity,
        "intensity_score": intensity_data["score"],
        "intensity_factors": intensity_data["factors"],
        "start_date": jd_to_str(start_date_jd),
        "end_date": jd_to_str(end_date_jd),
        "raw_start_jd": start_date_jd,
        "raw_end_jd": end_date_jd,
        "other_period": other_period,
        "phases": generate_phases_timeline(moon_sign_index, start_date_jd, is_in_sade_sati),
        "nakshatra_timeline": get_nakshatra_timeline(start_date_jd, end_date_jd) if start_date_jd else [],
        "decision_windows": get_decision_windows(start_date_jd, end_date_jd) if start_date_jd else [],
        "planetary_details": {
            "saturn": {
                "longitude": saturn_lon_now,
                "degree": saturn_lon_now % 30,
                "sign": ZODIAC_SIGNS[saturn_sign_now],
                "nakshatra": sat_nak["name"],
                "pada": sat_nak["pada"],
                "lord": sat_nak["lord"],
                "dignity": sat_dignity,
                "is_retro": swe.calc_ut(current_jd, swe.SATURN, swe.FLG_SWIEPH)[0][3] < 0
            },
            "moon": {
                "sign": ZODIAC_SIGNS[moon_sign_index],
                "dignity": moon_dignity,
                "resilience": "Medium" # Default, can be refined with full chart
            }
        }
    }

def calculate_intensity_score(moon_sign, saturn_sign, sat_dignity, birth_date, current_date, is_active):
    """Calculates a detailed intensity score with breakdown factors."""
    score = 0
    factors = []
    
    if not is_active:
        return {"score": 0, "factors": []}

    # 1. Saturn Dignity
    if sat_dignity == "Exalted": 
        score += 10
        factors.append({"name": "Saturn Exalted", "impact": -15, "desc": "High dignity reduces harshness."})
    elif sat_dignity == "Debilitated":
        score += 35
        factors.append({"name": "Saturn Debilitated", "impact": 20, "desc": "Low dignity increases struggle."})
    elif sat_dignity == "Own Sign":
        score += 15
        factors.append({"name": "Saturn in Own Sign", "impact": -10, "desc": "Controlled and disciplined energy."})
    else:
        score += 25

    # 2. Phase Impact
    dist = (saturn_sign - moon_sign) % 12
    if dist == 0:
        score += 30
        factors.append({"name": "Peak Phase (Janma)", "impact": 30, "desc": "Maximum pressure on mental health."})
    elif dist == 11:
        score += 20
        factors.append({"name": "Rising Phase", "impact": 15, "desc": "Initial shift and heavy expenses."})
    else:
        score += 15
        factors.append({"name": "Setting Phase", "impact": 10, "desc": "Family stress but light at tunnel end."})

    # 3. Age Factor (Cycle count)
    age = (current_date - birth_date).days / 365.25
    if age < 30:
        # 1st cycle
        score += 10
        factors.append({"name": "1st Cycle (Youth)", "impact": 5, "desc": "Experimental and formative challenges."})
    elif age < 60:
        # 2nd cycle
        score += 20
        factors.append({"name": "2nd Cycle (Mid-life)", "impact": 15, "desc": "Maximum career and family pressure."})
    else:
        # 3rd cycle
        score += 15
        factors.append({"name": "3rd Cycle (Elder)", "impact": 10, "desc": "Focus on health and legacy."})

    # 4. Jupiter Protection (Simplified check for now)
    # Get Jupiter sign
    jd_now = swe.julday(current_date.year, current_date.month, current_date.day)
    jup_lon = swe.calc_ut(jd_now, swe.JUPITER, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
    jup_sign = int(jup_lon / 30)
    
    # Aspect check: 1st, 5th, 7th, 9th from Moon
    jup_dist = (jup_sign - moon_sign) % 12
    if jup_dist in [0, 4, 6, 8]:
        score -= 15
        factors.append({"name": "Jupiter Protection", "impact": -20, "desc": "Benefic aspect mitigates damage."})

    return {"score": min(110, score), "factors": factors}

def get_nakshatra_timeline(start_jd, end_jd):
    """Generates a list of Saturn's Nakshatra transits across the 7.5 year span."""
    if not start_jd or not end_jd: return []
    
    timeline = []
    current_jd = start_jd
    
    # Sample every 60 days to find boundaries
    step = 60
    while current_jd < end_jd:
        lon = get_saturn_long(current_jd)
        nak = get_nakshatra_details(lon)
        
        # If new nakshatra or first entry
        if not timeline or timeline[-1]["name"] != nak["name"]:
            timeline.append({
                "name": nak["name"],
                "start": (datetime(1970,1,1) + timedelta(seconds=(current_jd - 2440587.5)*86400)).strftime('%b %Y'),
                "desc": f"Transit through {nak['name']} ({nak['lord']}-ruled)"
            })
        current_jd += step
        
    return timeline[:12] # Limit to avoid bloat

def get_decision_windows(start_jd, end_jd):
    """Categorizes windows for Job, Finance, and Health."""
    # Simple logic: Better windows during Rising/Setting vs Peak
    # Or check Saturn speed / retrograde later.
    # For now, generate 4-month windows.
    return [
        {"type": "Job", "status": "Avoid", "date": "Next 6 Months", "reason": "Saturn approaching natal Moon"},
        {"type": "Investment", "status": "Caution", "date": "After 1 Year", "reason": "Saturn shifting to faster degrees"},
        {"type": "Travel", "status": "Good", "date": "Phase Transitions", "reason": "Karmic baggage clearing"}
    ]

def generate_phases_timeline(moon_sign_index, start_jd, is_active):
    """
    Generates the specific dates for Rising, Peak, Setting.
    If is_active is True, start_jd is the actual start.
    """
    if not start_jd:
        return []
        
    # Recalculate precise transitions from start_jd forward
    phases = []
    
    s12 = (moon_sign_index - 1) % 12
    s1 = moon_sign_index
    s2 = (moon_sign_index + 1) % 12
    s3 = (moon_sign_index + 2) % 12
    
    # Start (Entry into s12)
    t1 = start_jd
    
    # Rising -> Peak (Entry into s1)
    t2 = find_ingress_date(s1, t1 + 300, search_forward=True) # jump 300 days to avoid boundary noise
    
    # Peak -> Setting (Entry into s2)
    t3 = find_ingress_date(s2, t2 + 300, search_forward=True) if t2 else None
    
    # Setting -> End (Entry into s3)
    t4 = find_ingress_date(s3, t3 + 300, search_forward=True) if t3 else None
    
    def fmt(jd):
        if not jd: return "?"
        y, m, d, _ = swe.revjul(jd)
        return f"{int(d)} {datetime(y, m, int(d)).strftime('%b %Y')}"
        
    current_jd = swe.julday(datetime.now().year, datetime.now().month, datetime.now().day, 12)

    phases.append({
        "phase": "Rising",
        "start": fmt(t1),
        "end": fmt(t2),
        "is_current": t1 <= current_jd < t2 if t2 else False
    })
    phases.append({
        "phase": "Peak",
        "start": fmt(t2),
        "end": fmt(t3),
        "is_current": t2 <= current_jd < t3 if t2 and t3 else False
    })
    phases.append({
        "phase": "Setting",
        "start": fmt(t3),
        "end": fmt(t4),
        "is_current": t3 <= current_jd < t4 if t3 and t4 else False
    })
    
    return phases
