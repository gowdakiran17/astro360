from astro_app.backend.astrology.utils import get_nakshatra_from_sound, NAKSHATRAS

# Nakshatra to Sign Mapping (Simplified: Primary Sign)
# 1 Nakshatra spans 13.33 deg.
# Ashwini (0-13.33) -> Aries
# This is needed to find which HOUSE the Nakshatra falls in relative to Ascendant.
NAKSHATRA_LONGITUDES = {
    name: (i * (360/27)) + (360/27)/2 # Midpoint of Nakshatra
    for i, name in enumerate(NAKSHATRAS)
}

def get_house_from_longitude(longitude: float, ascendant_longitude: float) -> int:
    """
    Calculates House number (1-12) based on Whole Sign Houses.
    """
    asc_sign_idx = int(ascendant_longitude / 30)
    target_sign_idx = int(longitude / 30)
    
    diff = target_sign_idx - asc_sign_idx
    if diff < 0:
        diff += 12
    return diff + 1

def evaluate_vehicle_name(
    brand_name: str, 
    ascendant_longitude: float, 
    venus_longitude: float, 
    fourth_house_lord_strength: str = "Neutral", # Simplified input
    current_mahadasha: str = "Unknown"
) -> dict:
    """
    Evaluates a vehicle/brand name suitability.
    """
    # 1. Map Name to Nakshatra
    nakshatra = get_nakshatra_from_sound(brand_name)
    
    if nakshatra == "Unknown":
        return {
            "name": brand_name,
            "status": "Unknown",
            "explanation": "Could not map name to a Nakshatra sound."
        }
        
    # 2. Identify Activated House
    # We estimate the longitude of the Nakshatra to find its sign/house.
    nak_lon = NAKSHATRA_LONGITUDES[nakshatra]
    activated_house = get_house_from_longitude(nak_lon, ascendant_longitude)
    
    # 3. Evaluate House Quality
    # 1, 2, 4, 5, 7, 9, 10, 11 are generally good.
    # 6, 8, 12 are challenging (Dusthanas).
    # 3 is neutral/effort.
    
    house_quality = "Neutral"
    if activated_house in [1, 2, 4, 5, 9, 10, 11]:
        house_quality = "Supportive"
    elif activated_house in [6, 8, 12]:
        house_quality = "Challenging"
        
    # 4. Check Venus (Karaka for Vehicles)
    # If Venus is strong (e.g., Exalted/Own Sign), it boosts vehicle luck.
    # We don't have full chart here, so we rely on passed params or simple logic.
    # Let's assume passed logic or simple check.
    # Venus Exalted (Pisces), Debilitated (Virgo)
    venus_sign_idx = int(venus_longitude / 30)
    venus_quality = "Neutral"
    if venus_sign_idx == 11: # Pisces (0=Aries... 11=Pisces)
        venus_quality = "Excellent (Exalted)"
    elif venus_sign_idx == 5: # Virgo
        venus_quality = "Weak (Debilitated)"
    elif venus_sign_idx in [1, 6]: # Taurus, Libra (Own)
        venus_quality = "Strong (Own Sign)"
        
    # 5. Synthesis
    explanation = []
    explanation.append(f"Name '{brand_name}' resonates with Nakshatra '{nakshatra}'.")
    explanation.append(f"This activates the {activated_house}th House for you.")
    
    final_status = "Neutral"
    
    if house_quality == "Supportive":
        explanation.append("This house is favorable for gains and comfort.")
        final_status = "Supportive"
    elif house_quality == "Challenging":
        explanation.append("This house is associated with obstacles or losses.")
        final_status = "Challenging"
        
    explanation.append(f"Vehicle Karaka Venus is {venus_quality}.")
    
    # Special rule: 4th House connection
    if activated_house == 4:
        explanation.append("Direct activation of 4th House (Vehicles/Comfort) is excellent.")
        final_status = "Highly Supportive"
        
    # Dasha check
    explanation.append(f"Current Dasha is {current_mahadasha}.")
    
    return {
        "name": brand_name,
        "nakshatra": nakshatra,
        "activated_life_area": f"{activated_house}th House",
        "status": final_status,
        "explanation": " ".join(explanation)
    }
