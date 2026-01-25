from astro_app.backend.astrology.divisional import calculate_divisional_charts
import json

def test_divisional_charts():
    print("Testing Divisional Charts (D9, D16)...")
    
    # Sample D1 Data
    # Sun in Aries 10 deg -> D9? 
    # Aries is Fire. Start Aries. 10 deg is 4th Navamsa (3.33, 6.66, 10). 
    # Actually 10.0 is end of 3rd or start of 4th?
    # 0-3.20 (1), 3.20-6.40 (2), 6.40-10.00 (3). So it's exactly end of 3rd (Gemini).
    # Let's use 11 deg -> 4th Navamsa -> Cancer.
    
    planets_d1 = [
        {"name": "Sun", "longitude": 11.0}, # Aries 11 deg
        {"name": "Moon", "longitude": 65.0}, # Gemini 5 deg
    ]
    
    try:
        result = calculate_divisional_charts(planets_d1)
        print("Divisional Calculation Successful!")
        print(json.dumps(result, indent=2))
        
        # Verify D9 Sun
        # Aries 11 deg. 
        # Fire sign (1). Start Aries.
        # 11 deg / 3.33 = 3.3 -> 4th part (index 3).
        # Aries(0) + 3 = Cancer(3).
        sun_d9 = next(p for p in result["D9"] if p["name"] == "Sun")
        if sun_d9["zodiac_sign"] == "Cancer":
            print("Verified: Sun D9 is Cancer.")
        else:
            print(f"Failed: Sun D9 is {sun_d9['zodiac_sign']}")
            
    except Exception as e:
        print(f"Divisional Calculation Failed: {e}")

if __name__ == "__main__":
    test_divisional_charts()
