from fastapi import APIRouter, HTTPException, Depends
from astro_app.backend.schemas import AIRequest
from astro_app.backend.auth.router import get_current_user
import os
import json
import logging
from astro_app.backend.interpretation.sade_sati_prompt import SADE_SATI_EXPERT_PROMPT
from astro_app.backend.interpretation.ai import generate_favorable_areas_prompt
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.astrology.ashtakvarga import calculate_ashtakvarga
from astro_app.backend.astrology.transits import calculate_transits
from astro_app.backend.astrology.dasha import calculate_vimshottari_dasha
from astro_app.backend.schemas import BirthDetails
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Import AI Providers
try:
    import openai
except ImportError:
    openai = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

@router.post("/favorable-areas")
async def get_favorable_areas(birth_details: BirthDetails, current_user=Depends(get_current_user)):
    """
    Generates detailed Favorable Areas insights using Ashtakvarga, Transits, and AI.
    """
    try:
        # 1. Calculate Birth Chart
        chart = calculate_chart(
            birth_details.date,
            birth_details.time,
            birth_details.timezone,
            birth_details.latitude,
            birth_details.longitude
        )
        
        # 2. Calculate Ashtakvarga
        planets_d1 = [{"name": p["name"], "longitude": p["longitude"]} for p in chart["planets"]]
        ascendant_sign_idx = int(chart["ascendant"]["longitude"] / 30)
        ashtakvarga = calculate_ashtakvarga(planets_d1, ascendant_sign_idx)
        
        # 3. Calculate Current Transits
        now = datetime.utcnow()
        transits = calculate_transits(
            now.strftime("%d/%m/%Y"),
            now.strftime("%H:%M"),
            "+00:00",
            birth_details.latitude,
            birth_details.longitude
        )
        
        # 4. Calculate Current Dasha
        dasha = await calculate_vimshottari_dasha(
            birth_details.date,
            birth_details.time,
            birth_details.timezone,
            birth_details.latitude,
            birth_details.longitude
        )
        
        # 5. Generate AI Prompt
        prompt = generate_favorable_areas_prompt(
            ashtakvarga["strongest_houses"] + ashtakvarga["weakest_houses"], # Send key houses
            transits,
            dasha
        )
        
        # 6. Call AI
        gemini_key = os.getenv("GEMINI_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        ai_response_text = ""
        
        if gemini_key and genai:
             genai.configure(api_key=gemini_key)
             model = genai.GenerativeModel('models/gemini-flash-latest')
             response = await model.generate_content_async(prompt)
             ai_response_text = response.text
        elif openai_key and openai:
             openai.api_key = openai_key
             client = openai.AsyncOpenAI(api_key=openai_key)
             response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800
             )
             ai_response_text = response.choices[0].message.content
        else:
            # Fallback Mock
            ai_response_text = json.dumps({
                "favorable": [
                    {"area": "Career (10th House)", "house": 10, "reason": "High SAV (30+)", "advice": "Focus on career growth."}
                ],
                "caution": [],
                "summary": "AI services unavailable. Using mock data."
            })

        # 7. Parse JSON from AI
        try:
            # Clean up markdown if present
            clean_text = ai_response_text.replace("```json", "").replace("```", "").strip()
            ai_data = json.loads(clean_text)
        except Exception as e:
            logger.error(f"Failed to parse AI JSON: {e}")
            ai_data = {"error": "Failed to parse AI response", "raw": ai_response_text}
            
        return {
            "house_strengths": ashtakvarga["strongest_houses"],
            "ai_insights": ai_data
        }

    except Exception as e:
        logger.error(f"Error generating favorable areas: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_ai_insight(request: AIRequest, current_user=Depends(get_current_user)):
    # Special Handling for Predictive Engine
    if request.context == "predictive_engine":
        return generate_advanced_predictions(request.data)

    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    # Common helper to format prompt
    data_str = json.dumps(request.data, default=str)
    if len(data_str) > 5000:
        data_str = data_str[:5000] + "...(truncated)"
    
    # Incorporate User Query into Prompt
    user_query = request.query if request.query else "Provide a detailed Sade Sati analysis."

    if request.context == "normal_user_chat":
        prompt = (
            "For normal user:- You are an AI astrology consultant embedded within a consumer astrology application. "
            "You are an expert Vedic Astrologer.\n\n"
            f"User Question: {user_query}\n\n"
            "Key Responsibilities:\n"
            "1. Answer the user's question directly using the provided astrological data.\n"
            "2. Interpret the current Dasha period (Mahadasha/Antardasha) in relation to the question.\n"
            "3. Use plain, conversational language but maintain astrological authority.\n"
            "4. Keep the response concise (under 150 words) unless detailed analysis is requested.\n\n"
            f"Context Data: {data_str}\n\n"
            "Answer the user's question based on this persona."
        )
    
    elif request.context == "numerology_chat":
        prompt = (
            "You are an expert Numerology Consultant. Analyze the provided comprehensive Numerology data and answer the user's question.\n\n"
            f"User Question: {user_query}\n\n"
            "Data Overview:\n"
            "- Core: Psychic (Driver), Destiny (Conductor), Life Path, Personal Year, Cornerstone, Capstone, First Vowel.\n"
            "- Vibrations: Pythagorean (Compound/Reduced) and Chaldean (Compound/Reduced).\n"
            "- Grid: Lo Shu Grid (3x3 chart).\n"
            "- Remedies: Lucky gemstone, colors, days, and ruling deity.\n"
            "- Predictions: Health, Career, and Nature/Personality insights.\n\n"
            f"Numerology Data: {data_str}\n\n"
            "Guidelines:\n"
            "1. Provide a professional, encouraging, and deeply insightful analysis.\n"
            "2. Use both Pythagorean and Chaldean systems to explain the user's name vibrations.\n"
            "3. If the user asks about name correction, compare their Chaldean name number with their Psychic (Birth) number.\n"
            "4. Mention specific lucky elements and remedies where appropriate.\n"
            "5. Keep the tone grounded in numerological principles but mystical enough to be engaging."
        )
    elif request.context == "sade_sati_expert":
        prompt = (
            f"{SADE_SATI_EXPERT_PROMPT}\n\n"
            "## USER CHART DATA (MANDATORY INPUT):\n"
            f"{data_str}\n\n"
            "## USER SPECIFIC QUERY:\n"
            f"{user_query}\n\n"
            "## INSTRUCTIONS FOR THIS SESSION:\n"
            "1. Evaluate the chart-specific data against the core principles of the Expert-Level Sade Sati Analysis System.\n"
            "2. Ensure the response strictly follows the requested Report Structure (Executive Summary, Detailed Phase Analysis, Remedial Prescription, etc.).\n"
            "3. Provide exact dates and intensity scores for this specific individual."
        )
    else:
        prompt = (
            f"You are an expert Vedic Astrologer. Analyze the following data for context '{request.context}':\n"
            f"User Question: {user_query}\n\n"
            f"{data_str}\n\n"
            f"Provide a concise prediction focusing on the most important aspects related to the question. "
            f"Use astrological terminology but explain it simply. "
            f"Format with Markdown (bolding key terms)."
        )

    # 1. Try Gemini
    if gemini_key:
        if not genai:
             logger.error("GEMINI_API_KEY found but google-generativeai lib not installed.")
        else:
            try:
                genai.configure(api_key=gemini_key)
                # Use gemini-flash-latest for stable free tier access
                model = genai.GenerativeModel('models/gemini-flash-latest')
                response = await model.generate_content_async(prompt)
                return {"insight": response.text}
            except Exception as e:
                logger.error(f"Gemini Generation Failed: {e}")
                return {"insight": f"**Gemini Error**: {str(e)}"}

    # 2. Try OpenAI
    elif openai_key:
        if not openai:
             logger.error("OPENAI_API_KEY found but openai lib not installed.")
        else:
            try:
                if openai:
                    openai.api_key = openai_key
                
                client = openai.AsyncOpenAI(api_key=openai_key)
                response = await client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500
                )
                return {"insight": response.choices[0].message.content}
            except Exception as e:
                logger.error(f"OpenAI Generation Failed: {e}")
                return {"insight": f"**OpenAI Error**: {str(e)}"}

    # 3. Mock Mode (Fallback with Smart Logic)
    logger.info("No API Key found (Gemini/OpenAI). Returning Mock Response.")
    return {"insight": generate_mock_astrologer_response(request.query, request.data)}

