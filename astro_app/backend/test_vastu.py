from astro_app.backend.vastu.astro_vastu import get_astro_vastu_guidance
import json

def test_astro_vastu():
    print("Testing Astro-Vastu Guidance...")
    
    # Test Case 1: Virgo Ascendant, Jupiter Mahadasha
    # Virgo Asc -> 4th is Sagittarius (East)
    # Jupiter -> North-East
    print("\n1. Virgo Ascendant, Jupiter Mahadasha")
    result = get_astro_vastu_guidance("Virgo", "Jupiter")
    print(json.dumps(result, indent=2))
    
    # Test Case 2: Aries Ascendant, Saturn Mahadasha
    # Aries Asc -> 4th is Cancer (North)
    # Saturn -> West
    print("\n2. Aries Ascendant, Saturn Mahadasha")
    result = get_astro_vastu_guidance("Aries", "Saturn")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_astro_vastu()
