
import asyncio
import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.getcwd())

from astro_app.backend.astrology.period_analysis import get_full_period_analysis
from astro_app.backend.astrology.panchang import calculate_panchang
from astro_app.backend.astrology.chart import calculate_chart

async def verify_frontend_alignment():
    print("--- Verifying Frontend Alignment ---")
    
    # Mock Birth Details
    birth_details = {
        "date": "01/01/1990",
        "time": "12:00",
        "timezone": "+05:30",
        "latitude": 28.6139,
        "longitude": 77.2090
    }
    
    # 1. Verify Panchang Structure for PeriodHeader
    print("\n1. Verifying Panchang Structure (PeriodHeader)...")
    try:
        panchang = await calculate_panchang(
            birth_details["date"],
            birth_details["time"],
            birth_details["timezone"],
            birth_details["latitude"],
            birth_details["longitude"]
        )
        
        required_panchang_fields = ["day_lord", "day_length", "tithi", "nakshatra", "yoga", "karana", "sunrise", "sunset"]
        missing_panchang_fields = [f for f in required_panchang_fields if f not in panchang]
        
        if missing_panchang_fields:
            print(f"FAILED: Missing fields in Panchang: {missing_panchang_fields}")
        else:
            print(f"SUCCESS: All required Panchang fields present.")
            print(f"  day_lord: {panchang.get('day_lord')}")
            print(f"  day_length: {panchang.get('day_length')}")
            
    except Exception as e:
        print(f"Panchang Verification Failed: {e}")
        import traceback
        traceback.print_exc()

    # 2. Verify Period Analysis Structure for PeriodForecasts
    print("\n2. Verifying Period Analysis Structure (PeriodForecasts)...")
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
        
        period_analysis = await get_full_period_analysis(
            birth_details,
            moon_lon,
            month=datetime.now().month,
            year=datetime.now().year
        )
        
        # Check keys
        required_keys = ["weekly_forecast", "monthly_forecast"]
        missing_keys = [k for k in required_keys if k not in period_analysis]
        
        if missing_keys:
             print(f"FAILED: Missing keys in Period Analysis: {missing_keys}")
        else:
             print("SUCCESS: weekly_forecast and monthly_forecast present.")
             
             # Check Weekly Forecast Structure
             weekly = period_analysis['weekly_forecast']
             required_weekly_fields = ["range", "score", "quality", "theme", "summary", "days"]
             missing_weekly = [f for f in required_weekly_fields if f not in weekly]
             
             if missing_weekly:
                 print(f"FAILED: Missing fields in weekly_forecast: {missing_weekly}")
             else:
                 print("SUCCESS: weekly_forecast structure valid.")
                 
                 # Check Days
                 days = weekly.get('days', [])
                 if not days:
                     print("WARNING: No days in weekly forecast.")
                 else:
                     first_day = days[0]
                     # PeriodForecasts expects: id, date, day, score, energy, theme, best, caution
                     required_day_fields = ["date", "day", "score", "energy", "theme", "best", "caution"]
                     # 'id' might be missing in backend, frontend uses map key or expects it. 
                     # Let's check if backend provides it.
                     
                     missing_day = [f for f in required_day_fields if f not in first_day]
                     if missing_day:
                         print(f"FAILED: Missing fields in day object: {missing_day}")
                     else:
                         print("SUCCESS: Day object structure valid.")
                         print(f"  Sample Day: {first_day}")

    except Exception as e:
        print(f"Period Analysis Verification Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify_frontend_alignment())
