"""
VedAstro Predictor Client
Wraps VedAstro's prediction APIs for life events, timeline, and timing analysis
"""
import requests
import logging
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class VedAstroPredictorClient:
    """
    Client for VedAstro Prediction APIs
    Documentation: https://vedastro.org/APIBuilder.html
    """
    
    BASE_URL = "https://api.vedastro.org/api"
    API_KEY = os.getenv("VEDASTRO_API_KEY", "")
    
    @classmethod
    def format_birth_time(cls, birth_details: Dict) -> str:
        """
        Convert birth details to VedAstro format: "HH:mm DD/MM/YYYY +HH:mm"
        Example: "12:30 15/01/1990 +05:30"
        """
        date = birth_details.get("date")  # DD/MM/YYYY
        time = birth_details.get("time")  # HH:MM
        timezone = birth_details.get("timezone")  # +HH:MM or decimal
        
        # Ensure timezone is in +HH:MM format
        if isinstance(timezone, (int, float)):
            # Convert decimal to +HH:MM
            hours = int(timezone)
            minutes = int((abs(timezone) - abs(hours)) * 60)
            timezone = f"{'+' if timezone >= 0 else '-'}{abs(hours):02d}:{minutes:02d}"
        
        return f"{time} {date} {timezone}"
    
    @classmethod
    def get_life_predictions(
        cls, 
        birth_details: Dict,
        categories: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Get life predictions for specific categories.
        
        Args:
            birth_details: Dict with date, time, timezone, latitude, longitude
            categories: List of prediction categories (marriage, career, wealth, health, children)
                       If None, returns all categories
        
        Returns:
            Dict with predictions for each category including probability and timing
        """
        if categories is None:
            categories = ["marriage", "career", "wealth", "health", "children"]
        
        birth_time_str = cls.format_birth_time(birth_details)
        location = {
            "Name": birth_details.get("location", "Unknown"),
            "Longitude": birth_details.get("longitude"),
            "Latitude": birth_details.get("latitude")
        }
        
        predictions = {}
        
        for category in categories:
            try:
                # VedAstro HoroscopePrediction endpoint
                url = f"{cls.BASE_URL}/Calculate/HoroscopePrediction/{category}"
                
                params = {
                    "Location": f"{location['Longitude']},{location['Latitude']}",
                    "Time": birth_time_str
                }
                
                logger.info(f"Fetching {category} prediction from VedAstro")
                response = requests.get(url, params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    predictions[category] = {
                        "status": "success",
                        "data": data.get("Payload", {}),
                        "probability": cls._extract_probability(data),
                        "timing": cls._extract_timing(data)
                    }
                else:
                    logger.warning(f"Failed to get {category} prediction: {response.status_code}")
                    predictions[category] = {
                        "status": "error",
                        "message": f"API returned {response.status_code}"
                    }
                    
            except Exception as e:
                logger.error(f"Error fetching {category} prediction: {str(e)}")
                predictions[category] = {
                    "status": "error",
                    "message": str(e)
                }
        
        return predictions
    
    @classmethod
    def get_natal_chart(cls, birth_details: Dict) -> Dict[str, Any]:
        """Fetch natal chart data from VedAstro"""
        try:
            birth_time_str = cls.format_birth_time(birth_details)
            url = f"{cls.BASE_URL}/Calculate/PlanetPositions"
            params = {
                "Location": f"{birth_details['longitude']},{birth_details['latitude']}",
                "Time": birth_time_str,
                "Ayanamsa": "LAHIRI"
            }
            response = requests.get(url, params=params, timeout=15)
            if response.status_code == 200:
                payload = response.json().get("Payload", [])
                # Normalize response for engine
                planets = {p["Name"]: p["Longitude"] for p in payload if "Name" in p}
                # Find Ascendant
                asc = [p["Longitude"] for p in payload if p.get("Name") == "Ascendant"]
                return {
                    "planets": planets,
                    "ascendant_longitude": asc[0] if asc else planets.get("Sun", 0), # Fallback
                }
            return {}
        except Exception as e:
            logger.error(f"Error fetching natal chart from VedAstro: {e}")
            return {}

    @classmethod
    def get_panchanga(cls, time_dt: datetime, birth_details: Dict) -> Dict[str, Any]:
        """Fetch Panchanga data for a specific time and location"""
        try:
            # Format time for VedAstro
            time_str = f"{time_dt.strftime('%H:%M %d/%m/%Y')} {birth_details['timezone']}"
            url = f"{cls.BASE_URL}/Calculate/Panchanga"
            params = {
                "Location": f"{birth_details['longitude']},{birth_details['latitude']}",
                "Time": time_str
            }
            response = requests.get(url, params=params, timeout=15)
            if response.status_code == 200:
                data = response.json().get("Payload", {})
                return {
                    "tithi": data.get("Tithi", {}).get("Id", 1),
                    "vara": data.get("DayOfWeek", {}).get("Id", 0),
                    "nakshatra": data.get("Nakshatra", {}).get("Id", 1),
                    "yoga": data.get("Yoga", {}).get("Id", 1),
                    "karana": data.get("Karana", {}).get("Id", 1)
                }
            return {}
        except Exception as e:
            logger.error(f"Error fetching panchanga from VedAstro: {e}")
            return {}

    @classmethod
    def get_transits(cls, time_dt: datetime, birth_details: Dict) -> Dict[str, Any]:
        """Fetch Transits at specific time and location"""
        try:
            time_str = f"{time_dt.strftime('%H:%M %d/%m/%Y')} {birth_details['timezone']}"
            url = f"{cls.BASE_URL}/Calculate/PlanetPositionsAll"
            params = {
                "Location": f"{birth_details['longitude']},{birth_details['latitude']}",
                "Time": time_str,
                "Ayanamsa": "LAHIRI"
            }
            response = requests.get(url, params=params, timeout=15)
            if response.status_code == 200:
                payload = response.json().get("Payload", [])
                return {p["Name"]: p["Longitude"] for p in payload if "Name" in p}
            return {}
        except Exception as e:
            logger.error(f"Error fetching transits from VedAstro: {e}")
            return {}

    @classmethod
    def get_dasha(cls, time_dt: datetime, birth_details: Dict) -> Dict[str, Any]:
        """Fetch current Dasha from VedAstro"""
        try:
            birth_time_str = cls.format_birth_time(birth_details)
            time_str = f"{time_dt.strftime('%H:%M %d/%m/%Y')} {birth_details['timezone']}"
            url = f"{cls.BASE_URL}/Calculate/VimshottariDasha"
            params = {
                "Location": f"{birth_details['longitude']},{birth_details['latitude']}",
                "BirthTime": birth_time_str,
                "Time": time_str
            }
            response = requests.get(url, params=params, timeout=15)
            if response.status_code == 200:
                data = response.json().get("Payload", {})
                # Format: { 'Current': { 'Maha': { 'Planet': 'Sun' }, 'Antara': { 'Planet': 'Moon' } } }
                maha = data.get("Current", {}).get("Maha", {}).get("Planet")
                antara = data.get("Current", {}).get("Antara", {}).get("Planet")
                return {"maha": maha, "antara": antara}
            return {}
        except Exception as e:
            logger.error(f"Error fetching dasha from VedAstro: {e}")
            return {}
    
    @classmethod
    def get_dasha_timeline(
        cls,
        birth_details: Dict,
        start_date: str,
        end_date: str
    ) -> List[Dict[str, Any]]:
        """
        Get dasha periods for a date range.
        
        Args:
            birth_details: Birth chart details
            start_date: Start date in DD/MM/YYYY format
            end_date: End date in DD/MM/YYYY format
        
        Returns:
            List of dasha periods with strength scores
        """
        try:
            birth_time_str = cls.format_birth_time(birth_details)
            
            url = f"{cls.BASE_URL}/Calculate/DasaAtRange"
            
            params = {
                "Location": f"{birth_details['longitude']},{birth_details['latitude']}",
                "BirthTime": birth_time_str,
                "StartTime": f"00:00 {start_date} {birth_details['timezone']}",
                "EndTime": f"23:59 {end_date} {birth_details['timezone']}"
            }
            
            logger.info(f"Fetching dasha timeline from {start_date} to {end_date}")
            response = requests.get(url, params=params, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                return cls._parse_dasha_timeline(data.get("Payload", []))
            else:
                logger.error(f"Dasha timeline API failed: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching dasha timeline: {str(e)}")
            return []
    
    @classmethod
    def get_event_timing(
        cls,
        birth_details: Dict,
        event_type: str
    ) -> Dict[str, Any]:
        """
        Get optimal timing for a specific life event.
        
        Args:
            birth_details: Birth chart details
            event_type: Type of event (marriage, business, travel, etc.)
        
        Returns:
            Dict with optimal timing windows and strength scores
        """
        try:
            birth_time_str = cls.format_birth_time(birth_details)
            
            # Use HoroscopePrediction with specific event query
            url = f"{cls.BASE_URL}/Calculate/HoroscopePrediction/{event_type}"
            
            params = {
                "Location": f"{birth_details['longitude']},{birth_details['latitude']}",
                "Time": birth_time_str
            }
            
            logger.info(f"Fetching timing for {event_type}")
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "status": "success",
                    "event_type": event_type,
                    "timing": cls._extract_timing(data),
                    "strength": cls._extract_probability(data),
                    "details": data.get("Payload", {})
                }
            else:
                return {
                    "status": "error",
                    "message": f"API returned {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error fetching event timing: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    # --- Helper Methods ---
    
    @classmethod
    def _extract_probability(cls, api_response: Dict) -> float:
        """Extract probability/strength score from VedAstro response"""
        payload = api_response.get("Payload", {})
        
        # VedAstro may return different formats, try common keys
        if isinstance(payload, dict):
            return payload.get("Probability", payload.get("Strength", 0.5))
        
        return 0.5  # Default neutral probability
    
    @classmethod
    def _extract_timing(cls, api_response: Dict) -> Dict[str, str]:
        """Extract timing information from VedAstro response"""
        payload = api_response.get("Payload", {})
        
        if isinstance(payload, dict):
            return {
                "start": payload.get("StartDate", "Unknown"),
                "end": payload.get("EndDate", "Unknown"),
                "peak": payload.get("PeakDate", "Unknown")
            }
        
        return {
            "start": "Unknown",
            "end": "Unknown",
            "peak": "Unknown"
        }
    
    @classmethod
    def _parse_dasha_timeline(cls, raw_timeline: List) -> List[Dict[str, Any]]:
        """Parse VedAstro dasha timeline into standardized format"""
        parsed = []
        
        for period in raw_timeline:
            if isinstance(period, dict):
                parsed.append({
                    "mahadasha": period.get("Mahadasha", "Unknown"),
                    "antardasha": period.get("Antardasha", "Unknown"),
                    "pratyantardasha": period.get("Pratyantardasha", "Unknown"),
                    "start_date": period.get("StartTime", ""),
                    "end_date": period.get("EndTime", ""),
                    "strength": period.get("Strength", 50)
                })
        
        return parsed
    
    # --- Life Predictor Methods (Daily Granularity) ---
    
    @classmethod
    def get_life_predictor_timeline(
        cls,
        birth_details: Dict,
        start_date: str,
        end_date: str,
        filters: Dict = None
    ) -> Dict[str, Any]:
        """
        Get life predictor timeline with daily granularity and multiple prediction rows.
        Matches VedAstro.org's implementation.
        
        Args:
            birth_details: Birth chart details
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            filters: Optional filters for houses, planets, categories
        
        Returns:
            Dict with predictions array, smart_summary, and current_dasha
        """
        try:
            from datetime import datetime, timedelta
            
            birth_time_str = cls.format_birth_time(birth_details)
            location = f"{birth_details['longitude']},{birth_details['latitude']}"
            
            # Fetch all horoscope predictions from VedAstro
            url = f"{cls.BASE_URL}/Calculate/HoroscopePredictions"
            
            params = {
                "Location": location,
                "Time": birth_time_str,
                "Ayanamsa": "LAHIRI"
            }
            
            # Add API key if available
            if cls.API_KEY:
                params["ApiKey"] = cls.API_KEY
            
            logger.info(f"Fetching life predictions from {start_date} to {end_date}")
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code != 200:
                logger.error(f"Life predictor API failed: {response.status_code}")
                return {
                    "status": "error",
                    "message": f"API returned {response.status_code}"
                }
            
            data = response.json()
            
            # Debug logging - check API response status
            api_status = data.get('Status')
            logger.info(f"VedAstro API response status: {api_status}")
            
            # If API returned Fail status, log the error and return empty
            if api_status == "Fail":
                error_message = data.get('Payload', 'Unknown error')
                logger.error(f"VedAstro API returned Fail status. Error: {error_message}")
                logger.error(f"Full API response: {data}")
                return {
                    "status": "error",
                    "message": f"VedAstro API error: {error_message}",
                    "predictions": [],
                    "smart_summary": {},
                    "current_dasha": {},
                    "total_predictions": 0
                }
            
            raw_predictions = data.get("Payload", [])
            
            logger.info(f"Number of raw predictions: {len(raw_predictions) if isinstance(raw_predictions, list) else 'not a list'}")
            if not raw_predictions:
                logger.warning(f"Empty predictions from VedAstro. Full response: {data}")
            
            # Parse date range
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            
            # Build daily prediction rows
            prediction_rows = cls._build_prediction_rows(

                raw_predictions, 
                start_dt, 
                end_dt,
                filters
            )
            
            # Calculate smart summary
            smart_summary = cls._calculate_smart_summary(
                prediction_rows,
                start_dt,
                end_dt
            )
            
            # Get current dasha info
            current_dasha = cls._get_current_dasha_info(birth_details)
            
            return {
                "status": "success",
                "date_range": {
                    "start": start_date,
                    "end": end_date
                },
                "predictions": prediction_rows,
                "smart_summary": smart_summary,
                "current_dasha": current_dasha,
                "total_predictions": len(prediction_rows)
            }
                
        except Exception as e:
            logger.error(f"Error fetching life predictor timeline: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "status": "error",
                "message": str(e)
            }
    
    @classmethod
    def _build_prediction_rows(
        cls,
        raw_predictions: List[Dict],
        start_dt: datetime,
        end_dt: datetime,
        filters: Dict = None
    ) -> List[Dict]:
        """Build individual prediction rows with daily status"""
        from dateutil.parser import parse
        
        prediction_rows = []
        
        for pred in raw_predictions:
            if not isinstance(pred, dict):
                continue
            
            # Extract prediction metadata
            name = pred.get("Name", "Unknown")
            description = pred.get("Description", "")
            
            # Try to extract house and planet info from name/description
            house = cls._extract_house(name, description)
            planet = cls._extract_planet(name, description)
            category = cls._categorize_prediction(name, description)
            
            # Apply filters
            if filters:
                # Only filter out if we identified a specific house/planet and it's not in the list
                # Always keep "Unknown" (0) houses/planets as they apply generally
                if filters.get("houses") and house != 0 and house not in filters["houses"]:
                    continue
                if filters.get("planets") and planet != "Unknown" and planet not in filters["planets"]:
                    continue
                if filters.get("categories") and category not in filters["categories"]:
                    continue
            
            # Build daily status map
            daily_status = {}
            
            try:
                # Check if prediction has time range
                start_time = pred.get("StartTime")
                end_time = pred.get("EndTime")
                
                if start_time and end_time:
                    pred_start = parse(start_time).date()
                    pred_end = parse(end_time).date()
                    
                    # Determine if good or bad
                    is_good = cls._is_good_prediction(name, description)
                    status = "good" if is_good else "bad"
                    
                    # Fill daily status for prediction range
                    current = max(start_dt.date(), pred_start)
                    end = min(end_dt.date(), pred_end)
                    
                    while current <= end:
                        date_str = current.strftime("%Y-%m-%d")
                        daily_status[date_str] = status
                        current += timedelta(days=1)
                
            except Exception as e:
                logger.debug(f"Error parsing prediction dates: {e}")
                continue
            
            # Only add if has some daily data
            if daily_status:
                prediction_rows.append({
                    "name": name,
                    "description": description,
                    "category": category,
                    "house": house,
                    "planet": planet,
                    "daily_status": daily_status
                })
        
        # Sort by category and name
        prediction_rows.sort(key=lambda x: (x["category"], x["name"]))
        
        return prediction_rows
    
    @classmethod
    def _calculate_smart_summary(
        cls,
        prediction_rows: List[Dict],
        start_dt: datetime,
        end_dt: datetime
    ) -> Dict[str, str]:
        """Calculate smart summary by aggregating all predictions per day"""
        smart_summary = {}
        
        current = start_dt.date()
        while current <= end_dt.date():
            date_str = current.strftime("%Y-%m-%d")
            
            good_count = 0
            bad_count = 0
            
            # Count good/bad predictions for this day
            for pred in prediction_rows:
                status = pred["daily_status"].get(date_str)
                if status == "good":
                    good_count += 1
                elif status == "bad":
                    bad_count += 1
            
            # Determine overall status
            if good_count == 0 and bad_count == 0:
                smart_summary[date_str] = "neutral"
            elif good_count > bad_count * 1.5:
                smart_summary[date_str] = "good"
            elif bad_count > good_count * 1.5:
                smart_summary[date_str] = "bad"
            else:
                smart_summary[date_str] = "mixed"
            
            current += timedelta(days=1)
        
        return smart_summary
    
    @classmethod
    def _extract_house(cls, name: str, description: str) -> int:
        """Extract house number from prediction name/description"""
        import re
        
        # Look for "House X" or "Xth house" patterns
        text = f"{name} {description}".lower()
        
        patterns = [
            r'house\s+(\d+)',
            r'(\d+)(?:st|nd|rd|th)\s+house',
            r'h(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                house_num = int(match.group(1))
                if 1 <= house_num <= 12:
                    return house_num
        
        return 0  # Unknown
    
    @classmethod
    def _extract_planet(cls, name: str, description: str) -> str:
        """Extract planet from prediction name/description"""
        text = f"{name} {description}".lower()
        
        planets = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"]
        
        for planet in planets:
            if planet in text:
                return planet.capitalize()
        
        return "Unknown"
    
    @classmethod
    def _categorize_prediction(cls, name: str, description: str) -> str:
        """Categorize prediction into business, health, etc."""
        text = f"{name} {description}".lower()
        
        categories = {
            "Business": ["business", "buying", "selling", "profit", "money", "borrowing", "lending"],
            "Health": ["health", "disease", "medicine", "treatment"],
            "Travel": ["travel", "journey", "trip"],
            "Agriculture": ["agriculture", "farming", "planting"],
            "Building": ["building", "construction", "renovation"],
            "Remedies": ["remedies", "puja", "mantra"],
            "Yoga": ["yoga", "constellation"],
            "Dasha": ["dasha", "mahadasha", "antardasha"],
            "General": ["good", "bad", "favorable", "unfavorable"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in text for keyword in keywords):
                return category
        
        return "Other"
    
    @classmethod
    def _is_good_prediction(cls, name: str, description: str) -> bool:
        """Determine if prediction is good or bad"""
        text = f"{name} {description}".lower()
        
        good_keywords = ["good", "favorable", "auspicious", "benefit", "gain", "success", "prosperity"]
        bad_keywords = ["bad", "unfavorable", "inauspicious", "loss", "danger", "trouble", "avoid"]
        
        good_score = sum(1 for keyword in good_keywords if keyword in text)
        bad_score = sum(1 for keyword in bad_keywords if keyword in text)
        
        return good_score > bad_score
    
    @classmethod
    def _get_current_dasha_info(cls, birth_details: Dict) -> Dict[str, Any]:
        """Get current dasha information"""
        try:
            from datetime import datetime
            
            # This would ideally call the dasha calculation
            # For now, return placeholder
            return {
                "mahadasha": "Rahu",
                "antardasha": "Mars",
                "pratyantardasha": "Venus",
                "description": "Current dasha period information",
                "start_date": "2024-01-01",
                "end_date": "2026-12-31"
            }
        except Exception:
            return {}


