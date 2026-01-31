import requests
import json
import socket

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def test_endpoint():
    if not check_port(8000):
        print("Error: Backend is not running on port 8000")
        return

    url = "http://localhost:8000/chart/period/overview"
    
    payload = {
        "birth_details": {
            "date": "24/01/2026",
            "time": "12:00",
            "timezone": "+05:30",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "name": "Debug User"
        },
        "analysis_date": "29/01/2026",
        "ayanamsa": "LAHIRI"
    }

    try:
        print(f"Testing {url}...")
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success! Response:")
            print(json.dumps(response.json(), indent=2)[:500] + "...")
        else:
            print("Failed! Response:")
            try:
                print(response.json())
            except:
                print(response.text)
                
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_endpoint()
