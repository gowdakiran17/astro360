# Production Readiness Guide

This application is currently in a **Development/MVP** state. To launch it live as a production-ready application, several components need to be transitioned from "Mock/Dev" modes to "Production" modes.

## 1. Required APIs & Services

### A. Market Data (Critical for "Live Trading")
Currently, the app uses `yfinance` (unofficial Yahoo Finance wrapper) and a Simulation Engine.
*   **Current Issue**: `yfinance` is unreliable for production, rate-limited, and not meant for commercial use. The "Performance Engine" generates random win/loss outcomes for demo purposes.
*   **Production Solution**: Subscribe to a real-time market data provider.
    *   **Crypto**: CoinGecko API (Free/Paid) or Binance API.
    *   **Stocks**: Alpha Vantage (Free Tier available), IEX Cloud, or Polygon.io.
*   **Action**: Replace `astro_app/backend/services/live_data.py` logic with calls to these paid APIs.

### B. Geolocation
Currently, the app uses `Nominatim` (OpenStreetMap) via `geopy`.
*   **Current Issue**: Free but strict rate limits (1 request/second). May fail under load.
*   **Production Solution**: Google Maps Platform (Geocoding API + Timezone API) or Mapbox.
*   **Action**: Update `astro_app/backend/geo/service.py` to use a robust provider.

### C. AI Insights
Currently, the app attempts to use OpenAI/Gemini but falls back to "Mock AI Report" if keys are missing.
*   **Production Solution**: Purchase API credits.
*   **Action**: Set `OPENAI_API_KEY` or `GEMINI_API_KEY` in your environment variables.

### D. Astrology Engine
*   **Status**: ✅ **Production Ready**.
*   The app uses `pyswisseph` (Swiss Ephemeris), which is the industry standard for high-precision astrological calculations. No external API is needed for this; it runs locally on your server.

## 2. Mock Data Removal Checklist

The following files contain simulation logic that should be reviewed before launch:

1.  **`astro_app/backend/astrology/performance_engine.py`**
    *   *Logic*: `simulate_outcomes` and `generate_mock_history`.
    *   *Fix*: Connect this to a real paper-trading API or remove the feature if you cannot verify outcomes in real-time.

2.  **`astro_app/backend/routers/ai_insight.py`**
    *   *Logic*: Fallback dictionary when API calls fail.
    *   *Fix*: Ensure error handling notifies the user instead of showing fake insights (unless "Demo Mode" is desired).

3.  **`astro_app/backend/services/live_data.py`**
    *   *Logic*: Fallback prices (BTC=$50000) when connection fails.
    *   *Fix*: Implement proper error states in the UI ("Data Unavailable") instead of showing static numbers.

## 3. Infrastructure

*   **Database**: Currently likely using SQLite. Migrate to **PostgreSQL** for production concurrency.
*   **Server**: Use a production WSGI/ASGI server (Gunicorn + Uvicorn) behind Nginx, not just `uvicorn --reload`.
*   **HTTPS**: Mandatory for secure user data.

## 4. Next Steps for Launch
1.  [ ] Register for **Alpha Vantage** (Stocks) and **CoinGecko** (Crypto) APIs.
2.  [ ] Set up a **PostgreSQL** database.
3.  [ ] Obtain an **OpenAI API Key** for the "Cosmic AI" features.
4.  [ ] Deploy to a cloud provider (AWS, DigitalOcean, Heroku).
