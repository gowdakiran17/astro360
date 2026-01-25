# How to Update APIs for Production

I have refactored the backend to support Production APIs while keeping the "free/dev" versions as fallbacks. 

## 1. Configure Your Keys
1.  Open the file `astro360/.env.example`.
2.  Copy it to a new file named `.env` (if you haven't already, or add these lines to your existing `.env`).
3.  Fill in the keys for the services you want to enable.

```bash
# Example .env content
ALPHA_VANTAGE_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
OPENAI_API_KEY=sk-proj-your_key_here
```

## 2. Updated Codebase Locations
I have modified the code to automatically check for these keys. If they exist, the app uses the Pro API. If not, it falls back to the Free/Dev version.

### A. Market Data (Stock/Crypto Prices)
*   **File**: [live_data.py](file:///Users/kirangowda/Documents/astro360/astro_app/backend/services/live_data.py)
*   **Change**: Added `_fetch_alpha_vantage` method.
*   **Logic**: 
    *   If `ALPHA_VANTAGE_API_KEY` is set → Calls Alpha Vantage API.
    *   If not → Calls `yfinance` (Yahoo Finance wrapper).

### B. Geolocation (City Search)
*   **File**: [service.py](file:///Users/kirangowda/Documents/astro360/astro_app/backend/geo/service.py)
*   **Change**: Added `_search_google_maps` method.
*   **Logic**:
    *   If `GOOGLE_MAPS_API_KEY` is set → Calls Google Maps Geocoding API.
    *   If not → Calls `Nominatim` (OpenStreetMap).

### C. AI Insights
*   **File**: [ai_insight.py](file:///Users/kirangowda/Documents/astro360/astro_app/backend/routers/ai_insight.py)
*   **Logic**:
    *   If `OPENAI_API_KEY` is set → Calls OpenAI (GPT-3.5/4).
    *   If `GEMINI_API_KEY` is set → Calls Google Gemini.
    *   If neither → Returns "Mock AI Report".

## 3. Verify It Works
1.  **Restart the backend** to load the new `.env` variables.
    ```bash
    # Stop the current server (Ctrl+C)
    # Start it again
    python3 -m uvicorn astro_app.backend.main:app --reload
    ```
2.  **Test Market Data**:
    *   If you added an Alpha Vantage key, search for a Stock symbol. Check the logs: `logger.info("Fetching ... via Alpha Vantage")`.
3.  **Test Geolocation**:
    *   If you added a Google Maps key, search for a city.

## 4. Get API Keys
*   **Alpha Vantage**: [Get Free Key](https://www.alphavantage.co/support/#api-key)
*   **Google Maps**: [Console](https://console.cloud.google.com/google/maps-apis/overview) (Requires Billing Account)
*   **OpenAI**: [Platform](https://platform.openai.com/)
