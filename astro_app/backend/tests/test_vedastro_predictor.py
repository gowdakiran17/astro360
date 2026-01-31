"""
Test VedAstro Predictor Integration
Tests life timeline and predictions endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def get_auth_token():
    """Login and get auth token"""
    login_url = f"{BASE_URL}/auth/login"
    payload = {
        "email": "test@example.com",
        "password": "test123"
    }
    try:
        response = requests.post(login_url, json=payload)
        if response.status_code == 200:
            return response.json().get("access_token")
    except:
        pass
    return None

def test_life_timeline():
    """Test /chart/period/life-timeline endpoint"""
    print("\n=== Testing Life Timeline Endpoint ===")
    
    url = f"{BASE_URL}/chart/period/life-timeline"
    
    payload = {
        "birth_details": {
            "date": "15/01/1990",
            "time": "12:30",
            "timezone": "+05:30",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "name": "Test User"
        },
        "start_year": 2026,
        "end_year": 2031
    }
    
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    try:
        print(f"Requesting timeline from 2026 to 2031...")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"VedAstro Timeline Periods: {len(data.get('vedastro_timeline', []))}")
            print(f"Life Timeline Points: {len(data.get('life_timeline', []))}")
            print(f"Major Events: {len(data.get('major_events', []))}")
            print(f"\nNarrative: {data.get('narrative', {}).get('headline', 'N/A')}")
            
            # Show first timeline point
            if data.get('life_timeline'):
                first_point = data['life_timeline'][0]
                print(f"\nFirst Timeline Point:")
                print(f"  Date: {first_point.get('date')}")
                print(f"  Score: {first_point.get('score')}")
                print(f"  Dasha Lord: {first_point.get('dasha_lord')}")
        else:
            print(f"❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_predictions():
    """Test /chart/period/predictions endpoint"""
    print("\n=== Testing Predictions Endpoint ===")
    
    url = f"{BASE_URL}/chart/period/predictions"
    
    payload = {
        "birth_details": {
            "date": "15/01/1990",
            "time": "12:30",
            "timezone": "+05:30",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "name": "Test User"
        },
        "categories": ["marriage", "career", "wealth"]
    }
    
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    try:
        print(f"Requesting predictions for: {', '.join(payload['categories'])}")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            
            predictions = data.get('predictions', {})
            for category, pred in predictions.items():
                print(f"\n{category.upper()}:")
                print(f"  Status: {pred.get('status')}")
                if pred.get('status') == 'success':
                    print(f"  Probability: {pred.get('probability')}")
                    timing = pred.get('timing', {})
                    print(f"  Timing: {timing.get('start')} to {timing.get('end')}")
                else:
                    print(f"  Message: {pred.get('message')}")
        else:
            print(f"❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    print("Testing VedAstro Predictor Integration")
    print("=" * 50)
    
    test_life_timeline()
    test_predictions()
    
    print("\n" + "=" * 50)
    print("Testing Complete")
