import os
import sys
import json
import logging

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from services.vedastro_predictor import VedAstroPredictorClient

# Setup logging
logging.basicConfig(level=logging.DEBUG)

def debug_vedastro():
    # Load API Key
    from dotenv import load_dotenv
    load_dotenv()
    
    # Sample Birth Details (Use current date/time if needed, or fixed)
    birth_details = {
        "date": "15/01/1990", 
        "time": "12:30",
        "timezone": "+05:30",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "location": "Bangalore"
    }

    # Date Range (2 days)
    start_date = "2026-01-15"
    end_date = "2026-01-16"

    print("--- Fetching Life Predictor Data ---")
    print(f"API Key Present: {bool(os.getenv('VEDASTRO_API_KEY'))}")
    
    try:
        result = VedAstroPredictorClient.get_life_predictor_timeline(
            birth_details,
            start_date,
            end_date
        )
        
        status = result.get('status')
        print(f"Result Status: {status}")
        
        if status == 'error':
            print(f"Error Message: {result.get('message')}")
            return

        raw_predictions = result.get('predictions', []) 
        # HACK: Access raw payload if we can, or just inspect the parsed ones. 
        # Actually, let's copy the code from the class to print raw here.
        
        url = f"{VedAstroPredictorClient.BASE_URL}/Calculate/HoroscopePredictions"
        params = {
            "Location": f"{birth_details['longitude']},{birth_details['latitude']}",
            "Time": VedAstroPredictorClient.format_birth_time(birth_details),
            "Ayanamsa": "LAHIRI",
            "ApiKey": os.getenv("VEDASTRO_API_KEY", "")
        }
        
        print("--- Direct API Call (1st Item) ---")
        import requests
        resp = requests.get(url, params=params, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            payload = data.get("Payload", [])
            print(f"Total Raw Items: {len(payload)}")
            if payload:
                print(json.dumps(payload[0], indent=2))
                
                # Check for specific tags mentioned by user
                print("\n--- Checking for Tags ---")
                for p in payload[:5]:
                    print(f"Name: {p.get('Name')}")
                    print(f"Tags: {p.get('Tags')}")
                    print("-" * 20)
        else:
            print(f"Direct API Failed: {resp.text}")

        return

    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_vedastro()
