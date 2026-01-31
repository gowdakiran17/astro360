import sys
import os
import requests
import json

# Add the project root to the python path
sys.path.append(os.getcwd())

def inspect_vedastro_payload():
    print("Inspecting VedAstro API Payload for Suggestions...")
    
    # Use WebAPI as discovered
    BASE_URL = "https://webapi.vedastro.org/api"
    
    # Test Data
    user_id = "test_user_inspector"
    # Format: HH:mm DD/MM/YYYY +HH:mm
    formatted_time = "10:30 15/05/1990 +05:30" 
    location = "Bangalore, India"
    
    # 1. Submit Birth Data
    url = f"{BASE_URL}/BirthDataSubmission"
    payload = {
        "SessionId": "",
        "UserId": user_id,
        "ChatType": "Horoscope",
        "UserQuestion": "",
        "BirthTime": {
            "StdTime": formatted_time,
            "Location": {
                "Name": location,
                "Longitude": 77.5946,
                "Latitude": 12.9716
            }
        }
    }
    
    try:
        print(f"Submitting to {url}...")
        response = requests.post(url, json=payload, timeout=30)
        data = response.json()
        
        if data.get("Status") == "Pass":
            initial_payload = data.get("Payload", {})
            session_id = initial_payload.get("SessionId")
            print(f"\n[Initial Response Payload Keys]: {list(initial_payload.keys())}")
            # Check for hidden fields in initial response
            if "RelatedQuestions" in initial_payload:
                 print(f"Found RelatedQuestions: {initial_payload['RelatedQuestions']}")
            
            # 2. Ask a Question that usually triggers suggestions (e.g. Career)
            chat_url = f"{BASE_URL}/AIChat"
            chat_payload = {
                "UserQuestion": "Tell me about my career",
                "ChatType": "Horoscope",
                "UserId": user_id,
                "SessionId": session_id
            }
            
            print(f"\n[Asking Question]...")
            chat_response = requests.post(chat_url, json=chat_payload, timeout=30)
            chat_data = chat_response.json()
            
            if chat_data.get("Status") == "Pass":
                full_payload = chat_data.get("Payload", {})
                print(f"\n[Chat Response Payload Keys]: {list(full_payload.keys())}")
                print(json.dumps(full_payload, indent=2))
            else:
                print("Chat request failed.")
                
        else:
            print("Initialization failed.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_vedastro_payload()
