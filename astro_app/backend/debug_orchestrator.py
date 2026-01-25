
import asyncio
import logging
import sys
import os

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from astro_app.backend.astrology.period_analysis.orchestrator import PeriodAnalysisOrchestrator

logging.basicConfig(level=logging.INFO)

async def test_overview():
    try:
        birth_details = {
            "date": "17/04/1990",
            "time": "05:06",
            "timezone": "+05:30", 
            "latitude": 13.0037,
            "longitude": 77.9383,
            "name": "Debug"
        }
        
        moon_lon = 280.5 # approx
        
        print("Initializing Orchestrator...")
        orchestrator = PeriodAnalysisOrchestrator(birth_details, moon_lon)
        
        print("Calling get_dashboard_overview...")
        result = await orchestrator.get_dashboard_overview()
        
        print("Success!")
        print(result.keys())
        
    except Exception as e:
        print(f"Error caught: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_overview())
