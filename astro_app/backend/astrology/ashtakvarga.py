from typing import List, Dict

# Standard Ashtakvarga bindu (point) tables
# Based on Brihat Parashara Hora Shastra (BPHS) system.
# Format: Relative positions (houses) from a planet where it contributes a point (Bindu).
# 1-indexed houses.

ASHTAKVARGA_TABLES = {
    "Sun": {
        "Sun": [1, 2, 4, 7, 8, 9, 10, 11],
        "Moon": [3, 6, 10, 11],
        "Mars": [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [3, 5, 6, 9, 10, 11, 12],
        "Jupiter": [5, 6, 9, 11],
        "Venus": [6, 7, 12],
        "Saturn": [1, 2, 4, 7, 8, 9, 10, 11],
        "Lagna": [3, 4, 6, 10, 11, 12]
    },
    "Moon": {
        "Sun": [3, 6, 7, 8, 10, 11],
        "Moon": [1, 3, 6, 7, 10, 11],
        "Mars": [2, 3, 5, 6, 9, 10, 11],
        "Mercury": [1, 3, 4, 5, 7, 8, 10, 11],
        "Jupiter": [1, 4, 7, 8, 10, 11, 12],
        "Venus": [3, 4, 5, 7, 9, 10, 11],
        "Saturn": [3, 5, 6, 11],
        "Lagna": [3, 6, 10, 11]
    },
    "Mars": {
        "Sun": [3, 5, 6, 10, 11],
        "Moon": [3, 6, 11],
        "Mars": [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [3, 5, 6, 11],
        "Jupiter": [6, 10, 11, 12],
        "Venus": [6, 8, 11, 12],
        "Saturn": [1, 4, 7, 8, 9, 10, 11],
        "Lagna": [1, 3, 6, 10, 11]
    },
    "Mercury": {
        "Sun": [5, 6, 9, 11, 12],
        "Moon": [2, 4, 6, 8, 10, 11],
        "Mars": [1, 2, 4, 7, 8, 9, 10, 11],
        "Mercury": [1, 3, 5, 6, 9, 10, 11, 12],
        "Jupiter": [6, 8, 11, 12],
        "Venus": [1, 2, 3, 4, 5, 8, 9, 11],
        "Saturn": [1, 2, 4, 7, 8, 9, 10, 11],
        "Lagna": [1, 2, 4, 6, 8, 10, 11]
    },
    "Jupiter": {
        "Sun": [1, 2, 3, 4, 7, 8, 9, 10, 11],
        "Moon": [2, 5, 7, 9, 11],
        "Mars": [1, 2, 4, 7, 8, 10, 11],
        "Mercury": [1, 2, 4, 5, 6, 9, 10, 11],
        "Jupiter": [1, 2, 3, 4, 7, 8, 10, 11],
        "Venus": [2, 5, 6, 9, 10, 11],
        "Saturn": [3, 5, 6, 12],
        "Lagna": [1, 2, 4, 5, 6, 7, 9, 10, 11]
    },
    "Venus": {
        "Sun": [8, 11, 12],
        "Moon": [1, 2, 3, 4, 5, 8, 9, 11, 12],
        "Mars": [3, 5, 6, 9, 11, 12],
        "Mercury": [3, 5, 6, 9, 11],
        "Jupiter": [5, 8, 9, 10, 11],
        "Venus": [1, 2, 3, 4, 5, 8, 9, 10, 11],
        "Saturn": [3, 4, 5, 8, 9, 10, 11],
        "Lagna": [1, 2, 3, 4, 5, 8, 9, 11]
    },
    "Saturn": {
        "Sun": [1, 2, 4, 7, 8, 10, 11],
        "Moon": [3, 6, 11],
        "Mars": [3, 5, 6, 10, 11, 12],
        "Mercury": [6, 8, 9, 10, 11, 12],
        "Jupiter": [5, 6, 11, 12],
        "Venus": [6, 11, 12],
        "Saturn": [3, 5, 6, 11],
        "Lagna": [1, 3, 4, 6, 10, 11]
    }
}

def calculate_bav(planet_positions: Dict[str, int], target_planet: str) -> List[int]:
    """
    Calculates Binna Ashtakvarga (BAV) for a specific planet.
    planet_positions: { 'Sun': sign_idx, 'Moon': sign_idx, ..., 'Lagna': sign_idx }
    Returns a list of 12 integers (points per sign, 0 to 11).
    """
    bav = [0] * 12
    rules = ASHTAKVARGA_TABLES.get(target_planet)
    if not rules:
        return bav
    
    for source_p, houses in rules.items():
        if source_p in planet_positions:
            source_pos = planet_positions[source_p] # 0-indexed sign
            for h in houses:
                # House h from source_pos
                target_sign = (source_pos + (h - 1)) % 12
                bav[target_sign] += 1
    return bav

def calculate_prastaraka(planet_positions: Dict[str, int], target_planet: str) -> Dict[str, List[int]]:
    """
    Calculates Prastaraka (Detailed Breakdown) for a specific planet.
    Returns a dictionary mapping Donor Planet -> List of 12 (1/0) indicating contribution per sign.
    """
    prastaraka = {}
    rules = ASHTAKVARGA_TABLES.get(target_planet)
    if not rules:
        return prastaraka
        
    # Initialize for all standard donors (7 planets + Lagna)
    donors = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Lagna"]
    for d in donors:
        prastaraka[d] = [0] * 12
        
    for source_p, houses in rules.items():
        if source_p in planet_positions:
            source_pos = planet_positions[source_p]
            row = prastaraka.get(source_p, [0]*12) # Should exist
            for h in houses:
                target_sign = (source_pos + (h - 1)) % 12
                row[target_sign] = 1
            prastaraka[source_p] = row
            
    return prastaraka

def calculate_ashtakvarga(planets_data: List[dict], ascendant_sign_idx: int) -> dict:
    # 1. Prepare position map
    pos_map = {"Lagna": ascendant_sign_idx}
    for p in planets_data:
        # p is {'name': 'Sun', 'longitude': 123.4}
        sign_idx = int(p['longitude'] / 30)
        pos_map[p['name']] = sign_idx
        
    # 2. Calculate BAV and Prastaraka for each of the 7 planets
    main_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    bavs = {}
    prastarakas = {}
    sav = [0] * 12
    
    for p_name in main_planets:
        bav = calculate_bav(pos_map, p_name)
        bavs[p_name] = bav
        prastarakas[p_name] = calculate_prastaraka(pos_map, p_name)
        
        # Accumulate to SAV
        for i in range(12):
            sav[i] += bav[i]
            
    # 3. Summarize Analysis (Summary Summary)
    # Strongest/Weakest signs in SAV
    # Convert to House index (relative to Lagna)
    house_strengths = []
    for i in range(12):
        house_idx = (i - ascendant_sign_idx) % 12 + 1
        house_strengths.append({
            "sign_idx": i,
            "house_idx": house_idx,
            "points": sav[i]
        })
        
    sorted_houses = sorted(house_strengths, key=lambda x: x['points'], reverse=True)
    
    # Best planet = highest total BAV points? 
    # Or highest average across all houses. 
    # Total points are constant for each planet (e.g., Sun=48).
    # So "best performing planet" might mean "the one in the strongest house" or something else.
    # In the screenshot, it shows "Jupiter Total Avg 4.7". 
    # 56 / 12 = 4.66. So it's just total / 12.
    
    stats = {
        "strongest_houses": sorted_houses[:3],
        "weakest_houses": sorted_houses[-3:],
        "average_points": sum(sav) / 12.0,
        "total_points": sum(sav),
        "sav": sav,
        "bavs": bavs,
        "prastarakas": prastarakas,
        "ascendant_sign_idx": ascendant_sign_idx
    }
    
    return stats
