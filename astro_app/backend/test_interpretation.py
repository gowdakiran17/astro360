from astro_app.backend.interpretation.rules import interpret_mahadasha, interpret_planetary_strength, interpret_house_activation
import json

def test_interpretations():
    print("Testing Interpretation Rules...")
    
    # 1. Mahadasha
    print("\n1. Mahadasha Themes")
    print(json.dumps(interpret_mahadasha("Jupiter"), indent=2))
    
    # 2. Planetary Strengths
    print("\n2. Planetary Strengths")
    # Exalted
    print(json.dumps(interpret_planetary_strength("Sun", "Aries"), indent=2))
    # Debilitated
    print(json.dumps(interpret_planetary_strength("Mars", "Cancer"), indent=2))
    # Own Sign
    print(json.dumps(interpret_planetary_strength("Saturn", "Capricorn"), indent=2))
    # Neutral
    print(json.dumps(interpret_planetary_strength("Venus", "Leo"), indent=2))
    
    # 3. House Activations
    print("\n3. House Activations")
    print(json.dumps(interpret_house_activation(10, "Sun"), indent=2))

if __name__ == "__main__":
    test_interpretations()
