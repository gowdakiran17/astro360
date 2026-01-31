"""
Debug script to test Life Predictor API endpoint
"""
import sys
sys.path.insert(0, '/Users/kirangowda/Desktop/astro360/astro_app')

from astro_app.backend.services.vedastro_predictor import VedAstroPredictorClient

# Sample birth details
birth_details = {
    "date": "15/01/1990",
    "time": "10:30",
    "timezone": "+05:30",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "location": "Bangalore"
}

print("Testing VedAstro Life Predictor...")
print(f"Birth Details: {birth_details}")
print("\n" + "="*60 + "\n")

try:
    result = VedAstroPredictorClient.get_life_predictor_timeline(
        birth_details,
        start_year=2020,
        end_year=2025
    )
    
    print(f"Status: {result.get('status')}")
    
    if result.get('status') == 'success':
        print(f"Timeline entries: {len(result.get('timeline', []))}")
        print(f"Smart summary years: {len(result.get('smart_summary', []))}")
        print(f"Current period: {result.get('current_period', {}).get('date')}")
        print(f"Upcoming events: {len(result.get('upcoming_events', []))}")
        
        # Show first timeline entry
        if result.get('timeline'):
            print("\nFirst timeline entry:")
            print(result['timeline'][0])
    else:
        print(f"Error: {result.get('message')}")
        
except Exception as e:
    print(f"Exception occurred: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    import traceback
    traceback.print_exc()
