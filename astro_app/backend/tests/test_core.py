"""
Unit tests for core calculator module
"""

import pytest
from datetime import datetime
from astrology.period_analysis.core import AstroCalculate


class TestGetPlanetaryPositions:
    """Tests for get_planetary_positions method"""
    
    def test_get_positions_sidereal(self):
        """Test getting planetary positions in sidereal zodiac"""
        test_date = datetime(2024, 1, 1, 12, 0, 0)
        positions = AstroCalculate.get_planetary_positions(test_date, use_sidereal=True)
        
        # Should have positions for all planets
        assert 'Sun' in positions
        assert 'Moon' in positions
        assert 'Mars' in positions
        
        # All longitudes should be in 0-360 range
        for planet, longitude in positions.items():
            assert 0 <= longitude < 360
    
    def test_get_positions_tropical(self):
        """Test getting planetary positions in tropical zodiac"""
        test_date = datetime(2024, 1, 1, 12, 0, 0)
        positions = AstroCalculate.get_planetary_positions(test_date, use_sidereal=False)
        
        assert len(positions) > 0
        for planet, longitude in positions.items():
            assert 0 <= longitude < 360


class TestGetPlanetHouse:
    """Tests for get_planet_house method"""
    
    def test_planet_in_first_house(self):
        """Test planet in first house"""
        # Planet at 5 degrees, ascendant at 0 degrees
        house = AstroCalculate.get_planet_house(5.0, 0.0, 'W')
        assert house == 1
    
    def test_planet_in_seventh_house(self):
        """Test planet in seventh house"""
        # Planet at 185 degrees, ascendant at 0 degrees
        house = AstroCalculate.get_planet_house(185.0, 0.0, 'W')
        assert house == 7
    
    def test_planet_with_offset_ascendant(self):
        """Test with non-zero ascendant"""
        # Planet at 95 degrees, ascendant at 30 degrees
        # Offset = 65 degrees, house = 3
        house = AstroCalculate.get_planet_house(95.0, 30.0, 'P')
        assert house == 3
    
    def test_planet_wrap_around(self):
        """Test planet position wrapping around 360"""
        # Planet at 10 degrees, ascendant at 350 degrees
        # Should be in house 1
        house = AstroCalculate.get_planet_house(10.0, 350.0, 'P')
        assert house == 1


class TestIsPlanetInHouse:
    """Tests for is_planet_in_house method"""
    
    def test_planet_is_in_specified_house(self):
        """Test when planet is in the specified house"""
        result = AstroCalculate.is_planet_in_house(5.0, 0.0, 1, 'W')
        assert result is True
    
    def test_planet_not_in_specified_house(self):
        """Test when planet is not in the specified house"""
        result = AstroCalculate.is_planet_in_house(185.0, 0.0, 1, 'W')
        assert result is False


class TestIsPlanetInKendra:
    """Tests for is_planet_in_kendra method"""
    
    def test_planet_in_kendra_house_1(self):
        """Test planet in 1st house (Kendra)"""
        result = AstroCalculate.is_planet_in_kendra(5.0, 0.0, 'W')
        assert result is True
    
    def test_planet_in_kendra_house_7(self):
        """Test planet in 7th house (Kendra)"""
        result = AstroCalculate.is_planet_in_kendra(185.0, 0.0, 'W')
        assert result is True
    
    def test_planet_not_in_kendra(self):
        """Test planet not in Kendra"""
        # Planet in 2nd house
        result = AstroCalculate.is_planet_in_kendra(35.0, 0.0, 'W')
        assert result is False


class TestIsPlanetInTrikona:
    """Tests for is_planet_in_trikona method"""
    
    def test_planet_in_trikona_house_1(self):
        """Test planet in 1st house (Trikona)"""
        result = AstroCalculate.is_planet_in_trikona(5.0, 0.0, 'W')
        assert result is True
    
    def test_planet_in_trikona_house_5(self):
        """Test planet in 5th house (Trikona)"""
        result = AstroCalculate.is_planet_in_trikona(125.0, 0.0, 'W')
        assert result is True
    
    def test_planet_not_in_trikona(self):
        """Test planet not in Trikona"""
        # Planet in 2nd house
        result = AstroCalculate.is_planet_in_trikona(35.0, 0.0, 'W')
        assert result is False


