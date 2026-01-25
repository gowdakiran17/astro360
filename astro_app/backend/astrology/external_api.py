import httpx
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class AstrologyApiIoService:
    """
    Service to interact with astrology-api.io.
    Provides high-precision Vedic astrology calculations including Shodasha Varga (D1-D60).
    """
    
    BASE_URL = "https://astrology-api.io/api/v1" # Hypothetical base URL based on standard practices
    
    def __init__(self):
        self.api_key = os.getenv("ASTROLOGY_API_IO_KEY")
        self.enabled = bool(self.api_key)
        if not self.enabled:
            logger.warning("ASTROLOGY_API_IO_KEY not found. External astrology API disabled.")

    def _parse_timezone(self, tz_str: str) -> float:
        """
        Converts +HH:MM or -HH:MM format to decimal hours.
        Example: +05:30 -> 5.5
        """
        try:
            sign = 1 if tz_str[0] == '+' else -1
            parts = tz_str[1:].split(':')
            return sign * (int(parts[0]) + int(parts[1]) / 60.0)
        except Exception:
            logger.error(f"Failed to parse timezone: {tz_str}")
            return 0.0

    async def get_shodasha_varga(self, birth_details: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Fetches all 16 divisional charts in one call.
        """
        if not self.enabled:
            return None
            
        # Example payload based on common astrology API structures
        payload = {
            "day": int(birth_details['date'].split('/')[0]),
            "month": int(birth_details['date'].split('/')[1]),
            "year": int(birth_details['date'].split('/')[2]),
            "hour": int(birth_details['time'].split(':')[0]),
            "min": int(birth_details['time'].split(':')[1]),
            "lat": birth_details['latitude'],
            "lon": birth_details['longitude'],
            "tzone": self._parse_timezone(birth_details['timezone']),
            "ayanamsa": 1 # Standard Lahiri
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/shodasha_varga",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling astrology-api.io: {e}")
            return None

    async def get_panchang(self, date_details: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Fetches detailed Panchang for a given date and location.
        """
        if not self.enabled:
            return None
            
        payload = {
            "day": int(date_details['date'].split('/')[0]),
            "month": int(date_details['date'].split('/')[1]),
            "year": int(date_details['date'].split('/')[2]),
            "lat": date_details['latitude'],
            "lon": date_details['longitude'],
            "tzone": self._parse_timezone(date_details['timezone'])
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/panchang",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling astrology-api.io for panchang: {e}")
            return None

    async def get_shadbala(self, birth_details: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Fetches Shadbala from external API.
        """
        if not self.enabled:
            return None
            
        payload = {
            "day": int(birth_details['date'].split('/')[0]),
            "month": int(birth_details['date'].split('/')[1]),
            "year": int(birth_details['date'].split('/')[2]),
            "hour": int(birth_details['time'].split(':')[0]),
            "min": int(birth_details['time'].split(':')[1]),
            "lat": birth_details['latitude'],
            "lon": birth_details['longitude'],
            "tzone": self._parse_timezone(birth_details['timezone'])
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/shadbala",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling astrology-api.io for shadbala: {e}")
            return None

    async def get_matching(self, boy_details: Dict[str, Any], girl_details: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Fetches matching score (Ashtakoot) for two individuals.
        """
        if not self.enabled:
            return None
            
        payload = {
            "boy": {
                "day": int(boy_details['date'].split('/')[0]),
                "month": int(boy_details['date'].split('/')[1]),
                "year": int(boy_details['date'].split('/')[2]),
                "hour": int(boy_details['time'].split(':')[0]),
                "min": int(boy_details['time'].split(':')[1]),
                "lat": boy_details['latitude'],
                "lon": boy_details['longitude'],
                "tzone": self._parse_timezone(boy_details['timezone'])
            },
            "girl": {
                "day": int(girl_details['date'].split('/')[0]),
                "month": int(girl_details['date'].split('/')[1]),
                "year": int(girl_details['date'].split('/')[2]),
                "hour": int(girl_details['time'].split(':')[0]),
                "min": int(girl_details['time'].split(':')[1]),
                "lat": girl_details['latitude'],
                "lon": girl_details['longitude'],
                "tzone": self._parse_timezone(girl_details['timezone'])
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/matching",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling astrology-api.io for matching: {e}")
            return None

    async def get_dasha(self, birth_details: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Fetches detailed Vimshottari Dasha from the external API.
        """
        if not self.enabled:
            return None
            
        payload = {
            "day": int(birth_details['date'].split('/')[0]),
            "month": int(birth_details['date'].split('/')[1]),
            "year": int(birth_details['date'].split('/')[2]),
            "hour": int(birth_details['time'].split(':')[0]),
            "min": int(birth_details['time'].split(':')[1]),
            "lat": birth_details['latitude'],
            "lon": birth_details['longitude'],
            "tzone": self._parse_timezone(birth_details['timezone'])
        }
        
        try:
            async with httpx.AsyncClient() as client:
                # Using a hypothetical endpoint name based on typical astrology API structures
                response = await client.post(
                    f"{self.BASE_URL}/dasha",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling astrology-api.io for dasha: {e}")
            return None

    async def get_financial_profile(self, birth_details: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Fetches business/financial astrology profile from the external API.
        """
        if not self.enabled:
            return None
            
        payload = {
            "day": int(birth_details['date'].split('/')[0]),
            "month": int(birth_details['date'].split('/')[1]),
            "year": int(birth_details['date'].split('/')[2]),
            "hour": int(birth_details['time'].split(':')[0]),
            "min": int(birth_details['time'].split(':')[1]),
            "lat": birth_details['latitude'],
            "lon": birth_details['longitude'],
            "tzone": self._parse_timezone(birth_details['timezone'])
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/business_profile", # Hypothetical endpoint for business API
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling astrology-api.io for business profile: {e}")
            return None

    async def get_shadbala(self, birth_details: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Fetches high-precision Shadbala strength for all planets.
        """
        if not self.enabled:
            return None
            
        payload = {
            "day": int(birth_details['date'].split('/')[0]),
            "month": int(birth_details['date'].split('/')[1]),
            "year": int(birth_details['date'].split('/')[2]),
            "hour": int(birth_details['time'].split(':')[0]),
            "min": int(birth_details['time'].split(':')[1]),
            "lat": birth_details['latitude'],
            "lon": birth_details['longitude'],
            "tzone": self._parse_timezone(birth_details['timezone'])
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/shadbala",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling astrology-api.io for shadbala: {e}")
            return None

    async def get_period_analysis(self, birth_details: Dict[str, Any], month: int, year: int) -> Optional[Dict[str, Any]]:
        """
        Fetches detailed period analysis/predictions from the external API.
        """
        if not self.enabled:
            return None
            
        payload = {
            "day": int(birth_details['date'].split('/')[0]),
            "month": int(birth_details['date'].split('/')[1]),
            "year": int(birth_details['date'].split('/')[2]),
            "hour": int(birth_details['time'].split(':')[0]),
            "min": int(birth_details['time'].split(':')[1]),
            "lat": birth_details['latitude'],
            "lon": birth_details['longitude'],
            "tzone": self._parse_timezone(birth_details['timezone']),
            "target_month": month,
            "target_year": year
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/period_analysis", # Hypothetical endpoint
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=15.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling astrology-api.io for period analysis: {e}")
            return None

# Singleton instance
astrology_api_service = AstrologyApiIoService()
