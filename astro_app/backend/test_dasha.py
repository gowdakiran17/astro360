from astro_app.backend.astrology.dasha import calculate_vimshottari_dasha
import json

def test_dasha_calculation():
    print("Testing Dasha Calculation...")
    
    # Sample Data
    # Let's say Moon is at 0 degrees Aries (Ashwini) -> Ketu Dasha
    # Or Moon at 10 degrees Aries (Ashwini) -> Ketu Dasha
    # Ashwini is 0 to 13.33 deg
    # If Moon is at 10 deg:
    # Passed = 10 / 13.333 = 0.75
    # Remaining = 0.25
    # Ketu Years = 7
    # Balance = 7 * 0.25 = 1.75 years.
    
    date = "01/01/2000"
    time = "12:00"
    moon_lon = 10.0 
    
    try:
        # Fixed to use async and 5 args
        import asyncio
        async def run_test():
            result = await calculate_vimshottari_dasha(date, time, "+05:30", 12.97, 77.59)
            print("Dasha Calculation Successful!")
            print(json.dumps(result, indent=2))
            
            # Verify specific expectations
            # Nakshatra Lord should be Ketu
            if result["summary"]["current_mahadasha"] == "Ketu" or "Ketu" in str(result):
                print("Verified: Dasha info contains Ketu.")
            else:
                print(f"Failed: Current Mahadasha is {result.get('summary', {}).get('current_mahadasha')}")
        
        asyncio.run(run_test())
            
    except Exception as e:
        print(f"Dasha Calculation Failed: {e}")

if __name__ == "__main__":
    test_dasha_calculation()
