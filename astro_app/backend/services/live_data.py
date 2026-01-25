try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except (ImportError, TypeError):
    # TypeError can occur on Python 3.9 due to ' | ' type syntax in yfinance
    yf = None
    YFINANCE_AVAILABLE = False
    print("Warning: yfinance could not be imported. Live market data disabled.")
import requests
import os
import logging
import time
from typing import Dict, Optional, Tuple
from datetime import datetime
from functools import wraps

# Setup Logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)

def retry_on_failure(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logger.warning(f"Attempt {attempt + 1}/{max_retries} failed for {func.__name__}: {e}")
                    time.sleep(delay * (attempt + 1))  # Exponential backoff
            logger.error(f"All {max_retries} attempts failed for {func.__name__}. Last error: {last_exception}")
            raise last_exception
        return wrapper
    return decorator

class LiveDataService:
    """
    Service to fetch real-time market data.
    Priority:
    1. Alpha Vantage / CoinGecko (if API Keys present)
    2. Yahoo Finance (yfinance) - Fallback
    """

    def __init__(self):
        self.tickers = {}
        self.alpha_vantage_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        self.coingecko_key = os.getenv("COINGECKO_API_KEY")

    def get_market_data(self, symbol: str, asset_type: str = "Crypto") -> Dict:
        """
        Fetches real-time data. Tries Official APIs first, then falls back to yfinance.
        """
        # 1. Try Alpha Vantage for Stocks
        if self.alpha_vantage_key and asset_type == "Stock":
            try:
                return self._fetch_alpha_vantage(symbol)
            except Exception as e:
                logger.error(f"Alpha Vantage failed for {symbol}: {e}. Falling back to yfinance.")

        # 2. Try CoinGecko for Crypto
        # (CoinGecko free tier doesn't strictly need a key, but pro does)
        if asset_type == "Crypto":
             # Implementation skipped for brevity, falling back to yfinance for now
             pass

        # 3. Fallback to yfinance
        return self._fetch_yfinance(symbol, asset_type)

    def _fetch_alpha_vantage(self, symbol: str) -> Dict:
        """
        Fetch from Alpha Vantage API.
        """
        # Map symbol if needed
        av_symbol = symbol
        if symbol == "S&P 500": av_symbol = "SPY" # AV doesn't support ^GSPC on free tier often

        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={av_symbol}&apikey={self.alpha_vantage_key}"
        response = requests.get(url)
        data = response.json()
        
        if "Global Quote" not in data:
            raise ValueError(f"Invalid AV response: {data}")
            
        quote = data["Global Quote"]
        price = float(quote["05. price"])
        change_percent = float(quote["10. change percent"].strip('%'))
        
        return {
                "price": price,
                "change_percent": change_percent,
                "trend": self._calculate_trend(change_percent),
                "volatility": 50 # Default or calc separately
            }

    @retry_on_failure(max_retries=3, delay=1)
    def _fetch_yfinance(self, symbol: str, asset_type: str) -> Dict:
        """
        Fetches real-time data from Yahoo Finance (Legacy/Fallback).
        """
        start_time = time.time()
        logger.info(f"Fetching live data for {symbol} ({asset_type}) via yfinance")
        
        if not YFINANCE_AVAILABLE:
            raise ImportError("yfinance module is not available")
        
        # Map common names to Yahoo Finance Tickers
        ticker_map = {
            "Bitcoin": "BTC-USD",
            "Ethereum": "ETH-USD",
            "S&P 500": "^GSPC",
            "Nasdaq": "^IXIC",
            "Gold": "GC=F",
            "Silver": "SI=F",
            "Apple": "AAPL",
            "Tesla": "TSLA"
        }
        
        yf_symbol = ticker_map.get(symbol, symbol)
        
        try:
            ticker = yf.Ticker(yf_symbol)
            
            # Use history for most reliable price data
            hist = ticker.history(period="5d")
            
            if hist.empty:
                logger.warning(f"No historical data returned for {yf_symbol}")
                raise ValueError(f"No historical data found for {yf_symbol}")
                
            current_price = hist['Close'].iloc[-1]
            prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            
            change_percent = ((current_price - prev_close) / prev_close) * 100
            
            # Volatility (Std Dev of last 5 days)
            volatility = hist['Close'].pct_change().std() * 100
            # Normalize Volatility (0-100 scale approximation)
            volatility_score = min(max(volatility * 10, 10), 90)
            
            duration = time.time() - start_time
            logger.info(f"Successfully fetched data for {symbol} in {duration:.2f}s. Price: {current_price}")
            
            return {
                "price": round(current_price, 2),
                "change_percent": round(change_percent, 2),
                "trend": self._calculate_trend(change_percent),
                "volatility": round(volatility_score, 1)
            }
            
        except Exception as e:
            logger.error(f"Failed to get ticker '{yf_symbol}' reason: {e}")
            raise e

    def _calculate_trend(self, change_percent: float) -> str:
        if change_percent > 1.5: return "Strong Bullish"
        if change_percent > 0.5: return "Bullish"
        if change_percent < -1.5: return "Strong Bearish"
        if change_percent < -0.5: return "Bearish"
        return "Neutral"

    def get_market_volatility(self) -> float:
        """
        Fetches VIX (Volatility Index) to gauge overall market fear.
        """
        try:
            vix = yf.Ticker("^VIX")
            price = vix.fast_info.last_price
            # Normalize VIX (usually 10-30, spikes to 80) to 0-100 scale
            # 10 -> 0, 30 -> 50, 60+ -> 100
            score = (price - 10) * 2.5
            return max(0, min(100, score))
        except Exception:
            return 40.0 # Default moderate volatility
