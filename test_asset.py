import requests
import json

payload = {
    "user_profile": {
        "scores": {"crypto": 85, "stocks": 60},
        "traits": {"risk_appetite": 90},
        "persona": {"type": "Speculative"}
    },
    "asset_name": "Bitcoin",
    "latitude": 40.7128,
    "longitude": -74.0060
}

print("Testing Asset Intelligence Engine...")
try:
    response = requests.post("http://localhost:8000/business/asset-analysis", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("\n--- ASSET REPORT: " + data['asset_name'] + " ---")
        print(f"Rulers: {data['rulers']}")
        print(f"Market Trend: {data['market_data']['trend']} (Strength: {data['market_data']['strength']})")
        print(f"Personal Fit: {data['personal_data']['fit_label']} (Score: {data['personal_data']['suitability_score']})")
        
        print("\n--- RECOMMENDATION ---")
        print(f"Status: {data['recommendation']['status']}")
        print(f"Advice: {data['recommendation']['summary']}")
        print(f"Timing: {data['recommendation']['timing_window']}")
        
    else:
        print("Error:", response.status_code)
        print(response.text)
except Exception as e:
    print(f"Connection failed: {e}")
