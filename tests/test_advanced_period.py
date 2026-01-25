import unittest
from datetime import datetime
from astro_app.backend.astrology.advanced_period import calculate_vedha, get_tithi_quality, get_rashi, get_karana, calculate_muhurtas

class TestVedicDeepLogic(unittest.TestCase):

    def test_karana_logic(self):
        # 1 Karana = 6 degrees.
        # Difference 0-6 deg = Kimstughna (1)
        self.assertEqual(get_karana(0, 3), "Kimstughna")
        
        # Difference 6-12 deg = Bava (2)
        self.assertEqual(get_karana(0, 9), "Bava")
        
        # Difference 12-18 deg = Balava (3)
        self.assertEqual(get_karana(0, 15), "Balava")
        
        # Check Vishti (Bhadra) - It's the 7th movable one.
        # Movable cycle: Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti
        # Indices: 2, 3, 4, 5, 6, 7, 8
        # Index 7 (36-42 deg) is Vanija.
        # Index 8 (42-48 deg) is Vishti.
        self.assertEqual(get_karana(0, 45), "Vishti (Bhadra)")
        
        # Check Shakuni (58) -> 57 * 6 = 342 deg
        # 342-348 deg
        self.assertEqual(get_karana(0, 345), "Shakuni")

    def test_muhurtas_logic(self):
        # Mock Sunrise/Sunset
        rise = datetime(2023, 1, 1, 6, 0) # Sunday
        set = datetime(2023, 1, 1, 18, 0)
        
        # Sunday (6)
        # Rahu Kaal is 8th part: 16:30 - 18:00
        # Yamaganda is 5th part: 12:00 - 13:30
        
        muhurtas = calculate_muhurtas(rise, rise, set)
        
        self.assertEqual(muhurtas['rahu_kaal'], "16:30 - 18:00")
        self.assertEqual(muhurtas['yamaganda'], "12:00 - 13:30")

    def test_vedha_sun_blocking_exception(self):
        """
        Test Vedha Exception: Sun in 3rd (Gemini) IS NOT blocked by Saturn in 9th (Sagittarius) 
        because they are Father-Son.
        """
        birth_moon_lon = 15.0 # Aries
        current_planets = {
            "Sun": 75.0,     # 3rd House
            "Saturn": 255.0, # 9th House (Vedha for 3rd)
            "Moon": 45.0,
            "Mars": 0.0,
            "Mercury": 0.0,
            "Jupiter": 0.0,
            "Venus": 0.0,
            "Rahu": 0.0,
            "Ketu": 0.0
        }
        
        is_obstructed = calculate_vedha("Sun", current_planets["Sun"], birth_moon_lon, current_planets)
        self.assertFalse(is_obstructed, "Sun-Saturn exception should prevent Vedha")

    def test_vedha_sun_blocking_real(self):
        """
        Test Real Vedha: Sun in 3rd (Gemini) IS blocked by Mars in 9th (Sagittarius).
        """
        birth_moon_lon = 15.0 # Aries
        current_planets = {
            "Sun": 75.0,     # 3rd House
            "Mars": 255.0,   # 9th House (Vedha for 3rd)
            "Saturn": 0.0,
            "Moon": 45.0,
            "Mercury": 0.0,
            "Jupiter": 0.0,
            "Venus": 0.0,
            "Rahu": 0.0,
            "Ketu": 0.0
        }
        
        is_obstructed = calculate_vedha("Sun", current_planets["Sun"], birth_moon_lon, current_planets)
        self.assertTrue(is_obstructed, "Sun in 3rd should be blocked by Mars in 9th")


    def test_vedha_exception_sun_saturn(self):
        """
        Test Exception: Sun and Saturn are father/son, so they might have special rules, 
        but strictly in Gochar Vedha, they DO cause Vedha unless specified.
        My code has an exception: Father-Son do not cause Vedha. Let's verify that.
        """
        # Sun in 3rd (Gemini), Saturn in 9th (Sagittarius).
        # My code currently says: if (planet == Sun and other == Saturn) continue.
        # So it should return False (No Obstruction) if I implemented that exception.
        
        birth_moon_lon = 15.0 # Aries
        current_planets = {
            "Sun": 75.0,
            "Saturn": 255.0
        }
        
        is_obstructed = calculate_vedha("Sun", current_planets["Sun"], birth_moon_lon, current_planets)
        # Based on my code implementation:
        # if (planet_name == "Sun" and other_p == "Saturn") ... continue
        # So it should be False.
        self.assertFalse(is_obstructed, "Sun-Saturn exception should prevent Vedha")

    def test_vedha_jupiter(self):
        """
        Test Jupiter Vedha: Jupiter in 2nd (Taurus) blocked by Planet in 12th (Pisces).
        """
        birth_moon_lon = 15.0 # Aries
        # Jupiter in 2nd (Taurus ~ 45 deg) -> Good
        # Vedha for Jup in 2 is 12.
        # Planet in 12th (Pisces ~ 345 deg) -> Blocks.
        
        current_planets = {
            "Jupiter": 45.0,
            "Mars": 345.0, # Mars in 12th
            "Sun": 0.0
        }
        
        is_obstructed = calculate_vedha("Jupiter", current_planets["Jupiter"], birth_moon_lon, current_planets)
        self.assertTrue(is_obstructed, "Jupiter in 2nd should be blocked by Mars in 12th")

    def test_tithi_quality(self):
        # Rikta Tithis: 4, 9, 14
        self.assertEqual(get_tithi_quality(4), "Bad")
        self.assertEqual(get_tithi_quality(9), "Bad")
        self.assertEqual(get_tithi_quality(14), "Bad")
        
        # Purna Tithis: 5, 10, 15
        self.assertEqual(get_tithi_quality(5), "Excellent")
        self.assertEqual(get_tithi_quality(15), "Excellent")
        
        # Nanda: 1, 6, 11
        self.assertEqual(get_tithi_quality(1), "Good")

if __name__ == '__main__':
    unittest.main()
