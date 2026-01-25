
import asyncio
import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.getcwd())

# Mock FastAPI dependencies if needed, or import directly
from astro_app.backend.routers.calculations import get_sade_sati, get_shadbala_energy, get_period_analysis
from astro_app.backend.schemas import BirthDetails, ShadbalaRequest, PeriodRequest, PanchangRequest
from astro_app.backend.models import User
from astro_app.backend.astrology.period_analysis import get_full_period_analysis
from astro_app.backend.astrology.panchang import get_panchang_data
from astro_app.backend.astrology.sade_sati import calculate_sade_sati_details
from astro_app.backend.astrology.shadbala import calculate_shadbala
from astro_app.backend.astrology.chart import calculate_chart

# Mock User
mock_user = User(
    id=1,
    email="test@example.com",
    tier="premium",
    created_at=datetime.now()
)

async def test_panchang():
    print("\n--- Testing Panchang ---")
    try:
        req = PanchangRequest(
            date="24/01/2025",
            time="10:00",
            timezone="+05:30",
            latitude=28.61,
            longitude=77.20
        )
        # Call logic directly first
        from astro_app.backend.astrology.panchang import get_panchang_data, swe
        
        # Convert date/time to JD
        date_parts = req.date.split('/')
        time_parts = req.time.split(':')
        dt = datetime(int(date_parts[2]), int(date_parts[1]), int(date_parts[0]), 
                      int(time_parts[0]), int(time_parts[1]))
        
        jd = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60.0)
        
        # Test get_panchang_data
        result = get_panchang_data(jd, req.latitude, req.longitude)
        print("Panchang Result Keys:", result.keys())
        print("Day Lord:", result.get("day_lord"))
        print("Day Length:", result.get("day_length"))
        
        if result.get("day_length") == "--h --m":
            print("WARNING: Day length calculation failed")
        
    except Exception as e:
        print(f"FAILED Panchang: {e}")
        import traceback
        traceback.print_exc()

async def test_shadbala():
    print("\n--- Testing Shadbala ---")
    try:
        bd = BirthDetails(
            date="15/08/1990",
            time="10:30",
            timezone="+05:30",
            latitude=13.08,
            longitude=80.27
        )
        req = ShadbalaRequest(birth_details=bd)
        
        # 1. Calculate Chart
        chart = calculate_chart(bd.date, bd.time, bd.timezone, bd.latitude, bd.longitude)
        print("Chart Calculated. Planets:", [p['name'] for p in chart['planets']])
        
        # 2. Calculate Shadbala
        planets_d1 = [{"name": p["name"], "longitude": p["longitude"]} for p in chart["planets"]]
        asc_sign = int(chart["ascendant"]["longitude"] / 30)
        
        res = await calculate_shadbala(planets_d1, asc_sign, bd.model_dump())
        print("Shadbala Summary:", res.get("summary"))
        print("First Planet Strength:", res["planets"][0]["total_rupas"])
        
    except Exception as e:
        print(f"FAILED Shadbala: {e}")
        import traceback
        traceback.print_exc()

async def test_sade_sati():
    print("\n--- Testing Sade Sati ---")
    try:
        bd = BirthDetails(
            date="15/08/1990",
            time="10:30",
            timezone="+05:30",
            latitude=13.08,
            longitude=80.27
        )
        
        # 1. Get Moon Sign
        chart = calculate_chart(bd.date, bd.time, bd.timezone, bd.latitude, bd.longitude)
        moon_lon = next(p["longitude"] for p in chart["planets"] if p["name"] == "Moon")
        moon_sign = int(moon_lon / 30)
        
        # 2. Calculate Sade Sati
        birth_dt = datetime.strptime(f"{bd.date} {bd.time}", "%d/%m/%Y %H:%M")
        res = calculate_sade_sati_details(birth_dt, moon_sign)
        print("Sade Sati In Progress:", res.get("is_in_sade_sati"))
        print("Phase:", res.get("phase"))
        print("End Date:", res.get("end_date"))
        
    except Exception as e:
        print(f"FAILED Sade Sati: {e}")
        import traceback
        traceback.print_exc()

async def test_period_analysis():
    print("\n--- Testing Period Analysis ---")
    try:
        req = PeriodRequest(
            birth_details=BirthDetails(
                date="15/08/1990",
                time="10:30",
                timezone="+05:30",
                latitude=13.08,
                longitude=80.27
            ),
            moon_longitude=0.0, # Will be calculated
            month=1,
            year=2025
        )
        
        # Calculate
        chart = calculate_chart(req.birth_details.date, req.birth_details.time, 
                                req.birth_details.timezone, req.birth_details.latitude, 
                                req.birth_details.longitude)
        moon_lon = next(p["longitude"] for p in chart["planets"] if p["name"] == "Moon")
        
        res = await get_full_period_analysis(
            req.birth_details.model_dump(),
            moon_lon,
            req.month,
            req.year
        )
        
        print("Period Analysis Score (Today):", res["current_day"]["score"])
        print("Weekly Forecast Days:", len(res["weekly_forecast"]["days"]))
        print("Monthly Forecast Weeks:", len(res["monthly_forecast"]["weeks"]))
        
    except Exception as e:
        print(f"FAILED Period Analysis: {e}")
        import traceback
        traceback.print_exc()

from astro_app.backend.astrology.muhurata import get_muhurata_data
from astro_app.backend.astrology.shadow_planets import calculate_shadow_planets, get_julian_day

async def test_muhurata():
    print("\n--- Testing Muhurata ---")
    try:
        jd = get_julian_day("15/08/1990", "10:30", "+05:30")
        res = get_muhurata_data(jd, 13.08, 80.27)
        print("Muhurata Periods:", len(res.get("periods", [])))
        if res.get("periods"):
            print("First Period:", res["periods"][0]["name"])
    except Exception as e:
        print(f"FAILED Muhurata: {e}")
        import traceback
        traceback.print_exc()

async def test_shadow_planets():
    print("\n--- Testing Shadow Planets ---")
    try:
        jd = get_julian_day("15/08/1990", "10:30", "+05:30")
        res = calculate_shadow_planets(jd, 13.08, 80.27, 5.5)
        print("Shadow Planets Count:", len(res))
        if res:
            print("First Shadow Planet:", res[0]["name"])
    except Exception as e:
        print(f"FAILED Shadow Planets: {e}")
        import traceback
        traceback.print_exc()

async def main():
    await test_panchang()
    await test_shadbala()
    await test_sade_sati()
    await test_period_analysis()
    await test_muhurata()
    await test_shadow_planets()

if __name__ == "__main__":
    asyncio.run(main())
