from vedastro import *

try:
    # set birth location
    geolocation = GeoLocation("Tokyo, Japan", 139.83, 35.65)

    # group all birth time data together (day/month/year)
    birth_time = Time("23:40 31/12/2010 +08:00", geolocation)

    #PART 2 : CALCULATE ALL DATA
    #-----------------------------------

    #PLANETS
    # Note: The API might return a list or an object, we will just print what we get
    # Using Calculate.AllPlanetData as per docs found
    allPlanetDataList = Calculate.AllPlanetData(PlanetName.Sun, birth_time)
    print("VedAstro Test Success!")
    # print("Sun Data:", allPlanetDataList) 
except Exception as e:
    print(f"VedAstro Test Failed: {e}")
