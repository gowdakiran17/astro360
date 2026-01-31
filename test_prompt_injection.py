import sys
import os
import requests
import json
from datetime import datetime

# Adjust path to import backend modules if needed, but for now we'll just hit the external API directly to test the prompt theory
# This mirrors what VedAstroClient does

BASE_URL = "https://webapi.vedastro.org/api"

def submit_birth_data():
    url = f"{BASE_URL}/BirthDataSubmission"
    payload = {
        "SessionId": "",
        "UserId": "test_debugger",
        "ChatType": "Horoscope",
        "UserQuestion": "",
        "BirthTime": {
            "StdTime": "10:30 15/06/1990 +05:30",
            "Location": {
                "Name": "Bangalore",
                "Longitude": 77.5946,
                "Latitude": 12.9716
            }
        }
    }
    try:
        print("Submitting birth data...")
        response = requests.post(url, json=payload, timeout=20)
        response.raise_for_status()
        data = response.json()
        if data.get("Status") == "Pass":
            return data["Payload"]["SessionId"]
        else:
            print(f"Failed to init session: {data}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def ask_ai(session_id, question):
    url = f"{BASE_URL}/AIChat"
    payload = {
        "UserQuestion": question,
        "ChatType": "Horoscope",
        "UserId": "test_debugger",
        "SessionId": session_id
    }
    try:
        print(f"Asking AI: {question[:50]}...")
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error asking AI: {e}")
        return None

if __name__ == "__main__":
    sid = submit_birth_data()
    if sid:
        print(f"Session ID: {sid}")
        
        # Test Query
        user_q = "In March my salary hike is there hike will have good or bad"
        
        # 1. Normal Query (Baseline)
        # print("\n--- BASELINE QUERY ---")
        # res1 = ask_ai(sid, user_q)
        # print(res1.get("Payload", {}).get("Text", "No Text"))
        
        # 2. Injected Query
        print("\n--- INJECTED QUERY ---")
        
        system_prompt = (
            "You are a senior expert Vedic Astrologer. "
            "Your prediction style must be: "
            "1. HIGHLY PREDICTIVE and SPECIFIC. Give exact percentages (e.g., '20-30%') and dates (e.g., 'March 15th'). "
            "2. DO NOT use generic phrases like 'mixed influence' or 'may happen'. Be decisive. "
            "3. Use HTML colors: <span style='color:green'><b>Good Result</b></span> and <span style='color:red'><b>Bad Result</b></span>. "
            "4. Start with a direct 'Yes' or 'No' if applicable. "
            "\n\nUser Question: "
        )
        
        full_query = system_prompt + user_q
        
        res2 = ask_ai(sid, full_query)
        payload = res2.get("Payload", {})
        if isinstance(payload, dict):
            print(payload.get("Text", "No Text"))
            print("\n--- HTML ---")
            print(payload.get("TextHtml", "No HTML"))
        else:
            print(payload)
