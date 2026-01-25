"""
Core calculation methods following VedAstro's composable pattern
Pure astrological logic - NO AI
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
import swisseph as swe
import math

# Import from existing modules
from astro_app.backend.astrology.advanced_period import (
    get_julian_day, get_nakshatra, get_rashi, PLANETS, RASHIS, NAKSHATRAS
)

# Define constants
NAKSHATRA_NAMES = NAKSHATRAS  # Alias for consistency

# Constants
KENDRA_HOUSES = [1, 4, 7, 10]
TRIKONA_HOUSES = [1, 5, 9]
UPACHAYA_HOUSES = [3, 6, 10, 11]

class AstroCalculate:
    """Static calculator class following VedAstro pattern"""
    
    # Class constants
    NAKSHATRA_NAMES = NAKSHATRA_NAMES
    RASHI_NAMES = RASHIS
    
    @staticmethod
    def get_julian_day(time: datetime) -> float:
        """Get Julian Day for given datetime"""
        return get_julian_day(time)
    
    @staticmethod
    def get_planetary_positions(jd: float, ayanamsa: str = 'lahiri') -> Dict[str, float]:
        """
        Get all planetary positions at given Julian Day
        
        Args:
            jd: Julian Day
            ayanamsa: Ayanamsa to use ('lahiri' or 'tropical')
        
        Returns:
            Dict of planet names to longitudes (0-360)
        """
        if ayanamsa == 'lahiri':
            swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
            flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
        else:
            flags = swe.FLG_SWIEPH
        
        positions = {}
        for p_name, p_id in PLANETS.items():
            try:
                res = swe.calc_ut(jd, p_id, flags)
                positions[p_name] = res[0][0]
            except Exception as e:
                # Skip planets that can't be calculated
                continue
        
        return positions
    
    @staticmethod
    def get_nakshatra(longitude: float) -> int:
        """Get nakshatra number (1-27) from longitude"""
        return get_nakshatra(longitude)
    
    @staticmethod
    def get_rashi(longitude: float) -> int:
        """Get rashi number (1-12) from longitude"""
        return get_rashi(longitude)
    
    @staticmethod
    def get_planet_house_from_longitude(planet_longitude: float, birth_moon_longitude: float) -> int:
        """
        Get house number (1-12) from planet longitude relative to birth Moon
        
        Args:
            planet_longitude: Current planet longitude (0-360)
            birth_moon_longitude: Birth Moon longitude (0-360)
        
        Returns:
            House number 1-12
        """
        birth_rashi = get_rashi(birth_moon_longitude)
        current_rashi = get_rashi(planet_longitude)
        
        house = (current_rashi - birth_rashi + 12) % 12 + 1
        return house
    
    @staticmethod
    def is_planet_in_kendra(planet_longitude: float, reference_longitude: float) -> bool:
        """Check if planet in Kendra (1, 4, 7, 10) from reference point"""
        house = AstroCalculate.get_planet_house_from_longitude(planet_longitude, reference_longitude)
        return house in KENDRA_HOUSES
    
    @staticmethod
    def is_planet_in_trikona(planet_longitude: float, reference_longitude: float) -> bool:
        """Check if planet in Trikona (1, 5, 9) from reference point"""
        house = AstroCalculate.get_planet_house_from_longitude(planet_longitude, reference_longitude)
        return house in TRIKONA_HOUSES
    
    @staticmethod
    def is_planet_in_upachaya(planet_longitude: float, reference_longitude: float) -> bool:
        """Check if planet in Upachaya (3, 6, 10, 11) from reference point"""
        house = AstroCalculate.get_planet_house_from_longitude(planet_longitude, reference_longitude)
        return house in UPACHAYA_HOUSES
    
    @staticmethod
    def is_all_malefics_in_upachaya(positions: Dict[str, float], reference_longitude: float) -> bool:
        """
        Check if all malefic planets in Upachaya (3, 6, 10, 11)
        
        Args:
            positions: Dict of planet positions
            reference_longitude: Reference point (usually Moon or Lagna)
        
        Returns:
            True if all malefics in Upachaya
        """
        malefics = ['Mars', 'Saturn', 'Rahu', 'Ketu']
        
        for planet in malefics:
            if planet in positions:
                if not AstroCalculate.is_planet_in_upachaya(positions[planet], reference_longitude):
                    return False
        
        return True
    
    @staticmethod
    def get_benefic_planets(positions: Dict[str, float]) -> List[str]:
        """
        Get list of benefic planets
        Natural benefics: Jupiter, Venus, Mercury (if not with malefic), Moon (if waxing)
        """
        benefics = []
        
        # Always benefic
        if 'Jupiter' in positions:
            benefics.append('Jupiter')
        if 'Venus' in positions:
            benefics.append('Venus')
        
        # Mercury is benefic if not conjunct with malefics
        # TODO: Add conjunction check
        if 'Mercury' in positions:
            benefics.append('Mercury')
        
        # Moon is benefic if waxing
        # TODO: Add waxing check
        if 'Moon' in positions:
            benefics.append('Moon')
        
        return benefics
    
    @staticmethod
    def get_malefic_planets(positions: Dict[str, float]) -> List[str]:
        """Get list of malefic planets"""
        malefics = []
        
        for planet in ['Mars', 'Saturn', 'Rahu', 'Ketu', 'Sun']:
            if planet in positions:
                malefics.append(planet)
        
        return malefics
    
    @staticmethod
    def calculate_yoga(sun_longitude: float, moon_longitude: float) -> int:
        """
        Calculate Yoga (1-27) from Sun and Moon longitudes
        Yoga = (Sun + Moon) / 13.333...
        
        Args:
            sun_longitude: Sun longitude (0-360)
            moon_longitude: Moon longitude (0-360)
        
        Returns:
            Yoga number 1-27
        """
        total = (sun_longitude + moon_longitude) % 360
        yoga = int(total / (360 / 27)) + 1
        return min(27, max(1, yoga))
    
    @staticmethod
    def get_tithi(sun_longitude: float, moon_longitude: float) -> int:
        """
        Calculate Tithi (lunar day) from Sun and Moon longitudes
        
        Args:
            sun_longitude: Sun longitude (0-360)
            moon_longitude: Moon longitude (0-360)
        
        Returns:
            Tithi number 1-30
        """
        # Tithi = (Moon - Sun) / 12
        angle = (moon_longitude - sun_longitude + 360) % 360
        tithi = int(angle / 12) + 1
        return min(30, max(1, tithi))

    @staticmethod
    def calculate_tithi(sun_longitude: float, moon_longitude: float) -> int:
        """Alias for get_tithi"""
        return AstroCalculate.get_tithi(sun_longitude, moon_longitude)
    
    @staticmethod
    def normalize_degree(degree: float) -> float:
        """Normalize degree to 0-360 range"""
        return degree % 360
    
    @staticmethod
    def get_planet_speed(jd: float, planet_id: int, ayanamsa: str = 'lahiri') -> float:
        """
        Get planet's speed (daily motion)
        
        Args:
            jd: Julian Day
            planet_id: Swiss Ephemeris planet ID
            ayanamsa: Ayanamsa to use
        
        Returns:
            Speed in degrees per day
        """
        if ayanamsa == 'lahiri':
            swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
            flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
        else:
            flags = swe.FLG_SWIEPH
        
        try:
            res = swe.calc_ut(jd, planet_id, flags)
            return res[0][3]  # Speed is 4th element
        except:
            return 0.0
    
    @staticmethod
    def is_planet_retrograde(jd: float, planet_name: str, ayanamsa: str = 'lahiri') -> bool:
        """Check if planet is retrograde"""
        if planet_name not in PLANETS:
            return False
        
        planet_id = PLANETS[planet_name]
        speed = AstroCalculate.get_planet_speed(jd, planet_id, ayanamsa)
        return speed < 0
    
    @staticmethod
    def get_house_cusps(jd: float, latitude: float, longitude: float, house_system: str = 'P') -> List[float]:
        """
        Calculate house cusps
        
        Args:
            jd: Julian Day
            latitude: Geographic latitude
            longitude: Geographic longitude
            house_system: House system ('P' for Placidus, 'W' for Whole Sign, etc.)
        
        Returns:
            List of 12 house cusp longitudes
        """
        try:
            cusps, ascmc = swe.houses(jd, latitude, longitude, house_system.encode())
            return list(cusps[1:13])  # Return houses 1-12
        except:
            return [0.0] * 12
    
    @staticmethod
    def get_ascendant(jd: float, latitude: float, longitude: float) -> float:
        """Get Ascendant (Lagna) longitude"""
        try:
            cusps, ascmc = swe.houses(jd, latitude, longitude, b'P')
            return ascmc[0]  # Ascendant is first element
        except:
            return 0.0
