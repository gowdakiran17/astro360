import requests
import json

def test_birth():
    url = "http://localhost:8000/chart/birth"
    
    payload = {
        "date": "24/01/2026",
        "time": "12:00",
        "timezone": "+05:30",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "name": "Debug User"
    }

    try:
        print(f"Testing {url}...")
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success!")
        else:
            print("Failed! Response:")
            try:
                print(response.json())
            except:
                print(response.text)
                
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_birth()