def generate_mock_astrologer_response(query: str, data: dict) -> str:
    """
    Generates a rule-based astrological response when no LLM is available.
    """
    if not query:
        query = ""
    q = query.lower()
    
    # Extract Dasha Info
    summary = data.get("summary", {})
    md = summary.get("current_mahadasha", "Unknown")
    ad = summary.get("current_antardasha", "Unknown")
    pd = summary.get("current_pratyantardasha", "Unknown")
    
    # Basic Response Templates
    response = ""
    
    if "career" in q or "job" in q or "work" in q:
        response = (
            f" regarding your career. You are currently running the **{md} Mahadasha** and **{ad} Antardasha**.\n\n"
            f"Since {md} is the major influence, career matters will be colored by its natural significance and house placement. "
            f"The sub-period of {ad} will trigger specific events. "
            "Generally, if these planets are well-placed, expect growth and new responsibilities. "
            "If they are 6th, 8th, or 12th lords, patience is advised at work."
        )
    elif "relationship" in q or "marriage" in q or "love" in q:
        response = (
            f" regarding your relationships. Under the **{md}-{ad}** period, relationship dynamics are highlighted.\n\n"
            f"If either {md} or {ad} is Venus or connected to the 7th house, this is a significant time for partnerships. "
            f"Reflect on how the energy of {md} supports your personal connections."
        )
    elif "health" in q:
        response = (
            f" regarding your health. The **{md}-{ad}** period requires attention to well-being.\n\n"
            f"Ensure you are maintaining balance. If {md} or {ad} are associated with the 6th house (Roga Sthana), "
            "routine check-ups and a disciplined lifestyle are recommended."
        )
    elif "wealth" in q or "money" in q or "finance" in q:
        response = (
            f" regarding your finances. You are in **{md}-{ad}** Dasha.\n\n"
            f"Financial prospects depend on the interaction between {md} and {ad}. "
            "If they activate the 2nd (Wealth) or 11th (Gains) houses, this is a prosperous time. "
            "Focus on sustainable financial planning during this phase."
        )
    else:
        response = (
            f". You are currently experiencing the **{md} Mahadasha** and **{ad} Antardasha**.\n\n"
            f"This period (running until the next sub-period change) emphasizes the themes of {md}, modified by {ad}. "
            "It is a time to align your actions with the planetary energies prevailing in your chart. "
            "Check the specific house placements of these planets for deeper insight."
        )

    return f"**Namaste!** I have analyzed your chart{response}"

