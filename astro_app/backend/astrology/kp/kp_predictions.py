"""
KP Predictions and Event Analysis
Implements event potential analysis and detailed predictions for various life areas.

Event House Combinations:
- Job/Career: 2,6,10,11
- Promotion: 2,6,10,11
- Marriage: 2,7,11
- Love: 5,7,11
- Foreign Travel: 3,9,12
- Property: 4,11
- Finance/Wealth: 2,11
- Health: 1,5,11
- Education: 4,5,9,11
- Business: 7,10,11
"""

from typing import Dict, List
from .kp_significators import get_house_significators_for_planet, analyze_event_potential

# Event house combinations
EVENT_HOUSES = {
    "job_promotion": [2, 6, 10, 11],
    "career_change": [2, 6, 10, 11],
    "marriage": [2, 7, 11],
    "love_relationship": [5, 7, 11],
    "foreign_travel": [3, 9, 12],
    "property_purchase": [4, 11],
    "wealth_gains": [2, 11],
    "financial_growth": [2, 5, 9, 11],
    "health_recovery": [1, 5, 11],
    "education_success": [4, 5, 9, 11],
    "business_success": [7, 10, 11],
    "lottery_win": [2, 5, 8, 11],  # Rare combination
    "name_fame": [1, 5, 10, 11],
    "spiritual_growth": [5, 9, 12]
}


def analyze_planet_potential(
    planet_name: str,
    planet_details: Dict,
    house_cusps: List[Dict],
    significators: Dict[int, Dict[str, List[str]]]
) -> Dict:
    """
    Analyze the potential of a planet for various life events.
    
    Args:
        planet_name: Name of the planet
        planet_details: Planet's KP details
        house_cusps: House cusps
        significators: Significators dict
        
    Returns:
        Dict with event potentials
    """
    potentials = {}
    
    for event_name, event_houses in EVENT_HOUSES.items():
        # Use the planet's sub lord for analysis
        sub_lord = planet_details.get("sub_lord", planet_name)
        
        # Analyze potential
        result = analyze_event_potential(event_houses, sub_lord, significators)
        
        potentials[event_name] = {
            "event": event_name.replace("_", " ").title(),
            "potential": result["potential"],
            "confidence": result["confidence"],
            "reason": result["reason"]
        }
    
    return potentials


def generate_detailed_prediction(
    current_period: Dict,
    house_cusps: List[Dict],
    planets: List[Dict],
    significators: Dict[int, Dict[str, List[str]]]
) -> Dict:
    """
    Generate detailed prediction for current Dasha period.
    
    Args:
        current_period: Current Mahadasha and Antardasha info
        house_cusps: House cusps
        planets: Planets list
        significators: Significators dict
        
    Returns:
        Dict with detailed prediction
    """
    mahadasha = current_period.get("mahadasha", {})
    antardasha = current_period.get("antardasha", {})
    
    md_lord = mahadasha.get("lord", "")
    ad_lord = antardasha.get("lord", "")
    
    # Get significators for both lords
    md_houses = get_house_significators_for_planet(md_lord, significators)
    ad_houses = get_house_significators_for_planet(ad_lord, significators)
    
    # Analyze activation
    activated_houses = list(set(md_houses + ad_houses))
    
    # Determine key activations
    activations = []
    if 10 in activated_houses:
        activations.append({
            "house": 10,
            "area": "Career",
            "description": f"The 10th House (Career) is strongly activated through the {ad_lord} connection. This indicates a high probability of promotion or professional success."
        })
    
    if 7 in activated_houses:
        activations.append({
            "house": 7,
            "area": "Marriage/Partnership",
            "description": f"The 7th House is activated, suggesting significant developments in marriage or partnerships."
        })
    
    if 2 in activated_houses and 11 in activated_houses:
        activations.append({
            "house": "2,11",
            "area": "Financial Gains",
            "description": f"Both 2nd and 11th houses are activated, indicating potential for financial gains and wealth accumulation."
        })
    
    # Cautions
    cautions = []
    if 8 in activated_houses:
        cautions.append({
            "house": 8,
            "warning": f"The 8th House connection suggests sudden changes. Avoid office politics during this period."
        })
    
    if 6 in activated_houses and 12 in activated_houses:
        cautions.append({
            "house": "6,12",
            "warning": f"6th and 12th house activation may bring expenses or health concerns. Practice caution."
        })
    
    return {
        "period": f"{md_lord} Mahadasha → {ad_lord} Antardasha",
        "start_date": antardasha.get("start_date", ""),
        "end_date": antardasha.get("end_date", ""),
        "activated_houses": activated_houses,
        "key_activations": activations,
        "cautions": cautions,
        "mahadasha_houses": md_houses,
        "antardasha_houses": ad_houses
    }


