from typing import Dict, List, Optional

# Constants
RULERS = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
}

EXALTATION = {
    "Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn", "Mercury": "Virgo",
    "Jupiter": "Cancer", "Venus": "Pisces", "Saturn": "Libra", "Rahu": "Taurus", "Ketu": "Scorpio"
}

DEBILITATION = {
    "Sun": "Libra", "Moon": "Scorpio", "Mars": "Cancer", "Mercury": "Pisces",
    "Jupiter": "Capricorn", "Venus": "Virgo", "Saturn": "Aries", "Rahu": "Scorpio", "Ketu": "Taurus"
}

FRIENDSHIPS = {
    "Sun": {"friends": ["Moon", "Mars", "Jupiter"], "enemies": ["Venus", "Saturn"]},
    "Moon": {"friends": ["Sun", "Mercury"], "enemies": []},
    "Mars": {"friends": ["Sun", "Moon", "Jupiter"], "enemies": ["Mercury"]},
    "Mercury": {"friends": ["Sun", "Venus"], "enemies": ["Moon"]},
    "Jupiter": {"friends": ["Sun", "Moon", "Mars"], "enemies": ["Mercury", "Venus"]},
    "Venus": {"friends": ["Mercury", "Saturn"], "enemies": ["Sun", "Moon"]},
    "Saturn": {"friends": ["Mercury", "Venus"], "enemies": ["Sun", "Moon", "Mars"]},
    "Rahu": {"friends": ["Venus", "Saturn", "Mercury"], "enemies": ["Sun", "Moon", "Mars"]},
    "Ketu": {"friends": ["Mars", "Venus"], "enemies": ["Sun", "Moon", "Saturn"]}
}

ELEMENTS = {
    "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
    "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
    "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
    "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
}

def get_house_lord(house_num: int, houses: Dict) -> str:
    sign = houses[house_num]['zodiac_sign']
    return RULERS.get(sign, "")

def calculate_planet_strength(planet_name: str, chart_data: Dict) -> float:
    """
    Calculates a 0-100 strength score for a planet based on:
    - Sign Placement (Exaltation/Debilitation/Own/Friend/Enemy)
    - House Placement (Kendra/Trikona/Dusthana)
    - Retrograde Status
    """
    planets = {p['name']: p for p in chart_data['planets']}
    planet = planets.get(planet_name)
    
    if not planet:
        return 0.0
        
    score = 50.0 # Base score
    
    sign = planet['zodiac_sign']
    house = planet['house']
    is_retro = planet['is_retrograde']
    
    # 1. Sign Placement
    if sign == EXALTATION.get(planet_name):
        score += 30
    elif sign == DEBILITATION.get(planet_name):
        score -= 20
    elif sign == "Leo" and planet_name == "Sun": # Own signs not covered by Exaltation map
        score += 20
    elif sign == "Cancer" and planet_name == "Moon":
        score += 20
    elif RULERS.get(sign) == planet_name: # Own Sign
        score += 20
    else:
        # Check Friend/Enemy
        lord = RULERS.get(sign)
        friends = FRIENDSHIPS.get(planet_name, {}).get("friends", [])
        enemies = FRIENDSHIPS.get(planet_name, {}).get("enemies", [])
        
        if lord in friends:
            score += 10
        elif lord in enemies:
            score -= 10
            
    # 2. House Placement
    if house in [1, 4, 7, 10]: # Kendra
        score += 15
    elif house in [5, 9]: # Trikona
        score += 10
    elif house in [6, 8, 12]: # Dusthana
        score -= 10
        # Exception: Malefics in Upachaya (3, 6, 11) improve over time
        if planet_name in ["Sun", "Mars", "Saturn", "Rahu"] and house in [3, 6, 11]:
            score += 15 # Reverses the penalty and adds bonus
            
    # 3. Retrograde
    if is_retro:
        if planet_name in ["Saturn", "Mars", "Rahu", "Ketu"]:
            score += 15 # Strong malefics
        elif planet_name in ["Jupiter", "Venus", "Mercury"]:
            score += 10 # Chesta Bala
            
    return max(0.0, min(100.0, score))

