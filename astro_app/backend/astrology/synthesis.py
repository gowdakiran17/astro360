from datetime import datetime
from astro_app.backend.astrology.dasha import calculate_vimshottari_dasha
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.astrology.transits import calculate_transits, calculate_transit_aspects
from astro_app.backend.astrology.panchang import calculate_panchang

async def get_combined_analysis(birth_details: dict, current_date_str: str = None, ayanamsa: str = "LAHIRI"):
    """
    Generates a comprehensive astrological analysis combining Vimshottari Dasha and Transits.
    """
    
    # 1. Defaults
    if not current_date_str:
        now = datetime.now()
        current_date_str = now.strftime("%d/%m/%Y")
        current_time_str = now.strftime("%H:%M")
    else:
        current_time_str = "12:00" # Noon for transit default

    # 2. Calculate Birth Chart
    birth_chart = calculate_chart(
        birth_details["date"],
        birth_details["time"],
        birth_details["timezone"],
        birth_details["latitude"],
        birth_details["longitude"]
    )
    
    # Extract Moon Longitude
    moon_lon = 0.0
    for p in birth_chart["planets"]:
        if p["name"] == "Moon":
            moon_lon = p["longitude"]
            break

    # 3. Calculate Dasha (Updated to async and 5 args)
    dasha_data = await calculate_vimshottari_dasha(
        birth_details["date"],
        birth_details["time"],
        birth_details["timezone"],
        birth_details["latitude"],
        birth_details["longitude"],
        moon_longitude=moon_lon,
        ayanamsa=ayanamsa
    )
    
    # Extract Current Dasha Period
    summary = dasha_data.get("summary", {})
    current_md = summary.get("current_mahadasha")
    current_ad = summary.get("current_antardasha")
    current_pd = summary.get("current_pratyantardasha")
    
    # Fallback if summary is missing (shouldn't happen with valid dasha response)
    if not current_md and dasha_data.get("dashas"):
        # Just take the first one or logic to find it
        pass
            
    # 4. Calculate Transits
    transit_planets = calculate_transits(
        current_date_str,
        current_time_str,
        birth_details["timezone"], # Use birth timezone for consistency or user current location
        birth_details["latitude"],
        birth_details["longitude"],
        ayanamsa=ayanamsa
    )
    
    # 5. Calculate Aspects
    aspects = calculate_transit_aspects(birth_chart["planets"], transit_planets)
    
    # 6. Generate Predictions
    predictions = generate_predictions(current_md, current_ad, aspects, transit_planets, birth_chart)
    
    # 7. Calculate Panchang
    panchang = await calculate_panchang(
        current_date_str,
        current_time_str,
        birth_details["timezone"],
        birth_details["latitude"],
        birth_details["longitude"]
    )

    return {
        "dasha_info": {
            "mahadasha": current_md,
            "antardasha": current_ad,
            "pratyantardasha": current_pd
        },
        "transit_info": transit_planets,
        "aspects": aspects,
        "predictions": predictions,
        "panchang": panchang
    }

def generate_predictions(md, ad, aspects, transit_planets, birth_chart):
    """
    Rule-based prediction engine.
    """
    predictions = []
    
    # Rule 1: Dasha Lords
    if md and ad:
        predictions.append({
            "category": "Dasha",
            "title": f"Running Period: {md} - {ad}",
            "description": f"You are currently under the influence of {md} Mahadasha and {ad} Antardasha. "
                           f"The results will depend on the placement of {md} and {ad} in your birth chart.",
            "intensity": "High"
        })

    # Rule 2: Jupiter Transit
    jupiter_transit = next((p for p in transit_planets if p["name"] == "Jupiter"), None)
    if jupiter_transit:
        # Check if Jupiter aspects natal Moon (Gajakesari Yoga activation?)
        moon_aspect = next((a for a in aspects if a["transit_planet"] == "Jupiter" and a["natal_planet"] == "Moon"), None)
        if moon_aspect:
             predictions.append({
                "category": "Transit",
                "title": "Jupiter Influencing Moon",
                "description": f"Jupiter is forming a {moon_aspect['aspect']} with your natal Moon. "
                               "This generally indicates a period of emotional optimism, mental peace, and potential for growth.",
                "intensity": "Medium"
            })
            
    # Rule 3: Saturn Transit (Sade Sati check - simplified)
    # Ideally use `sade_sati.py` logic, but here we just check proximity to Moon
    saturn_transit = next((p for p in transit_planets if p["name"] == "Saturn"), None)
    natal_moon = next((p for p in birth_chart["planets"] if p["name"] == "Moon"), None)
    
    if saturn_transit and natal_moon:
        # Check sign distance
        # This is a very rough approximation. Real Sade Sati logic is more complex.
        pass 

    # Rule 4: General Aspects
    for aspect in aspects:
        if aspect["aspect"] == "Conjunction":
             predictions.append({
                "category": "Transit",
                "title": f"{aspect['transit_planet']} Conjoining Natal {aspect['natal_planet']}",
                "description": f"The energy of {aspect['transit_planet']} is merging with your {aspect['natal_planet']}. "
                               f"This intensifies the themes of {aspect['natal_planet']} in your life.",
                "intensity": "High"
            })
            
    return predictions
