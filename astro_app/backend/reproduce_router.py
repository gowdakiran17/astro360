
import asyncio
from typing import Optional
from datetime import datetime

# Mock Pydantic models to match schemas.py
class BirthDetails:
    def __init__(self, date, time, timezone, latitude, longitude):
        self.date = date
        self.time = time
        self.timezone = timezone
        self.latitude = latitude
        self.longitude = longitude
    
    def model_dump(self):
        return {
            "date": self.date,
            "time": self.time,
            "timezone": self.timezone,
            "latitude": self.latitude,
            "longitude": self.longitude
        }

class AnalysisRequest:
    def __init__(self, birth_details, analysis_date=None):
        self.birth_details = birth_details
        self.analysis_date = analysis_date

# Mock dependencies
async def get_current_user():
    return None

# Import actual logic
import sys
import os
sys.path.append(os.getcwd())

# Need to set PYTHONPATH or run from root
# Assuming running from backend dir

async def reproduce_router_logic():
    print("Reproducing Router Logic...")
    
    # User input
    birth = BirthDetails(
        date="25/01/1990",
        time="10:00",
        timezone="+05:30",
        latitude=12.9716,
        longitude=77.5946
    )
    
    request = AnalysisRequest(
        birth_details=birth,
        # analysis_date="2026-01-25" # Today
        analysis_date=datetime.now().strftime("%Y-%m-%d")
    )
    
    try:
        # Copy-paste logic from router
        from astro_app.backend.astrology.chart import calculate_chart
        
        print("1. Calculating Chart (Moon Longitude)...")
        chart_result = calculate_chart(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude
        )
        moon_lon = 0.0
        for p in chart_result["planets"]:
            if p["name"] == "Moon":
                moon_lon = p["longitude"]
                break
        print(f"Moon Longitude: {moon_lon}")
        
        print("2. Initializing Orchestrator...")
        from astro_app.backend.astrology.period_analysis.orchestrator import PeriodAnalysisOrchestrator
        orchestrator = PeriodAnalysisOrchestrator(
            birth_details=request.birth_details.model_dump(),
            moon_longitude=moon_lon
        )
        
        print(f"3. Getting Overview for {request.analysis_date}...")
        result = await orchestrator.get_dashboard_overview(
            target_date_str=request.analysis_date
        )
        
        print("\n--- RESULTS ---")
        day = result.get("daily_analysis", {})
        print(f"Daily Score: {day.get('score')}")
        print(f"Lucky Factors: {day.get('lucky_factors')}")
        
        if 'error' in day:
            print(f"ERROR: {day['error']}")

        # Check for bad default values
        if 'muhuratas' in day:
             print(f"Muhuratas count: {len(day['muhuratas'])}")

    except Exception as e:
        print(f"ROUTER LEVEL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(reproduce_router_logic())
