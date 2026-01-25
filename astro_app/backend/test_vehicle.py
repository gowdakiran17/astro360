from astro_app.backend.evaluation.vehicle import evaluate_vehicle_name
import json

def test_vehicle_evaluation():
    print("Testing Vehicle Name Evaluation...")
    
    # Sample User Data
    # Ascendant: Virgo (approx 150-180 deg). Let's say 160 deg.
    # Venus: Libra (approx 180-210 deg). Let's say 190 deg (Own Sign).
    asc_lon = 160.0 
    venus_lon = 190.0
    
    # Test Cases
    brands = ["Toyota", "Honda", "Tesla", "Maruti"]
    
    for brand in brands:
        print(f"\n--- Evaluating {brand} ---")
        result = evaluate_vehicle_name(
            brand, 
            ascendant_longitude=asc_lon, 
            venus_longitude=venus_lon,
            current_mahadasha="Venus"
        )
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_vehicle_evaluation()
