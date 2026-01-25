from vedastro import *
import inspect

def discover():
    print("Discovering VedAstro Enums...")
    
    print("\n--- PlanetName Members ---")
    try:
        # iterate attributes of PlanetName class
        for name, value in inspect.getmembers(PlanetName):
            if not name.startswith('_'):
                print(name)
    except Exception as e:
        print(f"Error inspecting PlanetName: {e}")

    print("\n--- HouseName Members ---")
    try:
        for name, value in inspect.getmembers(HouseName):
            if not name.startswith('_'):
                print(name)
    except Exception as e:
        print(f"Error inspecting HouseName: {e}")

    print("\n--- Testing Ascendant Calculation ---")
    try:
        geolocation = GeoLocation("Tokyo, Japan", 139.83, 35.65)
        birth_time = Time("23:40 31/12/2010 +08:00", geolocation)
        
        # Try to find Lagna/Ascendant in PlanetName
        if hasattr(PlanetName, 'Ascendant'):
            print("PlanetName.Ascendant exists!")
        elif hasattr(PlanetName, 'Lagna'):
            print("PlanetName.Lagna exists!")
        else:
            print("Ascendant/Lagna not found directly in PlanetName.")

        # Try House 1 Cusp
        house1_data = Calculate.AllHouseData(HouseName.House1, birth_time)
        print("House 1 Data keys:", house1_data.keys())
        
    except Exception as e:
        print(f"Error testing calculation: {e}")

if __name__ == "__main__":
    discover()
