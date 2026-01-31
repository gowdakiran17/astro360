import requests
import json

def fetch_routes():
    url = "http://localhost:8000/debug/routes"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            routes = response.json()
            print(f"Found {len(routes)} routes.")
            for r in routes:
                if "/period/" in r["path"] or "/chart/" in r["path"]:
                    print(f"{r['methods']} {r['path']}")
        else:
            print(f"Failed to fetch routes: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    fetch_routes()
