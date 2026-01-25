from vedastro import *
import json

def explore():
    try:
        # set birth location
        geolocation = GeoLocation("Tokyo, Japan", 139.83, 35.65)

        # group all birth time data together (day/month/year)
        birth_time = Time("23:40 31/12/2010 +08:00", geolocation)

        # PLANETS
        # AllPlanetData returns a list of some objects.
        # Let's inspect one.
        
        # According to docs snippet: 
        # allPlanetDataList = Calculate.AllPlanetData(PlanetName.Sun, birth_time)
        # This seems to calculate data FOR Sun. 
        # But maybe we want data for ALL planets?
        
        # Let's try to get data for Sun and see what it contains.
        sun_data = Calculate.AllPlanetData(PlanetName.Sun, birth_time)
        
        print("Type of sun_data:", type(sun_data))
        print("String representation:", str(sun_data))
        
        # It might be a list of custom objects.
        # Let's try to iterate if iterable
        try:
            for item in sun_data:
                print("Item:", item)
                print("Item Type:", type(item))
                # Try to access properties if it's a pythonnet object
                # Common properties might be Name, Longitude, etc.
                # Or maybe it returns a JSON string directly?
                break 
        except:
            print("Not iterable")

        # Also let's try to get simple longitude
        sun_long = Calculate.PlanetNirayanaLongitude(PlanetName.Sun, birth_time)
        print(f"Sun Nirayana Longitude: {sun_long} (Type: {type(sun_long)})")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    explore()