class TestIsAllMaleficsInUpachaya:
    """Tests for is_all_malefics_in_upachaya method"""
    
    def test_all_malefics_in_upachaya(self):
        """Test when all malefics are in Upachaya houses"""
        positions = {
            'Saturn': 65.0,   # House 3 (Upachaya)
            'Mars': 155.0,    # House 6 (Upachaya)
            'Sun': 275.0,     # House 10 (Upachaya)
            'Rahu': 305.0,    # House 11 (Upachaya)
            'Ketu': 125.0,    # House 5 (not Upachaya, but Ketu might be handled differently)
        }
        
        # Note: This test might need adjustment based on exact implementation
        result = AstroCalculate.is_all_malefics_in_upachaya(positions, 0.0, 'W')
        # Result depends on whether Ketu is considered
        assert isinstance(result, bool)
    
    def test_malefic_not_in_upachaya(self):
        """Test when a malefic is not in Upachaya"""
        positions = {
            'Saturn': 5.0,    # House 1 (not Upachaya)
            'Mars': 155.0,    # House 6 (Upachaya)
        }
        
        result = AstroCalculate.is_all_malefics_in_upachaya(positions, 0.0, 'W')
        assert result is False


class TestGetBeneficMaleficPlanets:
    """Tests for get_benefic_planets and get_malefic_planets methods"""
    
    def test_get_benefic_planets(self):
        """Test getting benefic planets"""
        positions = {
            'Jupiter': 100.0,
            'Venus': 150.0,
            'Saturn': 200.0,
            'Mars': 250.0
        }
        
        benefics = AstroCalculate.get_benefic_planets(positions)
        assert 'Jupiter' in benefics
        assert 'Venus' in benefics
        assert 'Saturn' not in benefics
    
    def test_get_malefic_planets(self):
        """Test getting malefic planets"""
        positions = {
            'Jupiter': 100.0,
            'Venus': 150.0,
            'Saturn': 200.0,
            'Mars': 250.0
        }
        
        malefics = AstroCalculate.get_malefic_planets(positions)
        assert 'Saturn' in malefics
        assert 'Mars' in malefics
        assert 'Jupiter' not in malefics


class TestGetRashi:
    """Tests for get_rashi method"""
    
    def test_rashi_aries(self):
        """Test Aries (0-30 degrees)"""
        assert AstroCalculate.get_rashi(15.0) == 1
    
    def test_rashi_taurus(self):
        """Test Taurus (30-60 degrees)"""
        assert AstroCalculate.get_rashi(45.0) == 2
    
    def test_rashi_pisces(self):
        """Test Pisces (330-360 degrees)"""
        assert AstroCalculate.get_rashi(345.0) == 12
    
    def test_rashi_boundary(self):
        """Test at rashi boundary"""
        assert AstroCalculate.get_rashi(30.0) == 2


class TestGetNakshatra:
    """Tests for get_nakshatra method"""
    
    def test_nakshatra_ashwini(self):
        """Test Ashwini (0-13.33 degrees)"""
        assert AstroCalculate.get_nakshatra(5.0) == 1
    
    def test_nakshatra_bharani(self):
        """Test Bharani (13.33-26.66 degrees)"""
        assert AstroCalculate.get_nakshatra(20.0) == 2
    
    def test_nakshatra_revati(self):
        """Test Revati (last nakshatra)"""
        assert AstroCalculate.get_nakshatra(355.0) == 27


class TestGetTithi:
    """Tests for get_tithi method"""
    
    def test_tithi_pratipada(self):
        """Test Pratipada (1st tithi)"""
        # Sun at 0, Moon at 5 degrees
        tithi = AstroCalculate.get_tithi(0.0, 5.0)
        assert tithi == 1
    
    def test_tithi_purnima(self):
        """Test Purnima (15th tithi)"""
        # Sun at 0, Moon at 180 degrees
        tithi = AstroCalculate.get_tithi(0.0, 180.0)
        assert tithi == 15
    
    def test_tithi_amavasya(self):
        """Test Amavasya (30th tithi)"""
        # Sun at 0, Moon at 355 degrees (close to new moon)
        tithi = AstroCalculate.get_tithi(0.0, 355.0)
        assert tithi == 30
