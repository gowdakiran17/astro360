
import asyncio
from astro_app.backend.schemas import AIRequest

# Mock dependencies
async def run_test():
    # Scenario 1: Data has birth_details at root (Suspected Frontend behavior)
    req_root = AIRequest(
        context="normal_user_chat",
        data={
            "birth_details": {
                "date": "01/01/1990",
                "time": "12:00",
                "timezone": "+05:30",
                "latitude": 12.97,
                "longitude": 77.59
            }
        },
        query="Test Query"
    )
    
    print("--- SCENARIO 1 (Birth Details at Root) ---")

    # Let's just simulate the logic flow
    request_data = req_root.data
    chart_data = request_data.get('chart', {})
    
    bd = chart_data.get('birth_details')
    print(f"Chart Data: {chart_data}")
    print(f"Birth Details found: {bd}")
    
    if not bd:
        print("❌ FAILURE: Birth details NOT found in chart_data. Calculation will skip.")
    else:
        print("✅ SUCCESS: Birth details found.")

    # Scenario 2: Data has chart -> birth_details (Expected Backend behavior)
    req_nested = AIRequest(
        context="normal_user_chat",
        data={
            "chart": {
                "birth_details": {
                    "date": "01/01/1990",
                    "time": "12:00",
                    "timezone": "+05:30",
                    "latitude": 12.97,
                    "longitude": 77.59
                }
            }
        },
        query="Test Query"
    )

    print("\n--- SCENARIO 2 (Birth Details Nested) ---")
    request_data_2 = req_nested.data
    chart_data_2 = request_data_2.get('chart', {})
    bd_2 = chart_data_2.get('birth_details')
    
    if not bd_2:
        print("❌ FAILURE: Birth details NOT found.")
    else:
        print("✅ SUCCESS: Birth details found.")

if __name__ == "__main__":
    asyncio.run(run_test())
