import json

def generate_ai_prompt(chart_data: dict, dasha_data: dict, user_question: str) -> str:
    """
    Generates a structured prompt for an AI Astrologer.
    
    Args:
        chart_data: Dict containing 'ascendant', 'planets', 'houses'.
        dasha_data: Dict containing 'current_mahadasha', 'current_antardasha'.
        user_question: Specific question from the user.
        
    Returns:
        A formatted prompt string ready for LLM consumption.
    """
    
    # Extract Key Data
    asc_sign = chart_data.get("ascendant", {}).get("zodiac_sign", "Unknown")
    
    # Format Planets
    planets_str = ""
    for p in chart_data.get("planets", []):
        name = p.get("name")
        sign = p.get("zodiac_sign")
        house = p.get("house")
        nakshatra = p.get("nakshatra")
        retro = "(Retrograde)" if p.get("is_retrograde") else ""
        planets_str += f"- {name} in {sign} ({house}th House) in {nakshatra} Nakshatra {retro}\n"
        
    # Format Dasha
    current_md = dasha_data.get("current_mahadasha", "Unknown")
    current_ad = dasha_data.get("current_antardasha", "Unknown")
    
    # Construct Prompt
    prompt = f"""You are an expert Vedic Astrologer. Analyze the following birth chart data and answer the user's question.

### Birth Chart Details
**Ascendant (Lagna):** {asc_sign}

**Planetary Positions:**
{planets_str}
**Current Vimshottari Dasha:**
- Mahadasha: {current_md}
- Antardasha: {current_ad}

### User Question
"{user_question}"

### Instructions
1. Analyze the strength of the relevant houses and planets for the question.
2. Consider the current Dasha influence.
3. Provide a clear, empathetic, and actionable answer.
4. Use Vedic Astrology terminology (e.g., Kendra, Trikona, Benefic/Malefic) but explain them simply.
5. Do not be fatalistic; offer remedies or constructive advice if challenges are seen.

**Response:**
"""
    return prompt

def generate_favorable_areas_prompt(house_strengths: list, transits_data: list, current_dasha: dict) -> str:
    """
    Generates a prompt specifically for identifying favorable areas based on Ashtakvarga and Transits.
    """
    
    # Format House Strengths (Top 3 and Bottom 3 are usually interesting, but let's list all or top ones)
    # house_strengths is expected to be a list of dicts: { "house_idx": 1, "points": 32, "sign": "Aries" }
    
    houses_str = ""
    for h in house_strengths:
        houses_str += f"- House {h.get('house_idx')}: {h.get('points')} points (SAV)\n"
        
    # Format Transits
    transits_str = ""
    for t in transits_data:
        name = t.get('name')
        sign = t.get('zodiac_sign')
        transits_str += f"- {name} currently in {sign}\n"
        
    # Format Dasha
    dasha_str = f"Mahadasha: {current_dasha.get('current_mahadasha')}, Antardasha: {current_dasha.get('current_antardasha')}"
    
    prompt = f"""You are an expert Vedic Astrologer specializing in Ashtakvarga and Transit analysis.
    
### Task
Identify the most favorable areas of life for the user RIGHT NOW based on their Ashtakvarga points (SAV) and current Planetary Transits.

### Data
**Ashtakvarga Strengths (SAV Points per House):**
(Standard: < 25 Low, 25-28 Average, > 28 High, > 30 Very Strong)
{houses_str}

**Current Transits:**
{transits_str}

**Current Dasha:**
{dasha_str}

### Instructions
1. **Identify Top 3 Favorable Areas**: Look for houses with HIGH SAV points (>28) that are currently receiving favorable transits (especially Jupiter, Venus, or Moon).
2. **Identify Areas of Caution**: Look for houses with LOW SAV points (<25) or those under heavy malefic influence (Saturn/Rahu/Ketu transits).
3. **Provide Actionable Advice**: For the top areas, suggest specific activities (e.g., "Career: Good time to ask for a raise"). For caution areas, suggest remedies or avoidance behavior.
4. **Format**: Return the response as a JSON object with this structure:
{{
  "favorable": [
    {{ "area": "Career", "house": 10, "reason": "High SAV (32) + Jupiter transit", "advice": "..." }},
    ...
  ],
  "caution": [
    {{ "area": "Health", "house": 6, "reason": "Low SAV (20) + Saturn transit", "advice": "..." }}
  ],
  "summary": "A brief 2-sentence summary of the current period."
}}
DO NOT output markdown formatting like ```json ... ```. Just the raw JSON string.
"""
    return prompt