def generate_advanced_predictions(data: dict) -> dict:
    """
    Simulates an ML-driven predictive engine using weighted astrological heuristics.
    Returns structured insights with confidence scores.
    """
    insights = []
    
    # Extract Data
    birth_planets = data.get('birth_planets', [])
    transit_planets = data.get('transit_planets', [])
    dasha = data.get('dasha', {})
    
    # Helper to find planet
    def get_planet(plist, name):
        return next((p for p in plist if p['name'] == name), None)
        
    # 1. Career Analysis (Saturn & Jupiter & Sun)
    # ------------------------------------------------
    saturn_t = get_planet(transit_planets, 'Saturn')
    jupiter_t = get_planet(transit_planets, 'Jupiter')
    
    if saturn_t:
        # Calculate Confidence based on "Strength"
        confidence = 70 # Base
        impact = "neutral"
        
        # Check if Retrograde
        if saturn_t.get('is_retrograde'):
            impact = "negative"
            desc = "Saturn is currently retrograde, suggesting a time to review professional commitments rather than start new ones."
            confidence += 10 # High certainty about retro effects
        else:
            impact = "positive"
            desc = f"Saturn is moving forward in {saturn_t.get('zodiac_sign')}, supporting steady professional growth through discipline."
            
        insights.append({
            "category": "career",
            "title": f"Saturn in {saturn_t.get('zodiac_sign')}",
            "description": desc,
            "confidence": confidence,
            "timeframe": "Next 6 Months",
            "impact": impact,
            "type": "data_driven",
            "dataPoints": [
                f"Planet: Saturn (Karaka for Career)",
                f"Status: {'Retrograde' if saturn_t.get('is_retrograde') else 'Direct'}",
                f"Sign: {saturn_t.get('zodiac_sign')}"
            ]
        })

    if jupiter_t:
        insights.append({
            "category": "finance",
            "title": f"Jupiter in {jupiter_t.get('zodiac_sign')}",
            "description": f"Jupiter's presence in {jupiter_t.get('zodiac_sign')} influences financial expansion and wisdom.",
            "confidence": 75,
            "timeframe": "Next 1 Year",
            "impact": "positive",
            "type": "data_driven",
             "dataPoints": [
                f"Planet: Jupiter (Karaka for Wealth)",
                f"Sign: {jupiter_t.get('zodiac_sign')}"
            ]
        })

    # 2. Relationship Analysis (Venus & Mars)
    # ------------------------------------------------
    venus_t = get_planet(transit_planets, 'Venus')
    if venus_t:
        sign = venus_t.get('zodiac_sign')
        # Simple heuristic: Venus in Earth signs (Taurus, Virgo, Capricorn) -> Practical love
        earth_signs = ['Taurus', 'Virgo', 'Capricorn']
        fire_signs = ['Aries', 'Leo', 'Sagittarius']
        
        desc = ""
        if sign in earth_signs:
            desc = "Relationships take on a practical, grounded tone. Good for long-term commitments."
        elif sign in fire_signs:
            desc = "Passionate and dynamic energy in relationships. Watch out for impulsive decisions."
        else:
            desc = "Harmonious period for social interactions and personal connections."
            
        insights.append({
            "category": "relationships",
            "title": f"Venus in {sign}",
            "description": desc,
            "confidence": 65,
            "timeframe": "This Month",
            "impact": "positive",
            "type": "data_driven",
            "dataPoints": [
                f"Planet: Venus (Karaka for Relationships)",
                f"Element: {'Earth' if sign in earth_signs else 'Fire' if sign in fire_signs else 'Air/Water'}"
            ]
        })

    # 3. Dasha Analysis (The "Personalized" Layer)
    # ------------------------------------------------
    md = dasha.get('current_mahadasha')
    ad = dasha.get('current_antardasha')
    
    if md and ad:
        insights.append({
            "category": "general",
            "title": f"Mahadasha of {md} - {ad}",
            "description": f"You are currently under the major influence of {md} and minor influence of {ad}. This combination defines your core focus.",
            "confidence": 90, # Dasha is very deterministic
            "timeframe": "Current Period",
            "impact": "neutral",
            "type": "predictive_model",
            "dataPoints": [
                f"Major Period: {md}",
                f"Sub Period: {ad}",
                "Algorithm: Vimshottari Dasha"
            ]
        })

    return {"insights": insights}
