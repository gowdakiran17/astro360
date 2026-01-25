from datetime import datetime
import swisseph as swe
from app.modules.horoscope.models import BirthDetails, PlanetPosition, HoroscopeResponse
from app.modules.common.utils import normalize_degree, get_zodiac_sign, get_nakshatra
import logging

logger = logging.getLogger(__name__)

class HoroscopeService:
    @staticmethod
    def calculate_horoscope(birth_details: BirthDetails) -> HoroscopeResponse:
        try:
            # 1. Parse Date and Time
            dt_str = f"{birth_details.date_str} {birth_details.time_str}"
            naive_dt = datetime.strptime(dt_str, "%d/%m/%Y %H:%M")
            
            # Parse offset
            offset_str = birth_details.timezone_str
            sign = 1 if offset_str.startswith("+") else -1
            parts = offset_str.strip("+-").split(":")
            hours = int(parts[0])
            minutes = int(parts[1]) if len(parts) > 1 else 0
            offset_minutes = sign * (hours * 60 + minutes)
            
            # Calculate Decimal Hour in UTC
            decimal_hour_local = naive_dt.hour + naive_dt.minute / 60.0 + naive_dt.second / 3600.0
            decimal_hour_utc = decimal_hour_local - (offset_minutes / 60.0)
            
            year = naive_dt.year
            month = naive_dt.month
            day = naive_dt.day
            
            # 2. Calculate Julian Day (UT)
            jd_ut = swe.julday(year, month, day, decimal_hour_utc)
            
            # 3. Set Sidereal Mode (Lahiri Ayanamsa)
            swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
            
            # 4. Calculate Planets
            planets_map = {
                "Sun": swe.SUN,
                "Moon": swe.MOON,
                "Mars": swe.MARS,
                "Mercury": swe.MERCURY,
                "Jupiter": swe.JUPITER,
                "Venus": swe.VENUS,
                "Saturn": swe.SATURN,
                "Rahu": swe.TRUE_NODE 
            }
            
            planet_positions = []
            
            # Get Ayanamsa for this time
            ayanamsa = swe.get_ayanamsa_ut(jd_ut)
            
            for p_name, p_id in planets_map.items():
                # Calculate Sidereal position
                flags = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL
                
                res = swe.calc_ut(jd_ut, p_id, flags)
                # res is ((lon, lat, dist, speed_lon, speed_lat, speed_dist), ret_flag)
                
                lon = res[0][0]
                speed = res[0][3]
                is_retro = speed < 0
                
                if p_name == "Rahu":
                    # Add Rahu
                    planet_positions.append(PlanetPosition(
                        name="Rahu",
                        longitude=lon,
                        zodiac_sign=get_zodiac_sign(lon),
                        nakshatra=get_nakshatra(lon),
                        house_sign="Unknown",
                        is_retrograde=is_retro
                    ))
                    
                    # Calculate Ketu (Always opposite to Rahu)
                    ketu_lon = normalize_degree(lon + 180)
                    planet_positions.append(PlanetPosition(
                        name="Ketu",
                        longitude=ketu_lon,
                        zodiac_sign=get_zodiac_sign(ketu_lon),
                        nakshatra=get_nakshatra(ketu_lon),
                        house_sign="Unknown",
                        is_retrograde=is_retro
                    ))
                else:
                    planet_positions.append(PlanetPosition(
                        name=p_name,
                        longitude=lon,
                        zodiac_sign=get_zodiac_sign(lon),
                        nakshatra=get_nakshatra(lon),
                        house_sign="Unknown",
                        is_retrograde=is_retro
                    ))

            # 5. Calculate Ascendant (Lagna)
            # swe.houses calculates Tropical cusps. We need to subtract ayanamsa manually.
            # Longitude must be in degrees.
            res_houses = swe.houses(jd_ut, birth_details.latitude, birth_details.longitude, b'P') 
            ascendant_tropical = res_houses[1][0]
            ascendant_nirayana = normalize_degree(ascendant_tropical - ayanamsa)
            
            # 6. Determine Houses (Whole Sign System)
            asc_sign_index = int(ascendant_nirayana / 30)
            
            for p in planet_positions:
                p_sign_index = int(p.longitude / 30)
                # House number = (Planet Sign Index - Asc Sign Index) + 1
                # If result is <= 0, add 12.
                diff = p_sign_index - asc_sign_index
                house_num = (diff % 12) + 1
                p.house_sign = f"House {house_num}"

            # Add Ascendant
            planet_positions.insert(0, PlanetPosition(
                name="Ascendant",
                longitude=ascendant_nirayana,
                zodiac_sign=get_zodiac_sign(ascendant_nirayana),
                nakshatra=get_nakshatra(ascendant_nirayana),
                house_sign="House 1",
                is_retrograde=False
            ))

            return HoroscopeResponse(
                birth_details=birth_details,
                planets=planet_positions
            )

        except Exception as e:
            logger.error(f"Error calculating horoscope: {e}", exc_info=True)
            raise e