def calculate_house_strength(house_num: int, chart_data: Dict) -> float:
    """
    Calculates strength of a house based on:
    - Lord's Strength
    - Planets occupying the house
    """
    houses = {h['house_number']: h for h in chart_data['houses']}
    planets = chart_data['planets']
    
    # Lord Strength
    lord_name = get_house_lord(house_num, houses)
    lord_strength = calculate_planet_strength(lord_name, chart_data)
    
    # Occupants
    occupants_score = 0
    occupants_count = 0
    
    for p in planets:
        if p['house'] == house_num:
            occupants_count += 1
            p_str = calculate_planet_strength(p['name'], chart_data)
            
            # Benefics boost house, Malefics might hurt (context dependent)
            # For wealth (2, 5, 11), generally any strong planet is good
            if p['name'] in ["Jupiter", "Venus", "Mercury", "Moon", "Sun"]:
                occupants_score += (p_str * 0.5)
            else:
                # Malefics in Upachaya/Wealth houses can be good
                if house_num in [3, 6, 11]:
                    occupants_score += (p_str * 0.4)
                elif house_num in [2, 5]: # Speculative houses - Rahu/Mars good for risk
                    if p['name'] in ["Rahu", "Mars"]:
                        occupants_score += (p_str * 0.3)
                    else:
                        occupants_score -= (p_str * 0.2) # Affliction
                else:
                    occupants_score -= (p_str * 0.2)
                    
    total = (lord_strength * 0.6) + occupants_score
    return max(0.0, min(100.0, total))

