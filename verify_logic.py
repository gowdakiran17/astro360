
import asyncio
import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.getcwd())

from astro_app.backend.astrology.period_analysis import get_full_period_analysis
from astro_app.backend.astrology.panchang import calculate_panchang, calculate_quality_score
from astro_app.backend.astrology.sade_sati import calculate_sade_sati_details
from astro_app.backend.astrology.shadbala import calculate_shadbala
from astro_app.backend.astrology.chart import calculate_chart

async def verify_logic():
    print("--- Verifying Logic ---")
    
    # Mock Birth Details
    birth_details = {
        "date": "01/01/1990",
        "time": "12:00",
        "timezone": "+05:30",
        "latitude": 28.6139,
        "longitude": 77.2090
    }
    
    # 1. Period Analysis
    print("\n1. Testing Period Analysis...")
    try:
        # Need moon longitude first
        chart = calculate_chart(
            birth_details["date"],
            birth_details["time"],
            birth_details["timezone"],
            birth_details["latitude"],
            birth_details["longitude"]
        )
        moon_lon = next(p["longitude"] for p in chart["planets"] if p["name"] == "Moon")
        print(f"Moon Longitude: {moon_lon}")
        
        period_analysis = await get_full_period_analysis(
            birth_details,
            moon_lon,
            month=datetime.now().month,
            year=datetime.now().year
        )
        print("Period Analysis Result Keys:", period_analysis.keys())
        if "weekly_forecasts" in period_analysis:
            print(f"Weekly Forecasts: {len(period_analysis['weekly_forecasts'])}")
            print("First Week:", period_analysis['weekly_forecasts'][0])
        if "monthly_forecast" in period_analysis:
            print("Monthly Forecast:", period_analysis['monthly_forecast'])
    except Exception as e:
        print(f"Period Analysis Failed: {e}")
        import traceback
        traceback.print_exc()

    # 2. Panchang
    print("\n2. Testing Panchang...")
    try:
        panchang = await calculate_panchang(
            birth_details["date"],
            birth_details["time"],
            birth_details["timezone"],
            birth_details["latitude"],
            birth_details["longitude"]
        )
        print("Panchang Result:", panchang)
        # Test quality score logic directly if needed, but it's internal to some usage
        # quality = calculate_quality_score(panchang) # calculate_panchang might not return dict suitable for this directly?
        # Let's check what calculate_panchang returns.
    except Exception as e:
        print(f"Panchang Failed: {e}")
        import traceback
        traceback.print_exc()

    # 3. Sade Sati
    print("\n3. Testing Sade Sati...")
    try:
        # calculate_sade_sati_details needs birth_date and moon_sign_index
        moon_sign_idx = int(moon_lon / 30) + 1 # 1-12
        # Actually check signature: def calculate_sade_sati_details(birth_date, moon_sign_index):
        # birth_date is datetime object or string? Let's check implementation if possible, or try both.
        # usually string 'YYYY-MM-DD' based on other calls.
        
        sade_sati = calculate_sade_sati_details(birth_details["date"], moon_sign_idx)
        print("Sade Sati Result:", sade_sati)
    except Exception as e:
        print(f"Sade Sati Failed: {e}")
        import traceback
        traceback.print_exc()

    # 4. Shadbala
    print("\n4. Testing Shadbala...")
    try:
        # calculate_shadbala(planets, ascendant_sign_idx, birth_details)
        planets_d1 = [{"name": p["name"], "longitude": p["longitude"]} for p in chart["planets"]]
        ascendant_sign_idx = int(chart["ascendant"]["longitude"] / 30)
        
        shadbala = await calculate_shadbala(planets_d1, ascendant_sign_idx, birth_details)
        print("Shadbala Result Keys:", shadbala.keys())
    except Exception as e:
        print(f"Shadbala Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify_logic())
