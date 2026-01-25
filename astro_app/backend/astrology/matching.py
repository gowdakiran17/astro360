import swisseph as swe
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.astrology.utils import normalize_degree
from astro_app.backend.astrology.external_api import astrology_api_service
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# 1. VARN (1 Point)
RASHI_VARNA = {
    "Cancer": 4, "Scorpio": 4, "Pisces": 4,     # Brahman
    "Aries": 3, "Leo": 3, "Sagittarius": 3,      # Kshatriya
    "Taurus": 2, "Virgo": 2, "Capricorn": 2,     # Vaishya
    "Gemini": 1, "Libra": 1, "Aquarius": 1       # Shudra
}

# 2. VASHYA (2 Points)
# 1: Chatuspad (Quadruped), 2: Manav (Human), 3: Jalchar (Water), 4: Vanachar (Wild), 5: Keeta (Insect)
RASHI_VASHYA = {
    "Aries": 1, "Taurus": 1, "Sagittarius": 1, "Capricorn": 1, "Leo": 4,
    "Gemini": 2, "Virgo": 2, "Libra": 2, "Aquarius": 2,
    "Cancer": 3, "Pisces": 3, "Scorpio": 5
}

# 3. YONI (4 Points)
# 1: Horse, 2: Elephant, 3: Sheep, 4: Serpent, 5: Dog, 6: Cat, 7: Rat, 8: Cow, 9: Buffalo, 10: Tiger, 11: Deer, 12: Monkey, 13: Lion, 14: Mongoose
NAK_YONI = [
    1, 2, 3, 4, 4, 5, 6, 3, 6, 7, 7, 8, 9, 10, 9, 10, 11, 11, 5, 12, 12, 12, 13, 13, 13, 2, 2
]

