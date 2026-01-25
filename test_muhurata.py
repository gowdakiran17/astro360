from astro_app.backend.astrology.muhurata import get_muhurata_data
import swisseph as swe
import time

jd = 2461049.5 # Jan 9, 2026
lat, lon = 12.97, 77.59

print("Starting calculation...")
start = time.time()
try:
    data = get_muhurata_data(jd, lat, lon)
    end = time.time()
    print(f"Calculation successful in {end - start:.4f} seconds!")
    print(f"Found {len(data['periods'])} periods.")
except Exception as e:
    print(f"Error: {e}")
finally:
    swe.close()
