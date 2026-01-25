from astro_app.backend.interpretation.ai import generate_ai_prompt

def test_ai_prompt_generation():
    print("Testing AI Prompt Generation...")
    
    # Sample Data
    chart_data = {
        "ascendant": {"zodiac_sign": "Virgo"},
        "planets": [
            {"name": "Sun", "zodiac_sign": "Capricorn", "house": 5, "nakshatra": "Uttarashada", "is_retrograde": False},
            {"name": "Jupiter", "zodiac_sign": "Pisces", "house": 7, "nakshatra": "Revati", "is_retrograde": True}
        ]
    }
    
    dasha_data = {
        "current_mahadasha": "Jupiter",
        "current_antardasha": "Saturn"
    }
    
    question = "How will my career be in 2026?"
    
    prompt = generate_ai_prompt(chart_data, dasha_data, question)
    
    print("\n--- Generated Prompt ---\n")
    print(prompt)
    
    # Verification
    if "Virgo" in prompt and "Capricorn" in prompt and "Jupiter" in prompt:
        print("\nSUCCESS: Prompt contains key chart details.")
    else:
        print("\nFAILED: Missing key details.")

if __name__ == "__main__":
    test_ai_prompt_generation()
