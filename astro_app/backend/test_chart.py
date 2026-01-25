from astro_app.backend.astrology.chart import calculate_chart
import json

def test_chart_calculation():
    print("Testing Chart Calculation...")
    
    # Sample Data
    date = "31/12/2010"
    time = "23:40"
    timezone = "+08:00"
    latitude = 35.65
    longitude = 139.83
    
    try:
        result = calculate_chart(date, time, timezone, latitude, longitude)
        print("Chart Calculation Successful!")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Chart Calculation Failed: {e}")

if __name__ == "__main__":
    test_chart_calculation()
