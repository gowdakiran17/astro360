from fastapi import APIRouter, Depends, HTTPException
from astro_app.backend.schemas import RectificationRequest, RatingRequest
from astro_app.backend.auth.router import get_current_user
from astro_app.backend.models import User, DailyRating
from astro_app.backend.database import get_db
from sqlalchemy.orm import Session
from astro_app.backend.monetization.access_control import verify_user_access, Feature
from astro_app.backend.astrology.rectification import calculate_tatwa_shodan, rectify_time_automated
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/feedback/daily")
async def submit_daily_rating(request: RatingRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Submit user feedback/rating for daily predictions.
    """
    try:
        # Check if rating already exists for this day
        existing = db.query(DailyRating).filter(
            DailyRating.user_id == current_user.id,
            DailyRating.date_str == request.date
        ).first()

        if existing:
            existing.rating = request.rating
            existing.feedback_text = request.feedback
        else:
            new_rating = DailyRating(
                user_id=current_user.id,
                date_str=request.date,
                rating=request.rating,
                feedback_text=request.feedback
            )
            db.add(new_rating)
        
        db.commit()
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class SadeSatiRequest(BaseModel):
    date: str  # DD/MM/YYYY
    time: str  # HH:MM
    latitude: float
    longitude: float
    timezone: str = "+05:30"

from astro_app.backend.astrology.sade_sati import calculate_sade_sati_details
import swisseph as swe

from astro_app.backend.astrology.utils import get_nakshatra_details, ZODIAC_SIGNS
from astro_app.backend.astrology.chart import calculate_chart
from astro_app.backend.astrology.dasha import calculate_vimshottari_dasha
def calculate_moon_details(date_str: str, time_str: str, lat: float, lon: float, tz: str) -> dict:
    """Calculate moon sign and nakshatra from birth details using Swiss Ephemeris"""
    try:
        from astro_app.backend.astrology.utils import get_julian_day
        jd = get_julian_day(date_str, time_str, tz)
        swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
        res = swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        moon_lon = res[0][0]
        
        # Calculate sign index from longitude (0-11)
        sign_idx = int(moon_lon / 30) % 12
        
        # Calculate nakshatra details
        nak = get_nakshatra_details(moon_lon)
        
        # Paksha (Waxing/Waning) check
        sun_res = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        sun_lon = sun_res[0][0]
        dist = (moon_lon - sun_lon) % 360
        is_waxing = dist < 180
        
        return {
            "sign": ZODIAC_SIGNS[sign_idx],
            "sign_idx": sign_idx,
            "longitude": moon_lon,
            "nakshatra": nak["name"],
            "pada": nak["pada"],
            "lord": nak["lord"],
            "is_waxing": is_waxing,
            "paksha": "Shukla (Waxing)" if is_waxing else "Krishna (Waning)"
        }
    except Exception as e:
        logger.error(f"Error calculating moon details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to calculate moon position: {str(e)}")

def get_sade_sati_phases(moon_sign: str, birth_date: datetime) -> dict:
    """Calculate Sade Sati phases based on moon sign using accurate ephemeris"""
    try:
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                 "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        moon_sign_idx = signs.index(moon_sign)
        
        # Use the new accurate calculation module
        details = calculate_sade_sati_details(birth_date, moon_sign_idx)
        
        # Transform for frontend compatibility and enhancement
        phases_list = []
        for p in details["phases"]:
            phases_list.append({
                "phase": f"{p['phase']} Phase",
                "description": get_phase_description(p['phase']),
                "start_date": p['start'],
                "end_date": p['end'],
                "is_current": p['is_current'],
                "intensity": "high" if p['phase'] == "Peak" else "medium"
            })
            
        return {
            "is_in_sade_sati": details["is_in_sade_sati"],
            "current_phase": details["phase"],
            "intensity_score": details.get("intensity_score", 0),
            "intensity_factors": details.get("intensity_factors", []),
            "phases": phases_list,
            "nakshatra_timeline": details.get("nakshatra_timeline", []),
            "decision_windows": details.get("decision_windows", []),
            "raw_dates": {"start": details["start_date"], "end": details["end_date"]},
            "other_period": details.get("other_period"),
            "raw_start_jd": details.get("raw_start_jd"),
            "raw_end_jd": details.get("raw_end_jd"),
            "planetary_details": details.get("planetary_details")
        }
    except Exception as e:
        logger.error(f"Error in Sade Sati calculation: {e}")
        # Fallback to empty
        return {"is_in_sade_sati": False, "phases": []}

def get_phase_description(phase_name):
    if phase_name == "Rising":
        return "Initial challenges, mental stress, and obstacles begin to appear. Time for introspection."
    elif phase_name == "Peak":
        return "Most intense period with maximum challenges in health, career, and relationships."
    elif phase_name == "Setting":
        return "Gradual relief from difficulties. Financial matters improve, and life begins to stabilize."
    return ""

@router.post("/sade-sati")
async def calculate_sade_sati(request: SadeSatiRequest):
    """
    Calculate Sade Sati (Saturn's 7.5 year transit) analysis
    """
    try:
        # Parse birth date
        day, month, year = map(int, request.date.split('/'))
        birth_date = datetime(year, month, day)
        
        # Calculate moon details
        moon_data = calculate_moon_details(request.date, request.time, 
                                          request.latitude, request.longitude, request.timezone)
        moon_sign = moon_data["sign"]
        
        # Get Sade Sati phases
        sade_sati_info = get_sade_sati_phases(moon_sign, birth_date)
        
        # Enrich with Chart and Dasha for Expert AI System
        try:
            full_chart = calculate_chart(request.date, request.time, request.timezone, request.latitude, request.longitude)
            # calculate_vimshottari_dasha expects detailed strings
            dasha_data = calculate_vimshottari_dasha(
                date_str=request.date,
                time_str=request.time,
                timezone_str=request.timezone,
                latitude=request.latitude,
                longitude=request.longitude
            )
            sade_sati_info["full_chart"] = full_chart
            sade_sati_info["dasha"] = dasha_data
        except Exception as e:
            logger.error(f"Failed to enrich Sade Sati data: {e}")
        
        # Add natal moon info to planetary details
        if "planetary_details" in sade_sati_info:
            sade_sati_info["planetary_details"]["moon"].update({
                "longitude": moon_data["longitude"],
                "nakshatra": moon_data["nakshatra"],
                "pada": moon_data["pada"],
                "lord": moon_data["lord"],
                "paksha": moon_data["paksha"],
                "resilience": "High" if moon_data["is_waxing"] else "Medium"
            })
        
        # Generate remedies
        remedies = [
            "Recite Hanuman Chalisa daily, especially on Saturdays",
            "Donate black sesame seeds, black clothes, or iron items on Saturdays",
            "Feed crows and dogs regularly",
            "Wear a Blue Sapphire (Neelam) after proper consultation with an astrologer",
            "Observe fast on Saturdays and consume simple, sattvic food",
            "Light a mustard oil lamp under a Peepal tree on Saturdays",
            "Practice patience, discipline, and hard work in all endeavors",
            "Chant 'Om Sham Shanicharaya Namah' 108 times daily"
        ]
        
        # General advice based on current status
        if sade_sati_info["is_in_sade_sati"]:
            general_advice = (
                "You are currently experiencing Sade Sati. This is a transformative period that tests your "
                "patience, resilience, and character. Focus on spiritual growth, maintain discipline, and "
                "avoid major life decisions if possible. Practice regular meditation and stay connected to "
                "your spiritual practices. Remember, this period brings valuable life lessons and ultimately "
                "leads to personal growth and maturity."
            )
        else:
            general_advice = (
                "You are not currently in Sade Sati period. This is a good time to strengthen your foundation, "
                "build savings, and prepare for future challenges. Continue your spiritual practices and "
                "maintain good karma through charitable acts. Use this period wisely to achieve your goals "
                "and create stability in your life."
            )
        
        return {
            "moon_sign": moon_sign,
            "current_phase": sade_sati_info["current_phase"],
            "is_in_sade_sati": sade_sati_info["is_in_sade_sati"],
            "phases": sade_sati_info["phases"],
            "remedies": remedies,
            "general_advice": general_advice,
            "other_period": sade_sati_info.get("other_period"),
            "raw_dates": sade_sati_info.get("raw_dates"),
            "raw_start_jd": sade_sati_info.get("raw_start_jd"),
            "raw_end_jd": sade_sati_info.get("raw_end_jd"),
            "planetary_details": sade_sati_info.get("planetary_details")
        }
        
    except Exception as e:
        logger.error(f"Error calculating Sade Sati: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error calculating Sade Sati: {str(e)}")

@router.post("/rectify/automated")
async def automated_rectification(request: RectificationRequest, current_user: User = Depends(get_current_user)):
    """
    Performs automated birth time rectification using provided life events.
    """
    # verify_user_access(current_user, Feature.PREMIUM_TOOLS) # Define new feature if needed
    try:
        result = rectify_time_automated(request.birth_details, request.gender, request.events)
        return result
    except Exception as e:
        logger.error(f"Error acting rectification: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/rectify/tatwa")
async def check_tatwa_shodan(request: RectificationRequest, current_user: User = Depends(get_current_user)):
    """
    Checks compatibility of birth time with gender using Tattva Shodan.
    """
    try:
        result = calculate_tatwa_shodan(
            request.birth_details.date,
            request.birth_details.time,
            request.birth_details.timezone,
            request.birth_details.latitude,
            request.birth_details.longitude
        )
        return result
    except Exception as e:
        logger.error(f"Error checking tatwa: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


class GemstoneRequest(BaseModel):
    date: str  # DD/MM/YYYY
    time: str  # HH:MM
    latitude: float
    longitude: float
    timezone: str = "+05:30"


from astro_app.backend.astrology.shadbala import calculate_shadbala

def analyze_gem_suitability(planet: str, chart_data: dict, shadbala_data: dict) -> dict:
    """
    Analyze if a gem is suitable based on:
    1. House Placement (Dusthana 6, 8, 12 check)
    2. Strength (Shadbala check)
    3. Functional Nature (Benefic/Malefic)
    """
    
    # 1. Find Planet's House
    planet_house = None
    for p in chart_data.get("planets", []):
        if p["name"] == planet:
            planet_house = p["house"]
            break
            
    # 2. Find Planet's Strength
    strength_status = "Average"
    percentage = 100
    if shadbala_data:
        for p in shadbala_data.get("planets", []):
            if p["name"] == planet:
                strength_status = p["status"]
                percentage = p["percentage"]
                break
                
    # 3. Logic Engine
    suitability = "Suitable"
    reasons = []
    
    # House Logic
    if planet_house in [6, 8, 12]:
        suitability = "Avoid"
        reasons.append(f"Placed in {planet_house}th house (Dusthana) - Can amplify negativity.")
    
    # Strength Logic
    if percentage < 90:
        if suitability != "Avoid":
            suitability = "Highly Recommended"
        reasons.append("Planet is weak and needs strengthening.")
    elif percentage > 130:
        reasons.append("Planet is already very strong.")
        if suitability == "Suitable":
            suitability = "Caution"
            
    # Construct Analysis String
    analysis = f"Position: {planet_house}th House. Strength: {strength_status} ({percentage}%). "
    if reasons:
        analysis += " ".join(reasons)
    else:
        analysis += "Placement is favorable."
        
    return {
        "suitability": suitability,
        "analysis": analysis,
        "strength_score": percentage
    }

def get_gemstone_recommendations(ascendant_sign: str, chart_data: dict = None, shadbala_data: dict = None) -> dict:
    """
    Get gemstone recommendations based on Ascendant (Lagna)
    Returns Life Stone (1st House), Lucky Stone (9th House), and Benefic Stone (5th House)
    """
    # Map of Ascendant to Gemstones
    # Format: Sign: { "life": (Planet, Gem), "lucky": (Planet, Gem), "benefic": (Planet, Gem) }
    # Enhanced Gem Map with Expert Details
    # Each entry contains detailed ritual, mantra, and wear instructions
    gem_map = {
        "Aries": {
            "life": {
                "planet": "Mars", "u_gem": "Red Coral", "i_gem": "Moonga",
                "metal": "Gold or Copper", "finger": "Ring Finger", "day": "Tuesday",
                "mantra": "Om Kram Kreem Kroum Sah Bhaumaya Namah",
                "ritual": "Wash with gangajal and raw milk. Light incense and offer red flowers.",
                "caution": "Avoid wearing Blue Sapphire (Saturn) or Emerald (Mercury) with this.",
                "substitute": "Red Carnelian"
            },
            "lucky": {
                "planet": "Jupiter", "u_gem": "Yellow Sapphire", "i_gem": "Pukhraj",
                "metal": "Gold", "finger": "Index Finger", "day": "Thursday",
                "mantra": "Om Gram Greem Groum Sah Gurave Namah",
                "ritual": "Cleanse with milk and honey. Offer yellow flowers.",
                "caution": "Avoid wearing Emerald or Diamond with this.",
                "substitute": "Citrine, Yellow Topaz"
            },
            "benefic": {
                "planet": "Sun", "u_gem": "Ruby", "i_gem": "Manik",
                "metal": "Gold", "finger": "Ring Finger", "day": "Sunday",
                "mantra": "Om Hram Hreem Hroum Sah Suryaya Namah",
                "ritual": "Energize in sunlight. Offer red flowers and water to the Sun.",
                "caution": "Never wear with Blue Sapphire or Gomed.",
                "substitute": "Red Garnet"
            }
        },
        "Taurus": {
            "life": {
                "planet": "Venus", "u_gem": "Diamond or White Sapphire", "i_gem": "Heera",
                "metal": "Gold, Silver or Platinum", "finger": "Middle or Little Finger", "day": "Friday",
                "mantra": "Om Dram Dreem Droum Sah Shukraya Namah",
                "ritual": "Cleanse with rose water/milk. Offer white flowers.",
                "caution": "Avoid wearing Ruby or Yellow Sapphire.",
                "substitute": "White Zircon, Opal"
            },
            "lucky": {
                "planet": "Saturn", "u_gem": "Blue Sapphire", "i_gem": "Neelam",
                "metal": "Silver, Gold or Panchdhatu", "finger": "Middle Finger", "day": "Saturday",
                "mantra": "Om Pram Preem Proum Sah Shanaischaraya Namah",
                "ritual": "Detailed testing required. Dip in mustard oil/sesame oil before wearing.",
                "caution": "Strictly verify quality. Do not wear with Ruby, Pearl or Coral.",
                "substitute": "Amethyst, Iolite"
            },
            "benefic": {
                "planet": "Mercury", "u_gem": "Emerald", "i_gem": "Panna",
                "metal": "Gold or Silver", "finger": "Little Finger", "day": "Wednesday",
                "mantra": "Om Bram Breem Broum Sah Budhaya Namah",
                "ritual": "Soak in water with Tulsi leaves. Offer green cloth.",
                "caution": "Avoid wearing with Red Coral.",
                "substitute": "Peridot, Green Tourmaline"
            }
        },
        "Gemini": {
            "life": {
                "planet": "Mercury", "u_gem": "Emerald", "i_gem": "Panna",
                "metal": "Gold or Silver", "finger": "Little Finger", "day": "Wednesday",
                "mantra": "Om Bram Breem Broum Sah Budhaya Namah",
                "ritual": "Soak in water with Tulsi leaves. Offer green cloth.",
                "caution": "Avoid wearing with Red Coral.",
                "substitute": "Peridot, Green Tourmaline"
            },
            "lucky": {
                "planet": "Saturn", "u_gem": "Blue Sapphire", "i_gem": "Neelam",
                "metal": "Silver, Gold or Panchdhatu", "finger": "Middle Finger", "day": "Saturday",
                "mantra": "Om Pram Preem Proum Sah Shanaischaraya Namah",
                "ritual": "Detailed testing required. Dip in mustard oil/sesame oil before wearing.",
                "caution": "Strictly verify quality. Do not wear with Ruby, Pearl or Coral.",
                "substitute": "Amethyst, Iolite"
            },
            "benefic": {
                "planet": "Venus", "u_gem": "Diamond or White Sapphire", "i_gem": "Heera",
                "metal": "Gold, Silver or Platinum", "finger": "Middle or Little Finger", "day": "Friday",
                "mantra": "Om Dram Dreem Droum Sah Shukraya Namah",
                "ritual": "Cleanse with rose water/milk. Offer white flowers.",
                "caution": "Avoid wearing Ruby or Yellow Sapphire.",
                "substitute": "White Zircon, Opal"
            }
        },
        "Cancer": {
            "life": {
                "planet": "Moon", "u_gem": "Pearl", "i_gem": "Moti",
                "metal": "Silver", "finger": "Little Finger", "day": "Monday",
                "mantra": "Om Shram Shreem Shroum Sah Chandramase Namah",
                "ritual": "Soak in unboiled milk. Offer white sweets.",
                "caution": "Avoid wearing with Hessonite (Gomed) or Cat's Eye.",
                "substitute": "Moonstone"
            },
            "lucky": {
                "planet": "Jupiter", "u_gem": "Yellow Sapphire", "i_gem": "Pukhraj",
                "metal": "Gold", "finger": "Index Finger", "day": "Thursday",
                "mantra": "Om Gram Greem Groum Sah Gurave Namah",
                "ritual": "Cleanse with milk and honey. Offer yellow flowers.",
                "caution": "Avoid wearing Emerald or Diamond with this.",
                "substitute": "Citrine, Yellow Topaz"
            },
            "benefic": {
                "planet": "Mars", "u_gem": "Red Coral", "i_gem": "Moonga",
                "metal": "Gold or Copper", "finger": "Ring Finger", "day": "Tuesday",
                "mantra": "Om Kram Kreem Kroum Sah Bhaumaya Namah",
                "ritual": "Wash with gangajal and raw milk. Light incense and offer red flowers.",
                "caution": "Avoid wearing Blue Sapphire (Saturn) or Emerald (Mercury) with this.",
                "substitute": "Red Carnelian"
            }
        },
        "Leo": {
            "life": {
                "planet": "Sun", "u_gem": "Ruby", "i_gem": "Manik",
                "metal": "Gold", "finger": "Ring Finger", "day": "Sunday",
                "mantra": "Om Hram Hreem Hroum Sah Suryaya Namah",
                "ritual": "Energize in sunlight. Offer red flowers and water to the Sun.",
                "caution": "Never wear with Blue Sapphire or Gomed.",
                "substitute": "Red Garnet"
            },
            "lucky": {
                "planet": "Mars", "u_gem": "Red Coral", "i_gem": "Moonga",
                "metal": "Gold or Copper", "finger": "Ring Finger", "day": "Tuesday",
                "mantra": "Om Kram Kreem Kroum Sah Bhaumaya Namah",
                "ritual": "Wash with gangajal and raw milk. Light incense and offer red flowers.",
                "caution": "Avoid wearing Blue Sapphire (Saturn) or Emerald (Mercury) with this.",
                "substitute": "Red Carnelian"
            },
            "benefic": {
                "planet": "Jupiter", "u_gem": "Yellow Sapphire", "i_gem": "Pukhraj",
                "metal": "Gold", "finger": "Index Finger", "day": "Thursday",
                "mantra": "Om Gram Greem Groum Sah Gurave Namah",
                "ritual": "Cleanse with milk and honey. Offer yellow flowers.",
                "caution": "Avoid wearing Emerald or Diamond with this.",
                "substitute": "Citrine, Yellow Topaz"
            }
        },
        "Virgo": {
            "life": {
                "planet": "Mercury", "u_gem": "Emerald", "i_gem": "Panna",
                "metal": "Gold or Silver", "finger": "Little Finger", "day": "Wednesday",
                "mantra": "Om Bram Breem Broum Sah Budhaya Namah",
                "ritual": "Soak in water with Tulsi leaves. Offer green cloth.",
                "caution": "Avoid wearing with Red Coral.",
                "substitute": "Peridot, Green Tourmaline"
            },
            "lucky": {
                "planet": "Venus", "u_gem": "Diamond or White Sapphire", "i_gem": "Heera",
                "metal": "Gold, Silver or Platinum", "finger": "Middle or Little Finger", "day": "Friday",
                "mantra": "Om Dram Dreem Droum Sah Shukraya Namah",
                "ritual": "Cleanse with rose water/milk. Offer white flowers.",
                "caution": "Avoid wearing Ruby or Yellow Sapphire.",
                "substitute": "White Zircon, Opal"
            },
            "benefic": {
                "planet": "Saturn", "u_gem": "Blue Sapphire", "i_gem": "Neelam",
                "metal": "Silver, Gold or Panchdhatu", "finger": "Middle Finger", "day": "Saturday",
                "mantra": "Om Pram Preem Proum Sah Shanaischaraya Namah",
                "ritual": "Detailed testing required. Dip in mustard oil/sesame oil before wearing.",
                "caution": "Strictly verify quality. Do not wear with Ruby, Pearl or Coral.",
                "substitute": "Amethyst, Iolite"
            }
        },
        "Libra": {
            "life": {
                "planet": "Venus", "u_gem": "Diamond or White Sapphire", "i_gem": "Heera",
                "metal": "Gold, Silver or Platinum", "finger": "Middle or Little Finger", "day": "Friday",
                "mantra": "Om Dram Dreem Droum Sah Shukraya Namah",
                "ritual": "Cleanse with rose water/milk. Offer white flowers.",
                "caution": "Avoid wearing Ruby or Yellow Sapphire.",
                "substitute": "White Zircon, Opal"
            },
            "lucky": {
                "planet": "Mercury", "u_gem": "Emerald", "i_gem": "Panna",
                "metal": "Gold or Silver", "finger": "Little Finger", "day": "Wednesday",
                "mantra": "Om Bram Breem Broum Sah Budhaya Namah",
                "ritual": "Soak in water with Tulsi leaves. Offer green cloth.",
                "caution": "Avoid wearing with Red Coral.",
                "substitute": "Peridot, Green Tourmaline"
            },
            "benefic": {
                "planet": "Saturn", "u_gem": "Blue Sapphire", "i_gem": "Neelam",
                "metal": "Silver, Gold or Panchdhatu", "finger": "Middle Finger", "day": "Saturday",
                "mantra": "Om Pram Preem Proum Sah Shanaischaraya Namah",
                "ritual": "Detailed testing required. Dip in mustard oil/sesame oil before wearing.",
                "caution": "Strictly verify quality. Do not wear with Ruby, Pearl or Coral.",
                "substitute": "Amethyst, Iolite"
            }
        },
        "Scorpio": {
            "life": {
                "planet": "Mars", "u_gem": "Red Coral", "i_gem": "Moonga",
                "metal": "Gold or Copper", "finger": "Ring Finger", "day": "Tuesday",
                "mantra": "Om Kram Kreem Kroum Sah Bhaumaya Namah",
                "ritual": "Wash with gangajal and raw milk. Light incense and offer red flowers.",
                "caution": "Avoid wearing Blue Sapphire (Saturn) or Emerald (Mercury) with this.",
                "substitute": "Red Carnelian"
            },
            "lucky": {
                "planet": "Moon", "u_gem": "Pearl", "i_gem": "Moti",
                "metal": "Silver", "finger": "Little Finger", "day": "Monday",
                "mantra": "Om Shram Shreem Shroum Sah Chandramase Namah",
                "ritual": "Soak in unboiled milk. Offer white sweets.",
                "caution": "Avoid wearing with Hessonite (Gomed) or Cat's Eye.",
                "substitute": "Moonstone"
            },
            "benefic": {
                "planet": "Jupiter", "u_gem": "Yellow Sapphire", "i_gem": "Pukhraj",
                "metal": "Gold", "finger": "Index Finger", "day": "Thursday",
                "mantra": "Om Gram Greem Groum Sah Gurave Namah",
                "ritual": "Cleanse with milk and honey. Offer yellow flowers.",
                "caution": "Avoid wearing Emerald or Diamond with this.",
                "substitute": "Citrine, Yellow Topaz"
            }
        },
        "Sagittarius": {
            "life": {
                "planet": "Jupiter", "u_gem": "Yellow Sapphire", "i_gem": "Pukhraj",
                "metal": "Gold", "finger": "Index Finger", "day": "Thursday",
                "mantra": "Om Gram Greem Groum Sah Gurave Namah",
                "ritual": "Cleanse with milk and honey. Offer yellow flowers.",
                "caution": "Avoid wearing Emerald or Diamond with this.",
                "substitute": "Citrine, Yellow Topaz"
            },
            "lucky": {
                "planet": "Sun", "u_gem": "Ruby", "i_gem": "Manik",
                "metal": "Gold", "finger": "Ring Finger", "day": "Sunday",
                "mantra": "Om Hram Hreem Hroum Sah Suryaya Namah",
                "ritual": "Energize in sunlight. Offer red flowers and water to the Sun.",
                "caution": "Never wear with Blue Sapphire or Gomed.",
                "substitute": "Red Garnet"
            },
            "benefic": {
                "planet": "Mars", "u_gem": "Red Coral", "i_gem": "Moonga",
                "metal": "Gold or Copper", "finger": "Ring Finger", "day": "Tuesday",
                "mantra": "Om Kram Kreem Kroum Sah Bhaumaya Namah",
                "ritual": "Wash with gangajal and raw milk. Light incense and offer red flowers.",
                "caution": "Avoid wearing Blue Sapphire (Saturn) or Emerald (Mercury) with this.",
                "substitute": "Red Carnelian"
            }
        },
        "Capricorn": {
            "life": {
                "planet": "Saturn", "u_gem": "Blue Sapphire", "i_gem": "Neelam",
                "metal": "Silver, Gold or Panchdhatu", "finger": "Middle Finger", "day": "Saturday",
                "mantra": "Om Pram Preem Proum Sah Shanaischaraya Namah",
                "ritual": "Detailed testing required. Dip in mustard oil/sesame oil before wearing.",
                "caution": "Strictly verify quality. Do not wear with Ruby, Pearl or Coral.",
                "substitute": "Amethyst, Iolite"
            },
            "lucky": {
                "planet": "Mercury", "u_gem": "Emerald", "i_gem": "Panna",
                "metal": "Gold or Silver", "finger": "Little Finger", "day": "Wednesday",
                "mantra": "Om Bram Breem Broum Sah Budhaya Namah",
                "ritual": "Soak in water with Tulsi leaves. Offer green cloth.",
                "caution": "Avoid wearing with Red Coral.",
                "substitute": "Peridot, Green Tourmaline"
            },
            "benefic": {
                "planet": "Venus", "u_gem": "Diamond or White Sapphire", "i_gem": "Heera",
                "metal": "Gold, Silver or Platinum", "finger": "Middle or Little Finger", "day": "Friday",
                "mantra": "Om Dram Dreem Droum Sah Shukraya Namah",
                "ritual": "Cleanse with rose water/milk. Offer white flowers.",
                "caution": "Avoid wearing Ruby or Yellow Sapphire.",
                "substitute": "White Zircon, Opal"
            }
        },
        "Aquarius": {
            "life": {
                "planet": "Saturn", "u_gem": "Blue Sapphire", "i_gem": "Neelam",
                "metal": "Silver, Gold or Panchdhatu", "finger": "Middle Finger", "day": "Saturday",
                "mantra": "Om Pram Preem Proum Sah Shanaischaraya Namah",
                "ritual": "Detailed testing required. Dip in mustard oil/sesame oil before wearing.",
                "caution": "Strictly verify quality. Do not wear with Ruby, Pearl or Coral.",
                "substitute": "Amethyst, Iolite"
            },
            "lucky": {
                "planet": "Venus", "u_gem": "Diamond or White Sapphire", "i_gem": "Heera",
                "metal": "Gold, Silver or Platinum", "finger": "Middle or Little Finger", "day": "Friday",
                "mantra": "Om Dram Dreem Droum Sah Shukraya Namah",
                "ritual": "Cleanse with rose water/milk. Offer white flowers.",
                "caution": "Avoid wearing Ruby or Yellow Sapphire.",
                "substitute": "White Zircon, Opal"
            },
            "benefic": {
                "planet": "Mercury", "u_gem": "Emerald", "i_gem": "Panna",
                "metal": "Gold or Silver", "finger": "Little Finger", "day": "Wednesday",
                "mantra": "Om Bram Breem Broum Sah Budhaya Namah",
                "ritual": "Soak in water with Tulsi leaves. Offer green cloth.",
                "caution": "Avoid wearing with Red Coral.",
                "substitute": "Peridot, Green Tourmaline"
            }
        },
        "Pisces": {
            "life": {
                "planet": "Jupiter", "u_gem": "Yellow Sapphire", "i_gem": "Pukhraj",
                "metal": "Gold", "finger": "Index Finger", "day": "Thursday",
                "mantra": "Om Gram Greem Groum Sah Gurave Namah",
                "ritual": "Cleanse with milk and honey. Offer yellow flowers.",
                "caution": "Avoid wearing Emerald or Diamond with this.",
                "substitute": "Citrine, Yellow Topaz"
            },
            "lucky": {
                "planet": "Mars", "u_gem": "Red Coral", "i_gem": "Moonga",
                "metal": "Gold or Copper", "finger": "Ring Finger", "day": "Tuesday",
                "mantra": "Om Kram Kreem Kroum Sah Bhaumaya Namah",
                "ritual": "Wash with gangajal and raw milk. Light incense and offer red flowers.",
                "caution": "Avoid wearing Blue Sapphire (Saturn) or Emerald (Mercury) with this.",
                "substitute": "Red Carnelian"
            },
            "benefic": {
                "planet": "Moon", "u_gem": "Pearl", "i_gem": "Moti",
                "metal": "Silver", "finger": "Little Finger", "day": "Monday",
                "mantra": "Om Shram Shreem Shroum Sah Chandramase Namah",
                "ritual": "Soak in unboiled milk. Offer white sweets.",
                "caution": "Avoid wearing with Hessonite (Gomed) or Cat's Eye.",
                "substitute": "Moonstone"
            }
        }
    }

    if ascendant_sign not in gem_map:
        rec = gem_map["Aries"] # Fallback
    else:
        rec = gem_map[ascendant_sign]
    
    # Process with Analysis logic if chart data is available
    if chart_data and shadbala_data:
        life_analysis = analyze_gem_suitability(rec["life"]["planet"], chart_data, shadbala_data)
        lucky_analysis = analyze_gem_suitability(rec["lucky"]["planet"], chart_data, shadbala_data)
        benefic_analysis = analyze_gem_suitability(rec["benefic"]["planet"], chart_data, shadbala_data)
    else:
        # Default analysis if no chart data
        life_analysis = {"suitability": "Suitable", "analysis": "Based on Ascendant Lordship", "strength_score": 100}
        lucky_analysis = {"suitability": "Suitable", "analysis": "Based on 9th House Lordship", "strength_score": 100}
        benefic_analysis = {"suitability": "Suitable", "analysis": "Based on 5th House Lordship", "strength_score": 100}

    # Detailed info for response
    return {
        "life_stone": {
            "type": "Life Stone (Lagna Lord)",
            "gem_name": rec["life"]["u_gem"],
            "indian_name": rec["life"]["i_gem"],
            "planet": rec["life"]["planet"],
            "benefits": "Strengthens health, immunity, self-confidence, and general well-being. Supports the overall path of life.",
            "wear_finger": rec["life"]["finger"],
            "wear_metal": rec["life"]["metal"],
            "wearing_day": rec["life"]["day"],
            "mantra": rec["life"]["mantra"],
            "ritual": rec["life"]["ritual"],
            "caution": rec["life"]["caution"],
            "substitute": rec["life"]["substitute"],
            "analysis": life_analysis
        },
        "lucky_stone": {
            "type": "Lucky Stone (9th House Lord)",
            "gem_name": rec["lucky"]["u_gem"],
            "indian_name": rec["lucky"]["i_gem"],
            "planet": rec["lucky"]["planet"],
            "benefits": "Attracts fortune, divine grace, travel, and higher wisdom. Opens doors to opportunities.",
            "wear_finger": rec["lucky"]["finger"],
            "wear_metal": rec["lucky"]["metal"],
            "wearing_day": rec["lucky"]["day"],
            "mantra": rec["lucky"]["mantra"],
            "ritual": rec["lucky"]["ritual"],
            "caution": rec["lucky"]["caution"],
            "substitute": rec["lucky"]["substitute"],
            "analysis": lucky_analysis
        },
        "benefic_stone": {
            "type": "Benefic Stone (5th House Lord)",
            "gem_name": rec["benefic"]["u_gem"],
            "indian_name": rec["benefic"]["i_gem"],
            "planet": rec["benefic"]["planet"],
            "benefits": "Enhances intelligence, creativity, education, and children. Good for mental clarity.",
            "wear_finger": rec["benefic"]["finger"],
            "wear_metal": rec["benefic"]["metal"],
            "wearing_day": rec["benefic"]["day"],
            "mantra": rec["benefic"]["mantra"],
            "ritual": rec["benefic"]["ritual"],
            "caution": rec["benefic"]["caution"],
            "substitute": rec["benefic"]["substitute"],
            "analysis": benefic_analysis
        }
    }

from astro_app.backend.astrology.chart import calculate_chart

@router.post("/gemstones")
async def recommend_gemstones(request: GemstoneRequest, current_user: User = Depends(get_current_user)):
    """
    Recommend gemstones based on Ascendant (Lagna) sign.
    """
    try:
        # Calculate accurate chart using Swiss Ephemeris
        chart_data = calculate_chart(
            request.date,
            request.time,
            request.timezone,
            request.latitude,
            request.longitude
        )
        

        # Process detailed Shadbala for recommendations
        # Convert planets to format for shadbala service
        planets_data = [{"name": p["name"], "longitude": p["longitude"]} for p in chart_data["planets"]]
        ascendant_idx = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].index(chart_data["ascendant"]["zodiac_sign"])
        
        shadbala_results = await calculate_shadbala(planets_data, ascendant_idx, {
            "date": request.date, "time": request.time
        })
        
        ascendant_sign = chart_data["ascendant"]["zodiac_sign"]
        recommendations = get_gemstone_recommendations(ascendant_sign, chart_data, shadbala_results)
        
        return {
            "ascendant": ascendant_sign,
            "recommendations": recommendations,
            "note": "These recommendations are based on your Ascendant sign. Please consult an astrologer before wearing."
        }
    except Exception as e:
        logger.error(f"Error calculating gemstones: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class NumerologyRequest(BaseModel):
    date: str  # DD/MM/YYYY
    full_name: str
    
def calculate_pythagorean_number(text: str) -> int:
    """
    Calculate number from text using Pythagorean system (A=1, B=2, ... I=9)
    """
    mapping = {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
        's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    }
    
    total = 0
    for char in text.lower():
        if char in mapping:
            total += mapping[char]
    return total

def reduce_number(n: int, allow_master: bool = True) -> int:
    """
    Reduce number to single digit, optionally preserving master numbers 11, 22, 33
    """
    if allow_master and n in [11, 22, 33]:
        return n
        
    while n > 9 and (not allow_master or n not in [11, 22, 33]):
        n = sum(int(d) for d in str(n))
        
    return n

from astro_app.backend.astrology.numerology import NumerologyService

@router.post("/numerology")
async def calculate_numerology(request: NumerologyRequest, current_user: User = Depends(get_current_user)):
    """
    Advanced Numerology: Pythagorean, Chaldean, and Lo Shu Grid.
    """
    try:
        service = NumerologyService()
        results = service.calculate_advanced_numerology(request.full_name, request.date)
        
        if "error" in results:
            raise HTTPException(status_code=400, detail=results["error"])
            
        # Format for backward compatibility and enhanced UI
        return {
            "life_path": {
                "number": results["core"]["life_path"],
                "title": "Life Path Number",
                "description": "Represents your life's purpose and the path you are destined to walk."
            },
            "destiny": {
                "number": results["pythagorean"]["destiny"],
                "title": "Destiny Number",
                "description": "Reveals your natural talents and how you express yourself in the world."
            },
            "soul_urge": {
                "number": results["pythagorean"]["soul_urge"],
                "title": "Soul Urge Number",
                "description": "Reveals your inner cravings and hidden desires."
            },
            "personality": {
                "number": results["pythagorean"]["personality"],
                "title": "Personality Number",
                "description": "How others perceive you and the first impression you make."
            },
            "advanced": results
        }
    except Exception as e:
        logger.error(f"Error calculating numerology: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class CompatibilityRequest(BaseModel):
    input_number: str
    target_root: int

class NameCorrectionRequest(BaseModel):
    name: str
    target_number: int

class NumerologyBlueprintRequest(BaseModel):
    date: str
    full_name: str

@router.post("/numerology/compatibility")
async def check_compatibility(request: CompatibilityRequest, current_user: User = Depends(get_current_user)):
    service = NumerologyService()
    return service.check_compatibility(request.input_number, request.target_root)

@router.post("/numerology/name-correction")
async def suggest_name_corrections(request: NameCorrectionRequest, current_user: User = Depends(get_current_user)):
    service = NumerologyService()
    return service.suggest_name_corrections(request.name, request.target_number)

@router.post("/numerology/blueprint")
async def generate_numerology_blueprint(request: NumerologyBlueprintRequest, current_user: User = Depends(get_current_user)):
    try:
        service = NumerologyService()
        result = service.generate_blueprint(request.full_name, request.date)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Error generating numerology blueprint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
