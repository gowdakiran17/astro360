
import requests
import json

def test_api():
    url = "http://localhost:3001/chart/period/overview"
    
    payload = {
        "birth_details": {
            "date": "25/01/1990",
            "time": "10:00",
            "timezone": "+05:30",
            "latitude": 12.9716,
            "longitude": 77.5946
        },
        "analysis_date": "24/01/2026"
    }
    
    # We need a token? The endpoint uses Depends(get_current_user).
    # If auth is required, we effectively need to mock a login or disable auth for test.
    # But wait, looking at calculations.py:
    # @router.post("/period/overview")
    # async def get_period_overview(..., current_user: User = Depends(get_current_user)):
    
    # Yes, it requires auth.
    # I can try to login first? Or just try and see if I get 401.
    
    print(f"POSTing to {url}...")
    try:
        # Create a mock token if I can't login easily?
        # Better: Try to login first.
        # But I don't have user creds.
        
        # Let's try without token first to confirm server acts normally (401).
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 401:
            print("Auth required. This confirms server is reachable but we need a token.")
            print("Cannot proceed with full test without credentials.")
        elif response.status_code == 200:
             print("Success! (Auth was bypassed or not needed?)")
             print(json.dumps(response.json(), indent=2))
        else:
             print("Error Response:")
             print(response.text)
             
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_api()
