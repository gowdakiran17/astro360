import unittest
from unittest.mock import patch


class TestGannPersonalization(unittest.IsolatedAsyncioTestCase):
    async def test_personal_overlay_varies_by_profile(self):
        from astro_app.backend.astrology import gann_engine

        current_planets = [
            {"name": "Moon", "longitude": 120.0},
            {"name": "Jupiter", "longitude": 30.0},
            {"name": "Saturn", "longitude": 210.0},
            {"name": "Mars", "longitude": 10.0},
        ]

        with (
            patch.object(gann_engine, "calculate_transits", return_value=[{"name": "Moon", "longitude": 0.0}]),
            patch.object(gann_engine, "calculate_vimshottari_dasha", return_value={"summary": {"current_mahadasha": "Jupiter", "current_antardasha": "Venus"}}),
            patch.object(gann_engine, "calculate_chart", return_value={"planets": [], "houses": {}, "ascendant": {}}),
            patch.object(gann_engine, "analyze_wealth_profile", return_value={"persona": {"type": "Balanced"}, "scores": {"crypto": 80, "stocks": 55}, "traits": {"risk_appetite": 70}}),
            patch.object(gann_engine, "calculate_chandrashtama", return_value=False),
            patch.object(gann_engine, "calculate_tarabala", return_value=0.9),
            patch.object(gann_engine, "calculate_gochar_score", return_value=1.0),
            patch.object(gann_engine, "calculate_vedha", return_value=False),
        ):
            good = await gann_engine.analyze_personal_overlay(
                birth_date="01/01/1990",
                birth_time="12:00",
                birth_timezone="+05:30",
                birth_lat=12.9,
                birth_lon=77.5,
                market_trend="Bullish",
                current_planets=current_planets,
                market_type="Crypto",
                asset="Bitcoin",
            )

        with (
            patch.object(gann_engine, "calculate_transits", return_value=[{"name": "Moon", "longitude": 0.0}]),
            patch.object(gann_engine, "calculate_vimshottari_dasha", return_value={"summary": {"current_mahadasha": "Saturn", "current_antardasha": "Rahu"}}),
            patch.object(gann_engine, "calculate_chart", return_value={"planets": [], "houses": {}, "ascendant": {}}),
            patch.object(gann_engine, "analyze_wealth_profile", return_value={"persona": {"type": "Conservative"}, "scores": {"crypto": 30, "stocks": 45}, "traits": {"risk_appetite": 20}}),
            patch.object(gann_engine, "calculate_chandrashtama", return_value=True),
            patch.object(gann_engine, "calculate_tarabala", return_value=0.2),
            patch.object(gann_engine, "calculate_gochar_score", return_value=0.2),
            patch.object(gann_engine, "calculate_vedha", return_value=True),
        ):
            bad = await gann_engine.analyze_personal_overlay(
                birth_date="01/01/1990",
                birth_time="12:00",
                birth_timezone="+05:30",
                birth_lat=12.9,
                birth_lon=77.5,
                market_trend="Bullish",
                current_planets=current_planets,
                market_type="Crypto",
                asset="Bitcoin",
            )

        self.assertEqual(good["status"], "success")
        self.assertEqual(bad["status"], "success")
        self.assertGreater(good["score"], 0)
        self.assertLess(bad["score"], 0)
        self.assertNotEqual(good["strategy"], bad["strategy"])
        self.assertIn("profile", good)

    def test_market_signal_derivation(self):
        from astro_app.backend.astrology.gann_engine import derive_market_signal_for_date

        windows = [
            {"action": "Buy", "start": "2026-01-10", "end": "2026-01-12"},
            {"action": "Avoid", "start": "2026-01-15", "end": "2026-01-17"},
        ]
        self.assertEqual(derive_market_signal_for_date("2026-01-11", windows)["signal"], "Buy")
        self.assertEqual(derive_market_signal_for_date("2026-01-16", windows)["signal"], "Avoid")
        self.assertEqual(derive_market_signal_for_date("2026-01-20", windows)["signal"], "Hold")

    def test_backtest_runs_without_network_when_price_data_provided(self):
        import pandas as pd
        from astro_app.backend.astrology import gann_engine

        idx = pd.date_range("2026-01-01", periods=20, freq="D")
        df = pd.DataFrame({"Close": list(range(100, 120))}, index=idx)

        fake_events = [
            {"date": "2026-01-05", "type": "Breakout"},
            {"date": "2026-01-12", "type": "Crash Risk"},
        ]

        with patch.object(gann_engine, "_scan_turning_points_in_range", return_value=fake_events):
            res = gann_engine.backtest_gann_time_windows(
                ticker="TEST",
                market_type="Crypto",
                lookback_days=60,
                horizon_days=3,
                end_date="2026-01-20",
                price_data=df,
            )

        self.assertEqual(res["status"], "success")
        self.assertIn("overall_win_rate", res)


if __name__ == "__main__":
    unittest.main()