def analyze_category_report(
    category: str,
    house_cusps: List[Dict],
    planets: List[Dict],
    significators: Dict[int, Dict[str, List[str]]],
    dasha_periods: List[Dict]
) -> Dict:
    """
    Generate category-wise detailed report.
    
    Args:
        category: Category name (career, love, finance, etc.)
        house_cusps: House cusps
        planets: Planets list
        significators: Significators dict
        dasha_periods: List of upcoming Dasha periods
        
    Returns:
        Dict with category analysis
    """
    # Map categories to houses
    category_houses = {
        "career": [2, 6, 10, 11],
        "love": [5, 7, 11],
        "finance": [2, 5, 9, 11],
        "property": [4, 11],
        "health": [1, 5, 11],
        "fame": [1, 5, 10, 11]
    }
    
    relevant_houses = category_houses.get(category.lower(), [10, 11])
    
    # Find relevant cusp
    main_cusp = house_cusps[relevant_houses[0] - 1] if relevant_houses else house_cusps[9]
    cusp_sub_lord = main_cusp["sub_lord"]
    
    # Analyze potential
    potential = analyze_event_potential(relevant_houses, cusp_sub_lord, significators)
    
    # Find favorable periods
    favorable_periods = []
    for period in dasha_periods[:5]:  # Next 5 periods
        lord = period.get("lord", "")
        lord_houses = get_house_significators_for_planet(lord, significators)
        
        # Check overlap with category houses
        overlap = list(set(relevant_houses) & set(lord_houses))
        if overlap:
            favorable_periods.append({
                "period": f"{lord} Period",
                "start": period.get("start_date", ""),
                "end": period.get("end_date", ""),
                "houses": overlap,
                "strength": "High" if len(overlap) >= 2 else "Moderate"
            })
    
    return {
        "category": category.title(),
        "relevant_houses": relevant_houses,
        "cusp_sub_lord": cusp_sub_lord,
        "potential": potential,
        "favorable_periods": favorable_periods[:3],  # Top 3
        "analysis": f"Analysis based on houses {relevant_houses} and their significators"
    }
def analyze_event_promise(
    event_id: str,
    house_cusps: List[Dict],
    planets: List[Dict],
    significators: Dict[int, Dict[str, List[str]]]
) -> Dict:
    """
    Analyze the overall promise of an event in the birth chart.
    This consolidates analysis across all relevant planets (Karakas).
    
    Args:
        event_id: Event identifier from EVENT_HOUSES
        house_cusps: House cusps
        planets: Planets list
        significators: Significators dict
        
    Returns:
        Consolidated potential analysis
    """
    if event_id not in EVENT_HOUSES:
        return {
            "potential": "Unknown",
            "confidence": 0,
            "reason": "Event ID not recognized"
        }
        
    event_houses = EVENT_HOUSES[event_id]
    
    # Map event ID to natural Karakay (Significators)
    KARAKAS = {
        "job_promotion": ["Sun", "Saturn", "Jupiter"],
        "marriage": ["Venus", "Jupiter"],
        "love_relationship": ["Venus", "Mars"],
        "foreign_travel": ["Moon", "Saturn", "Rahu"],
        "property_purchase": ["Mars", "Saturn", "Moon"],
        "wealth_gains": ["Jupiter", "Venus", "Moon"],
        "financial_growth": ["Jupiter", "Mercury"],
        "health_recovery": ["Sun", "Jupiter"],
        "education_success": ["Mercury", "Jupiter"],
        "business_success": ["Mercury", "Saturn", "Jupiter"],
        "lottery_win": ["Venus", "Rahu"],
        "name_fame": ["Sun", "Jupiter"],
        "spiritual_growth": ["Jupiter", "Ketu"]
    }
    
    relevant_planets = KARAKAS.get(event_id, ["Jupiter", "Sun"]) # Default to growth karakas
    
    potentials = []
    for p_name in relevant_planets:
        # Find planet details
        p_details = next((p for p in planets if p["planet"] == p_name), None)
        if not p_details:
            continue
            
        sub_lord = p_details.get("sub_lord", "")
        if not sub_lord:
            continue
            
        res = analyze_event_potential(event_houses, sub_lord, significators)
        potentials.append(res)
    
    if not potentials:
        return {"potential": "Mixed", "confidence": 30, "reason": "No clear karakas found for analysis"}
        
    # Consolidate: If any karaka is Excellent/Good, it's promising
    # If all are weak, it's weak
    avg_conf = sum(p["confidence"] for p in potentials) / len(potentials)
    
    # Simple logic for consolidated potential
    p_levels = [p["potential"] for p in potentials]
    if "EXCELLENT" in p_levels or "GOOD" in p_levels:
        final_potential = "YES" if "EXCELLENT" in p_levels else "High"
    elif "WEAK" in p_levels and all(pl == "WEAK" for pl in p_levels):
         final_potential = "NO"
    else:
        final_potential = "Mixed"
        
    return {
        "potential": final_potential,
        "confidence": int(avg_conf),
        "reason": potentials[0]["reason"] # Use the first karaka's reason as a sample
    }
