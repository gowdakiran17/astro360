from datetime import datetime
import re

class ValidationError(Exception):
    """Custom validation error for period analysis."""
    pass

def validate_date(date_str: str) -> bool:
    try:
        datetime.strptime(date_str, "%d/%m/%Y")
        return True
    except ValueError:
        return False

def validate_time(time_str: str) -> bool:
    try:
        datetime.strptime(time_str, "%H:%M")
        return True
    except ValueError:
        return False

def validate_timezone(timezone_str: str) -> bool:
    # Basic check for +HH:MM or -HH:MM
    pattern = r'^[+-]\d{2}:\d{2}$'
    return bool(re.match(pattern, timezone_str))

def validate_birth_details(details: dict):
    """
    Validates birth details dictionary.
    Expected keys: date, time, timezone, latitude, longitude.
    """
    if not validate_date(details.get('date', '')):
        raise ValidationError("Invalid date format. Use DD/MM/YYYY")
    if not validate_time(details.get('time', '')):
        raise ValidationError("Invalid time format. Use HH:MM")
    if not validate_timezone(details.get('timezone', '')):
        raise ValidationError("Invalid timezone format. Use +HH:MM or -HH:MM")
    
    try:
        lat = float(details.get('latitude', 0))
        lon = float(details.get('longitude', 0))
        
        if not (-90 <= lat <= 90):
            raise ValidationError("Latitude must be between -90 and 90")
        if not (-180 <= lon <= 180):
            raise ValidationError("Longitude must be between -180 and 180")
    except (ValueError, TypeError):
         raise ValidationError("Latitude and Longitude must be numbers")
    
    return details

def validate_moon_longitude(lon: float):
    if not (0 <= lon < 360):
        raise ValidationError("Moon longitude must be between 0 and 360")

def validate_month_year(month: int, year: int):
    if not (1 <= month <= 12):
        raise ValidationError("Month must be between 1 and 12")
    if not (1000 <= year <= 3000): # Broad range
        raise ValidationError("Year must be within reasonable range (1000-3000)")
