import sys
import os
import json
from datetime import datetime

# Add project root to path
sys.path.append(os.getcwd())

from astro_app.backend.astrology.asset_engine import get_asset_intelligence
from astro_app.backend.astrology.chart import calculate_chart

# Mock Data
user_profile = {
    "scores": {"crypto": 85, "stocks": 60},
    "traits": {"risk_appetite": 90},
    "persona": {"type": "Speculative"}
}

print("Calculating Transit Chart...")
# Calculate Chart (NYC)
now_utc = datetime.utcnow()
transit_chart = calculate_chart(
    now_utc.strftime("%d/%m/%Y"), 
    now_utc.strftime("%H:%M"), 
    "+00:00", 
    40.7128, 
    -74.0060
)

print("Running Asset Intelligence Engine...")
# Run Engine
result = get_asset_intelligence(
    user_profile, 
    transit_chart, 
    "Bitcoin", 
    40.7128, 
    -74.0060,
    "-05:00" # NYC Timezone
)

print("\n--- RESULT ---")
print(json.dumps(result, indent=2))
