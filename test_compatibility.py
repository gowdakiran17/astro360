from astro_app.backend.astrology.matching import calculate_match_score
import json

boy = {
    "date": "01/01/1990",
    "time": "12:00",
    "timezone": "+05:30",
    "latitude": 12.97,
    "longitude": 77.59
}

girl = {
    "date": "05/05/1992",
    "time": "15:30",
    "timezone": "+05:30",
    "latitude": 28.61,
    "longitude": 77.20
}

print("Calculating compatibility...")
try:
    result = calculate_match_score(boy, girl)
    print(f"Total Score: {result['total_score']}/36")
    print(f"Boy Manglik: {result['manglik']['boy']}")
    print(f"Girl Manglik: {result['manglik']['girl']}")
    print(f"Compatible: {result['manglik']['compatible']}")
    print("Breakdown:")
    for key, val in result['details'].items():
        print(f" - {val['label']}: {val['score']}/{val['max']}")
except Exception as e:
    print(f"Error: {e}")