YONI_COMPAT = [
    [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 1, 3, 2, 1],
    [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
    [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 1, 2],
    [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 4],
    [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
    [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 2, 1, 2],
    [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
    [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
    [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
    [1, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
    [3, 3, 0, 2, 2, 2, 2, 2, 2, 1, 2, 4, 3, 2],
    [2, 2, 1, 0, 1, 1, 1, 2, 2, 2, 2, 3, 4, 2],
    [1, 0, 2, 4, 1, 2, 2, 1, 1, 1, 1, 2, 2, 4]
]

# 4. GRAHA MAITRI (5 Points)
PLANET_LORDS = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
}

FRIENDSHIP = {
    "Sun": {"Sun": 5, "Moon": 5, "Mars": 5, "Mercury": 4, "Jupiter": 5, "Venus": 0, "Saturn": 0},
    "Moon": {"Sun": 5, "Moon": 5, "Mars": 4, "Mercury": 5, "Jupiter": 4, "Venus": 0.5, "Saturn": 0.5},
    "Mars": {"Sun": 5, "Moon": 4, "Mars": 5, "Mercury": 0.5, "Jupiter": 5, "Venus": 3, "Saturn": 0.5},
    "Mercury": {"Sun": 4, "Moon": 1, "Mars": 0.5, "Mercury": 5, "Jupiter": 0.5, "Venus": 5, "Saturn": 4},
    "Jupiter": {"Sun": 5, "Moon": 4, "Mars": 5, "Mercury": 0.5, "Jupiter": 5, "Venus": 0.5, "Saturn": 3},
    "Venus": {"Sun": 0, "Moon": 0.5, "Mars": 3, "Mercury": 5, "Jupiter": 0.5, "Venus": 5, "Saturn": 5},
    "Saturn": {"Sun": 0, "Moon": 0.5, "Mars": 0.5, "Mercury": 4, "Jupiter": 3, "Venus": 5, "Saturn": 5}
}

# 5. GANA (6 Points)
# 1: Deva, 2: Manushya, 3: Rakshasa
NAK_GANA = [
    1, 2, 3, 2, 1, 2, 1, 1, 3, 3, 2, 2, 1, 3, 1, 3, 1, 3, 3, 2, 2, 1, 3, 3, 2, 2, 1
]
GANA_COMPAT = [
    [6, 6, 1],
    [6, 6, 0],
    [1, 0, 6]
]

# 6. NADI (8 Points)
# 1: Aadi, 2: Madhya, 3: Antya
NAK_NADI = [
    1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3
]

async def calculate_match_score(boy_details: dict, girl_details: dict):
    # 1. Try external API
    external_data = await astrology_api_service.get_matching(boy_details, girl_details)
    if external_data:
        logger.info("Successfully fetched matching score from astrology-api.io")
        return external_data

    # 2. Fallback to local calculation
    def get_chart(details):
        return calculate_chart(
            details.get('date', details.get('date_str')),
            details.get('time', details.get('time_str')),
            details.get('timezone', details.get('timezone_str')),
            details.get('latitude'),
            details.get('longitude')
        )

    boy_chart = get_chart(boy_details)
    girl_chart = get_chart(girl_details)
    
    boy_moon = next(p for p in boy_chart['planets'] if p['name'] == 'Moon')
    girl_moon = next(p for p in girl_chart['planets'] if p['name'] == 'Moon')
    
    boy_rashi = boy_moon['zodiac_sign']
    girl_rashi = girl_moon['zodiac_sign']
    
    # Get Nakshatra Index (0-26)
    nakshatra_span = 360 / 27
    boy_nak_idx = int(normalize_degree(boy_moon['longitude']) / nakshatra_span)
    girl_nak_idx = int(normalize_degree(girl_moon['longitude']) / nakshatra_span)
    
    results = {}
    
    # 1. VARNA (1 Point)
    bv = RASHI_VARNA.get(boy_rashi, 1)
    gv = RASHI_VARNA.get(girl_rashi, 1)
    results['varna'] = {"score": 1 if bv >= gv else 0, "max": 1, "label": "Varna", "desc": "Work & Duty"}
    
    # 2. VASHYA (2 Points)
    bvash = RASHI_VASHYA.get(boy_rashi, 1)
    gvash = RASHI_VASHYA.get(girl_rashi, 1)
    vash_score = 0
    if bvash == gvash: vash_score = 2
    elif (bvash == 1 and gvash == 2) or (bvash == 2 and gvash == 1): vash_score = 1
    else: vash_score = 1 
    results['vashya'] = {"score": vash_score, "max": 2, "label": "Vashya", "desc": "Dominance & Control"}
    
    # 3. TARA (3 Points)
    diff = (girl_nak_idx - boy_nak_idx + 1) % 9
    if diff in [3, 5, 7]: tara_score = 1.5
    elif diff == 0: tara_score = 3
    else: tara_score = 3
    results['tara'] = {"score": tara_score, "max": 3, "label": "Tara", "desc": "Destiny & Health"}
    
    # 4. YONI (4 Points)
    byoni = NAK_YONI[boy_nak_idx]
    gyoni = NAK_YONI[girl_nak_idx]
    yoni_score = YONI_COMPAT[byoni-1][gyoni-1]
    results['yoni'] = {"score": yoni_score, "max": 4, "label": "Yoni", "desc": "Sexual & Mutual Love"}
    
    # 5. GRAHA MAITRI (5 Points)
    blord = PLANET_LORDS.get(boy_rashi, "Sun")
    glord = PLANET_LORDS.get(girl_rashi, "Sun")
    gm_score = FRIENDSHIP.get(blord, {}).get(glord, 1)
    results['graha_maitri'] = {"score": gm_score, "max": 5, "label": "Graha Maitri", "desc": "Psychological Match"}
    
    # 6. GANA (6 Points)
    bgana = NAK_GANA[boy_nak_idx]
    ggana = NAK_GANA[girl_nak_idx]
    gana_score = GANA_COMPAT[bgana-1][ggana-1]
    results['gana'] = {"score": gana_score, "max": 6, "label": "Gana", "desc": "Temperament & Behavior"}
    
    # 7. BHAKOOT (7 Points)
    r_boy = list(PLANET_LORDS.keys()).index(boy_rashi)
    r_girl = list(PLANET_LORDS.keys()).index(girl_rashi)
    r_diff = (r_girl - r_boy + 1) % 12
    if r_diff in [0, 1, 7]: bhakoot_score = 7 # 1/1, 1/7
    elif r_diff in [2, 12]: bhakoot_score = 0 # 2/12
    elif r_diff in [5, 9]: bhakoot_score = 0 # 5/9
    elif r_diff in [6, 8]: bhakoot_score = 0 # 6/8
    else: bhakoot_score = 7
    results['bhakoot'] = {"score": bhakoot_score, "max": 7, "label": "Bhakoot", "desc": "Family & Love"}
    
    # 8. NADI (8 Points)
    bnadi = NAK_NADI[boy_nak_idx]
    gnadi = NAK_NADI[girl_nak_idx]
    nadi_score = 8 if bnadi != gnadi else 0
    results['nadi'] = {"score": nadi_score, "max": 8, "label": "Nadi", "desc": "Health & Children"}
    
    total = sum(v['score'] for v in results.values())

    # Manglik Check
    def check_manglik(chart):
        mars = next(p for p in chart['planets'] if p['name'] == 'Mars')
        is_manglik = mars['house'] in [1, 4, 7, 8, 12]
        # Partial check for 7th house strength
        house_7 = next(h for h in chart['houses'] if h['house_number'] == 7)
        return is_manglik, house_7

    boy_manglik, boy_7 = check_manglik(boy_chart)
    girl_manglik, girl_7 = check_manglik(girl_chart)
    
    # 7th House Strength (Simplified: check for planets in 7th)
    def get_7th_strength(chart):
        planets_in_7 = [p['name'] for p in chart['planets'] if p['house'] == 7]
        strength = 20 # Base
        for p in planets_in_7:
            if p in ["Jupiter", "Venus", "Moon"]: strength += 5
            if p in ["Saturn", "Mars", "Rahu", "Ketu"]: strength -= 3
        return strength, planets_in_7

    boy_7_strength, boy_7_planets = get_7th_strength(boy_chart)
    girl_7_strength, girl_7_planets = get_7th_strength(girl_chart)

    return {
        "success": True,
        "total_score": total,
        "maximum_score": 36,
        "details": results,
        "manglik": {
            "boy": boy_manglik,
            "girl": girl_manglik,
            "compatible": (boy_manglik == girl_manglik)
        },
        "house_7_analysis": {
            "boy": {"strength": boy_7_strength, "planets": boy_7_planets, "sign": boy_7['zodiac_sign']},
            "girl": {"strength": girl_7_strength, "planets": girl_7_planets, "sign": girl_7['zodiac_sign']}
        },
        "boy_charts": boy_chart,
        "girl_charts": girl_chart
    }

async def calculate_business_match(p1_details: dict, p2_details: dict):
    """
    Calculates Business Partnership Compatibility.
    Focuses on Financial stability (Jupiter), Communication (Mercury), and Mutual Co-operation (Moon/Ascendant).
    """
    def get_chart(details):
        return calculate_chart(
            details.get('date', details.get('date_str')),
            details.get('time', details.get('time_str')),
            details.get('timezone', details.get('timezone_str')),
            details.get('latitude'),
            details.get('longitude')
        )

    p1_chart = get_chart(p1_details)
    p2_chart = get_chart(p2_details)

    p1_moon = next(p for p in p1_chart['planets'] if p['name'] == 'Moon')
    p2_moon = next(p for p in p2_chart['planets'] if p['name'] == 'Moon')
    
    p1_asc = next(p for p in p1_chart['planets'] if p['name'] == 'Ascendant')
    p2_asc = next(p for p in p2_chart['planets'] if p['name'] == 'Ascendant')

    # Helper: Get Rashi Index
    rashi_list = list(PLANET_LORDS.keys())
    def get_rashi_idx(rashi_name):
        return rashi_list.index(rashi_name)

    # 1. Mutual Moon Relationship (40 pts)
    # Good: 3/11, 4/10, 1/7, 1/1. Bad: 6/8 (Shashtashtaka), 2/12 (Dwirdwadasha), 5/9 (sometimes considered bad for business if not friendly)
    r1 = get_rashi_idx(p1_moon['zodiac_sign'])
    r2 = get_rashi_idx(p2_moon['zodiac_sign'])
    diff = (r2 - r1 + 1) % 12
    if diff == 0: diff = 12 # 12th position

    # Normalize relative positions (e.g., 1/1 is dist 0)
    # Actually simpler: absolute difference
    # 1-1 = 0. 
    # Let's use the standard "distance from p1 to p2"
    
    dist = (r2 - r1) % 12 + 1 # 1 to 12
    
    moon_score = 0
    moon_desc = ""
    
    if dist in [1, 7]: # Same or Opposite
        moon_score = 35
        moon_desc = "Excellent understanding and shared vision."
    elif dist in [3, 11]: # Friendly
        moon_score = 40
        moon_desc = "Great growth and gains together."
    elif dist in [4, 10]: # Kendra (Work/Home)
        moon_score = 30
        moon_desc = "Productive and stable partnership."
    elif dist in [5, 9]: # Trikona
        moon_score = 25
        moon_desc = "Good harmony but may lack drive."
    elif dist in [2, 12]: # 2/12
        moon_score = 10
        moon_desc = "Financial friction possible."
    elif dist in [6, 8]: # 6/8
        moon_score = 5
        moon_desc = "Conflicts and misunderstandings likely."
        
    # 2. Ascendant Compatibility (30 pts) - Personality Match
    a1 = get_rashi_idx(p1_asc['zodiac_sign'])
    a2 = get_rashi_idx(p2_asc['zodiac_sign'])
    asc_dist = (a2 - a1) % 12 + 1
    
    asc_score = 0
    if asc_dist in [1, 7, 3, 11, 4, 10, 5, 9]:
        asc_score = 25
        if asc_dist in [3, 11]: asc_score = 30
    else:
        asc_score = 10
        
    # 3. Planet Strength (Jupiter & Mercury) (30 pts)
    # Check if Jupiter or Mercury are in good houses (1, 4, 5, 7, 9, 10, 11) in own chart
    def check_planets(chart):
        score = 0
        for p in chart['planets']:
            if p['name'] in ['Jupiter', 'Mercury']:
                if p['house'] in [1, 4, 5, 7, 9, 10, 11]:
                    score += 7.5
        return min(score, 15) # Max 15 per person
        
    planet_score = check_planets(p1_chart) + check_planets(p2_chart)
    
    total = moon_score + asc_score + planet_score
    
    return {
        "success": True,
        "total_score": total,
        "maximum_score": 100,
        "details": {
            "moon_compatibility": {"score": moon_score, "max": 40, "desc": moon_desc},
            "ascendant_compatibility": {"score": asc_score, "max": 30, "desc": "Personality and working style match."},
            "wealth_planets": {"score": planet_score, "max": 30, "desc": "Strength of Jupiter (Wealth) and Mercury (Business)."}
        },
        "conclusion": "Excellent Partnership" if total > 75 else "Good Partnership" if total > 60 else "Average Partnership" if total > 40 else "Challenging Partnership"
    }
