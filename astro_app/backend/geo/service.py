import os
import requests
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from datetime import datetime
import pytz

# Initialize Geocoder and TimezoneFinder
geolocator = Nominatim(user_agent="astrology360_app")
tf = TimezoneFinder()

def search_location(query: str):
    """
    Search for a location by name.
    Priority:
    1. Google Maps (if API Key present)
    2. Nominatim (OpenStreetMap) - Fallback
    """
    google_key = os.getenv("GOOGLE_MAPS_API_KEY")
    
    if google_key:
        try:
            return _search_google_maps(query, google_key)
        except Exception as e:
            print(f"Google Maps failed: {e}. Falling back to Nominatim.")

    return _search_nominatim(query)

def _search_google_maps(query: str, api_key: str):
    """
    Search using Google Maps Geocoding API + Timezone API.
    """
    # 1. Geocode
    geo_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={query}&key={api_key}"
    resp = requests.get(geo_url)
    data = resp.json()
    
    if data["status"] != "OK":
        return []
        
    results = []
    for item in data["results"][:5]:
        lat = item["geometry"]["location"]["lat"]
        lon = item["geometry"]["location"]["lng"]
        name = item["formatted_address"]
        
        # 2. Get Timezone (Google Timezone API)
        # Note: In production, you might want to cache this or use timezonefinder to save API calls
        # Here we use timezonefinder to save money/calls, as it is accurate enough offline
        timezone_str = tf.timezone_at(lng=lon, lat=lat)
        
        if not timezone_str:
            timezone_str = "UTC"
            offset_str = "+00:00"
        else:
            tz = pytz.timezone(timezone_str)
            now = datetime.now(tz)
            offset = now.strftime('%z')
            offset_str = f"{offset[:3]}:{offset[3:]}"
            
        results.append({
            "name": name,
            "latitude": lat,
            "longitude": lon,
            "timezone_id": timezone_str,
            "timezone_offset": offset_str
        })
        
    return results

def _search_nominatim(query: str):
    """
    Search using OpenStreetMap (Nominatim).
    """
    try:
        locations = geolocator.geocode(query, exactly_one=False, limit=5, language='en')
        
        if not locations:
            return []
            
        results = []
        for loc in locations:
            lat = loc.latitude
            lon = loc.longitude
            
            # Find Timezone
            timezone_str = tf.timezone_at(lng=lon, lat=lat)
            
            if not timezone_str:
                timezone_str = "UTC"
                offset_str = "+00:00"
            else:
                # Calculate Offset (e.g. +05:30)
                tz = pytz.timezone(timezone_str)
                now = datetime.now(tz)
                offset = now.strftime('%z') # +0530
                # Format to +05:30
                offset_str = f"{offset[:3]}:{offset[3:]}"

            results.append({
                "name": loc.address,
                "latitude": lat,
                "longitude": lon,
                "timezone_id": timezone_str,
                "timezone_offset": offset_str
            })
            
        return results
    except Exception as e:
        print(f"Geocoding error: {e}")
        return []
