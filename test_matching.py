from astro_app.backend.astrology.matching import calculate_match_score

boy_details = {
    "date": "01/01/1990",
    "time": "10:00",
    "timezone": "+05:30",
    "latitude": 28.61,
    "longitude": 77.20
}

girl_details = {
    "date": "01/01/1992",
    "time": "10:00",
    "timezone": "+05:30",
    "latitude": 28.61,
    "longitude": 77.20
}

try:
    result = calculate_match_score(boy_details, girl_details)
    print("Match Score Calculation Successful:")
    print(result)
except Exception as e:
    print("Error calculating match score:")
    print(e)
    import traceback
    traceback.print_exc()
