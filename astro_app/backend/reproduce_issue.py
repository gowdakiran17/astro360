import sys
import os
import asyncio
from datetime import datetime
import logging

# Set up logging to see the tracebacks
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('orchestrator')

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from astrology.period_analysis.orchestrator import PeriodAnalysisOrchestrator

async def reproduce_blank_issue():
    print("Reproducing Period Analysis blank components issue...")
    
    # Use real-world-like birth details
    birth_details = {
        'latitude': 12.9716,
        'longitude': 77.5946,
        'timezone': '+05:30',
        'date': '25/01/1990',
        'time': '10:00'
    }
    
    moon_lon = 330.0
    
    try:
        orchestrator = PeriodAnalysisOrchestrator(
            birth_details=birth_details,
            moon_longitude=moon_lon
        )
        
        target_date = "2026-01-24" # Date from user's screenshot context likely
        print(f"\nProcessing date: {target_date}")
        
        result = await orchestrator.get_dashboard_overview(target_date)
        
        if 'error' in result['daily_analysis']:
            print(f"ERROR FOUND in daily_analysis: {result['daily_analysis']['error']}")
            if 'recommendation' in result['daily_analysis']:
                 print(f"Recommendation: {result['daily_analysis']['recommendation']}")
        else:
            print("No main error in daily_analysis.")
            
        print("\nChecking key data fields:")
        day = result.get('daily_analysis', {})
        print(f"Daily Score: {day.get('score')}")
        
        muhuratas = day.get('muhuratas', [])
        print(f"Muhuratas count: {len(muhuratas)}")
        if muhuratas:
            choghadiyas = [p for p in muhuratas if p.get('type') == 'Choghadiya']
            print(f"Choghadiyas count: {len(choghadiyas)}")
            if choghadiyas:
                print(f"Sample Choghadiya: {choghadiyas[0]}")
        
        lucky = day.get('lucky_factors', {})
        print(f"Lucky Factors: {lucky}")
        
        hs = day.get('house_strengths', {})
        print(f"House Strengths: {'Present' if hs else 'MISSING'}")
        if hs:
            print(f"House Strengths keys: {list(hs.keys())}")
            print(f"SAV length: {len(hs.get('sav', []))}")
            if hs.get('sav'):
                print(f"Sample SAV: {hs['sav'][0]}")
        
        print(f"Predictions count: {len(day.get('predictions', []))}")

    except Exception as e:
        print(f"FATAL ERROR in reproduction script: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(reproduce_blank_issue())
