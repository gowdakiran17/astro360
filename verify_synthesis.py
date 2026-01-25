
import asyncio
import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.getcwd())

from astro_app.backend.astrology.synthesis import get_combined_analysis

async def verify_synthesis():
    print("--- Verifying Synthesis Logic ---")
    
    # Mock Birth Details
    birth_details = {
        "date": "01/01/1990",
        "time": "12:00",
        "timezone": "+05:30",
        "latitude": 28.6139,
        "longitude": 77.2090
    }
    
    try:
        print("Calling get_combined_analysis...")
        result = await get_combined_analysis(
            birth_details,
            current_date_str=None, # Use today
            ayanamsa="LAHIRI"
        )
        print("Synthesis Result Keys:", result.keys())
        print("Dasha Info:", result.get("dasha_info"))
        print("Predictions Count:", len(result.get("predictions", [])))
        print("Panchang:", result.get("panchang"))
        
    except Exception as e:
        print(f"Synthesis Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify_synthesis())