def analyze_wealth_profile(chart_data: Dict) -> Dict:
    """
    Implements the Personal Market Suitability Engine.
    """
    
    # 1. Calculate Planetary Strengths
    p_scores = {}
    for p in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]:
        p_scores[p] = calculate_planet_strength(p, chart_data)
        
    # 2. Calculate House Strengths
    h_scores = {}
    for h in [2, 5, 10, 11]:
        h_scores[h] = calculate_house_strength(h, chart_data)
        
    # 3. Compute Base Traits (0-100)
    
    # Emotional Stability (E)
    # Moon strength, Saturn aspects (simulated by Saturn strength check)
    # If Saturn is strong, it stabilizes Moon. If Weak, it afflicts.
    saturn_stabilizer = p_scores["Saturn"] / 100.0
    moon_raw = p_scores["Moon"]
    
    # Affliction check: Moon in 6/8/12 or with Malefics (simplified)
    moon_planet = next((p for p in chart_data['planets'] if p['name'] == 'Moon'), {})
    moon_house = moon_planet.get('house', 1)
    moon_affliction = 0
    if moon_house in [6, 8, 12]: moon_affliction = 20
    
    emotional_stability = (moon_raw * 0.6) + (p_scores["Saturn"] * 0.2) - moon_affliction + 20
    emotional_stability = max(0, min(100, emotional_stability))
    
    # Risk Appetite (R)
    # Mars strength, Rahu strength, 5th house
    risk_appetite = (p_scores["Mars"] * 0.4) + (p_scores["Rahu"] * 0.3) + (h_scores[5] * 0.3)
    
    # Intelligence & Timing (T)
    # Mercury, Jupiter, 11th house
    intelligence = (p_scores["Mercury"] * 0.4) + (p_scores["Jupiter"] * 0.3) + (h_scores[11] * 0.3)
    
    # Patience & Discipline (P)
    # Saturn, 10th house, 2nd house
    patience = (p_scores["Saturn"] * 0.4) + (h_scores[10] * 0.3) + (h_scores[2] * 0.3)
    
    # 4. Asset Suitability Formulas
    
    # Crypto Suitability
    # 0.30 × R + 0.25 × E + 0.25 × T + 0.20 × Rahu_Strength
    crypto = (0.30 * risk_appetite) + (0.25 * emotional_stability) + (0.25 * intelligence) + (0.20 * p_scores["Rahu"])
    
    # Stock Suitability
    # 0.40 × P + 0.30 × T + 0.20 × Jupiter_Strength + 0.10 × 2nd_House_Strength
    stocks = (0.40 * patience) + (0.30 * intelligence) + (0.20 * p_scores["Jupiter"]) + (0.10 * h_scores[2])
    
    # Long-Term Wealth
    # 0.40 × P + 0.30 × Saturn_Strength + 0.20 × 10th_House + 0.10 × 2nd_House
    long_term = (0.40 * patience) + (0.30 * p_scores["Saturn"]) + (0.20 * h_scores[10]) + (0.10 * h_scores[2])
    
    # Trading (Intraday/Active)
    # 0.40 × R + 0.30 × T + 0.20 × Mars_Strength + 0.10 × Mercury
    trading = (0.40 * risk_appetite) + (0.30 * intelligence) + (0.20 * p_scores["Mars"]) + (0.10 * p_scores["Mercury"])
    
    # Normalize
    def norm(val): return float(int(max(0, min(100, val))))
    
    scores = {
        "crypto": norm(crypto),
        "stocks": norm(stocks),
        "long_term": norm(long_term),
        "trading": norm(trading)
    }
    
    # 5. Risk Type Classification
    risk_type = "Balanced"
    if risk_appetite > 70 and patience < 40:
        risk_type = "Speculative"
    elif risk_appetite < 40 and patience > 60:
        risk_type = "Conservative"
    # Else Balanced
    
    # 6. Wealth Path Selection
    paths = [
        ("Long-Term", scores["long_term"], "Salary & Funds"),
        ("Stocks", scores["stocks"], "Equity Investor"),
        ("Trading", scores["trading"], "Trader"),
        ("Crypto", scores["crypto"], "Speculator")
    ]
    paths.sort(key=lambda x: x[1], reverse=True)
    
    primary_path = paths[0]
    wealth_path_name = primary_path[2]
    
    # 7. Generate Description & Insights
    insights = []
    
    # Risk/Patience Insight
    if risk_type == "Speculative":
        insights.append("High risk tolerance but low patience. You may win big but risk burnout.")
    elif risk_type == "Conservative":
        insights.append("High patience but low risk tolerance. Steady growth suits you best.")
    else:
        insights.append("Balanced approach. You can adapt to various market conditions.")
        
    # Element Insight
    moon_sign = moon_planet.get('zodiac_sign', '')
    element = ELEMENTS.get(moon_sign, 'Unknown')
    if element == 'Water':
        insights.append("Water Moon: Intuitive but emotional. Don't trade on feelings.")
    elif element == 'Fire':
        insights.append("Fire Moon: Aggressive and confident. Watch out for over-leveraging.")
    elif element == 'Earth':
        insights.append("Earth Moon: Practical and grounded. Great for long-term compounding.")
    elif element == 'Air':
        insights.append("Air Moon: Analytical and quick. Good for identifying trends.")

    # Recommendation
    rec = {
        "best_asset_today": "Stocks" if scores["stocks"] > scores["crypto"] else "Crypto",
        "avoid_asset_today": "Crypto" if scores["stocks"] > scores["crypto"] else "Stocks",
        "guidance": ""
    }
    
    # 8. Control Logic (Example)
    if scores["crypto"] < 50:
        rec["guidance"] = "Crypto market is strong, but this asset is not suitable for you right now."
    elif scores["stocks"] > scores["crypto"]:
        rec["guidance"] = "Stocks are safer for your wealth style."
    else:
        rec["guidance"] = f"Your {wealth_path_name} profile is active."

    return {
        "persona": {
            "type": risk_type,
            "description": f"Your primary wealth path is {wealth_path_name}."
        },
        "scores": scores,
        "traits": {
            "emotional_stability": norm(emotional_stability),
            "risk_appetite": norm(risk_appetite),
            "intelligence": norm(intelligence),
            "patience": norm(patience)
        },
        "insights": insights,
        "wealth_engine": {
            "primary": wealth_path_name,
            "path_type": primary_path[0],
            "details": [{"name": p[2], "score": p[1], "type": p[0]} for p in paths]
        },
        "recommendation": rec
    }
