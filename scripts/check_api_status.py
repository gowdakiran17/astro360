import os
import sys
import asyncio
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / "astro_app" / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

# ANSI Colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def print_status(service, status, details=""):
    color = GREEN if status == "ACTIVE" else (YELLOW if status == "MISSING" else RED)
    print(f"{service:<20} {color}{status:<10}{RESET} {details}")

async def check_gemini():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        return "MISSING", "Key not found in .env"
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=key)
        model = genai.GenerativeModel('models/gemini-flash-latest')
        # Simple generation
        response = await model.generate_content_async("Say 'OK'")
        if response.text:
            return "ACTIVE", "Generation successful"
        return "ERROR", "Empty response"
    except Exception as e:
        return "ERROR", str(e)

async def check_openai():
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return "MISSING", "Key not found in .env"
    
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=key)
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Say 'OK'"}],
            max_tokens=5
        )
        return "ACTIVE", "Generation successful"
    except Exception as e:
        return "ERROR", str(e)

def check_alpha_vantage():
    key = os.getenv("ALPHA_VANTAGE_API_KEY")
    if not key:
        return "MISSING", "Key not found in .env"
    
    try:
        import requests
        # Check IBM (stable symbol)
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey={key}"
        response = requests.get(url)
        data = response.json()
        
        if "Global Quote" in data:
            return "ACTIVE", "Data fetch successful"
        elif "Note" in data:
            return "LIMITED", "API Limit reached"
        elif "Error Message" in data:
             return "ERROR", "Invalid API Key"
        else:
            return "ERROR", f"Unknown response: {str(data)[:50]}..."
    except Exception as e:
        return "ERROR", str(e)

def check_google_maps():
    key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not key:
        return "MISSING", "Key not found in .env"
    
    try:
        import requests
        # Geocode "New York"
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address=New+York&key={key}"
        response = requests.get(url)
        data = response.json()
        
        if data["status"] == "OK":
            return "ACTIVE", "Geocoding successful"
        else:
            return "ERROR", f"Status: {data['status']} - {data.get('error_message', '')}"
    except Exception as e:
        return "ERROR", str(e)

async def main():
    print("\n" + "="*50)
    print("   ASTRO360 API HEALTH CHECK")
    print("="*50 + "\n")
    
    # 1. Gemini
    status, msg = await check_gemini()
    print_status("Gemini AI", status, msg)
    
    # 2. OpenAI
    status, msg = await check_openai()
    print_status("OpenAI", status, msg)
    
    # 3. Alpha Vantage
    status, msg = check_alpha_vantage()
    print_status("Alpha Vantage", status, msg)
    
    # 4. Google Maps
    status, msg = check_google_maps()
    print_status("Google Maps", status, msg)
    
    print("\n" + "="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
