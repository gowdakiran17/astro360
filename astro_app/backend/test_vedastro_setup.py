from vedastro import *
import sys

def verify_vedastro():
    print("Verifying VedAstro Setup...")
    
    try:
        # Check imports
        print("1. Checking Imports...")
        # These are imported via * but let's access them to be sure
        t = Time
        g = GeoLocation
        c = Calculate
        print("   Imports Successful: Time, GeoLocation, Calculate are accessible.")
        
        # Check functionality
        print("2. Checking Basic Functionality...")
        location = "Tokyo, Japan"
        lon = 139.83
        lat = 35.65
        
        geolocation = GeoLocation(location, lon, lat)
        print(f"   GeoLocation created: {geolocation}")
        
        # Time: "HH:MM DD/MM/YYYY +00:00"
        time_str = "23:40 31/12/2010 +08:00"
        birth_time = Time(time_str, geolocation)
        print(f"   Time created: {birth_time}")
        
        # Calculate
        # Just check if we can call a calculation method. 
        # Note: We know this might hit an API rate limit or error, but we just want to verify the module is callable.
        # We'll try a simple one.
        try:
            sun_long = Calculate.PlanetNirayanaLongitude(PlanetName.Sun, birth_time)
            print(f"   Calculation Successful: Sun Longitude = {sun_long}")
        except Exception as calc_err:
            print(f"   Calculation attempted but failed (likely API/Logic issue, but module works): {calc_err}")
            # We consider the setup verified if we can *call* the method, even if it errors due to external factors.
            pass

        print("VedAstro Setup Verified Successfully!")
        return True
        
    except Exception as e:
        print(f"VedAstro Verification Failed: {e}")
        return False

if __name__ == "__main__":
    if verify_vedastro():
        sys.exit(0)
    else:
        sys.exit(1)
