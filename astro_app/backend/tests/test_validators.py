"""
Unit tests for validators module
"""

import pytest
from datetime import datetime
from astrology.period_analysis.validators import (
    validate_birth_details,
    validate_moon_longitude,
    validate_month_year,
    ValidationError
)


class TestValidateBirthDetails:
    """Tests for validate_birth_details function"""
    
    def test_valid_birth_details_dd_mm_yyyy(self):
        """Test with valid DD/MM/YYYY format"""
        birth_details = {
            'date': '15/08/1990',
            'time': '14:30',
            'latitude': 28.6139,
            'longitude': 77.2090,
            'timezone': 5.5
        }
        
        birth_dt, lat, lon, tz = validate_birth_details(birth_details)
        
        assert birth_dt.year == 1990
        assert birth_dt.month == 8
        assert birth_dt.day == 15
        assert birth_dt.hour == 14
        assert birth_dt.minute == 30
        assert lat == 28.6139
        assert lon == 77.2090
        assert tz == 5.5
    
    def test_valid_birth_details_yyyy_mm_dd(self):
        """Test with valid YYYY-MM-DD format"""
        birth_details = {
            'date': '1990-08-15',
            'time': '14:30',
            'latitude': 28.6139,
            'longitude': 77.2090,
            'timezone': 5.5
        }
        
        birth_dt, lat, lon, tz = validate_birth_details(birth_details)
        
        assert birth_dt.year == 1990
        assert birth_dt.month == 8
        assert birth_dt.day == 15
    
    def test_missing_required_field(self):
        """Test with missing required field"""
        birth_details = {
            'date': '15/08/1990',
            'time': '14:30',
            'latitude': 28.6139,
            # Missing longitude and timezone
        }
        
        with pytest.raises(ValidationError, match="Missing required field"):
            validate_birth_details(birth_details)
    
    def test_invalid_date_format(self):
        """Test with invalid date format"""
        birth_details = {
            'date': '15-08-1990',  # Invalid format
            'time': '14:30',
            'latitude': 28.6139,
            'longitude': 77.2090,
            'timezone': 5.5
        }
        
        with pytest.raises(ValidationError, match="Invalid date format"):
            validate_birth_details(birth_details)
    
    def test_invalid_time_format(self):
        """Test with invalid time format"""
        birth_details = {
            'date': '15/08/1990',
            'time': '25:30',  # Invalid hour
            'latitude': 28.6139,
            'longitude': 77.2090,
            'timezone': 5.5
        }
        
        with pytest.raises(ValidationError, match="Invalid time format"):
            validate_birth_details(birth_details)
    
    def test_invalid_latitude(self):
        """Test with invalid latitude"""
        birth_details = {
            'date': '15/08/1990',
            'time': '14:30',
            'latitude': 95.0,  # Out of range
            'longitude': 77.2090,
            'timezone': 5.5
        }
        
        with pytest.raises(ValidationError, match="Latitude must be between"):
            validate_birth_details(birth_details)
    
    def test_invalid_longitude(self):
        """Test with invalid longitude"""
        birth_details = {
            'date': '15/08/1990',
            'time': '14:30',
            'latitude': 28.6139,
            'longitude': 185.0,  # Out of range
            'timezone': 5.5
        }
        
        with pytest.raises(ValidationError, match="Longitude must be between"):
            validate_birth_details(birth_details)
    
    def test_invalid_timezone(self):
        """Test with invalid timezone"""
        birth_details = {
            'date': '15/08/1990',
            'time': '14:30',
            'latitude': 28.6139,
            'longitude': 77.2090,
            'timezone': 15.0  # Out of range
        }
        
        with pytest.raises(ValidationError, match="Timezone must be between"):
            validate_birth_details(birth_details)


class TestValidateMoonLongitude:
    """Tests for validate_moon_longitude function"""
    
    def test_valid_moon_longitude(self):
        """Test with valid moon longitude"""
        result = validate_moon_longitude(125.5)
        assert result == 125.5
    
    def test_moon_longitude_normalization(self):
        """Test normalization to 0-360 range"""
        result = validate_moon_longitude(365.0)
        assert result == 5.0
    
    def test_negative_moon_longitude(self):
        """Test negative longitude normalization"""
        result = validate_moon_longitude(-10.0)
        assert result == 350.0
    
    def test_none_moon_longitude(self):
        """Test with None value"""
        with pytest.raises(ValidationError, match="cannot be None"):
            validate_moon_longitude(None)
    
    def test_invalid_moon_longitude_type(self):
        """Test with invalid type"""
        with pytest.raises(ValidationError, match="Invalid moon longitude"):
            validate_moon_longitude("invalid")


class TestValidateMonthYear:
    """Tests for validate_month_year function"""
    
    def test_valid_month_year(self):
        """Test with valid month and year"""
        month, year = validate_month_year(8, 2024)
        assert month == 8
        assert year == 2024
    
    def test_invalid_month_low(self):
        """Test with month below valid range"""
        with pytest.raises(ValidationError, match="Month must be between"):
            validate_month_year(0, 2024)
    
    def test_invalid_month_high(self):
        """Test with month above valid range"""
        with pytest.raises(ValidationError, match="Month must be between"):
            validate_month_year(13, 2024)
    
    def test_invalid_year_low(self):
        """Test with year below valid range"""
        with pytest.raises(ValidationError, match="Year must be between"):
            validate_month_year(8, 1899)
    
    def test_invalid_year_high(self):
        """Test with year above valid range"""
        with pytest.raises(ValidationError, match="Year must be between"):
            validate_month_year(8, 2101)
    
    def test_invalid_month_type(self):
        """Test with invalid month type"""
        with pytest.raises(ValidationError, match="Invalid month"):
            validate_month_year("invalid", 2024)
    
    def test_invalid_year_type(self):
        """Test with invalid year type"""
        with pytest.raises(ValidationError, match="Invalid year"):
            validate_month_year(8, "invalid")
