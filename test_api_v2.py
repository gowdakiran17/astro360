from fastapi.testclient import TestClient
from astro_app.backend.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing API Endpoints...")
    
    # 1. Test /chart/birth
    print("\n1. Testing /chart/birth")
    birth_payload = {
        "date": "31/12/2010",
        "time": "23:40",
        "timezone": "+08:00",
        "latitude": 35.65,
        "longitude": 139.83
    }
    response = client.post("/chart/birth", json=birth_payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        birth_data = response.json()
        print("Success! Ascendant:", birth_data.get("ascendant", {}).get("zodiac_sign"))
        # Save moon longitude for dasha test
        moon_data = next(p for p in birth_data["planets"] if p["name"] == "Moon")
        moon_lon = moon_data["longitude"]
    else:
        print("Failed:", response.text)
        return

    # 2. Test /chart/dasha
    print("\n2. Testing /chart/dasha")
    dasha_payload = {
        "birth_details": birth_payload,
        "moon_longitude": moon_lon
    }
    response = client.post("/chart/dasha", json=dasha_payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        dasha_data = response.json()
        print("Success! Current Mahadasha:", dasha_data.get("current_mahadasha"))
    else:
        print("Failed:", response.text)

    # 3. Test /chart/divisional
    print("\n3. Testing /chart/divisional")
    # Use planets from birth chart result
    planets_list = [{"name": p["name"], "longitude": p["longitude"]} for p in birth_data["planets"]]
    # Add Ascendant to planets list? Usually D-charts include Ascendant.
    # The API expects "planets" list.
    div_payload = {
        "planets": planets_list
    }
    response = client.post("/chart/divisional", json=div_payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        div_data = response.json()
        print("Success! D9 Chart Keys:", div_data.keys())
    else:
        print("Failed:", response.text)

if __name__ == "__main__":
    test_endpoints()
