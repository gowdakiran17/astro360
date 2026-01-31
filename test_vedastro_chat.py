import sys
import os
import logging

# Add the project root to the python path
sys.path.append(os.getcwd())

from astro_app.backend.services.vedastro_client import VedAstroClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_vedastro_flow():
    print("Testing VedAstro API Flow...")
    
    # Test Data
    user_id = "test_user_123"
    name = "Kiran Test"
    # Format: HH:mm DD/MM/YYYY +HH:mm
    formatted_time = "10:30 15/05/1990 +05:30" 
    location = "Bangalore, India"
    lon = 77.5946
    lat = 12.9716
    
    try:
        # Step 1: Submit Birth Data (Handshake)
        print(f"\n1. Submitting Birth Data to {VedAstroClient.BASE_URL}...")
        init_result = VedAstroClient.submit_birth_data(
            user_id=user_id,
            name=name,
            formatted_time=formatted_time,
            location=location,
            longitude=lon,
            latitude=lat,
            chat_type="Horoscope"
        )
        
        print(f"Init Result Status: {init_result.get('Status')}")
        if init_result.get('Status') != "Pass":
            print(f"Init Failed: {init_result}")
            return

        payload = init_result.get("Payload", {})
        session_id = payload.get("SessionId")
        print(f"Session ID: {session_id}")
        print(f"Initial Response: {payload.get('Text')}")
        
        # Step 2: Ask a Question
        print(f"\n2. Asking Question using Session ID: {session_id}")
        question = "What does my chart say about my career?"
        
        chat_result = VedAstroClient.ask_ai_chat(
            user_id=user_id,
            question=question,
            chat_type="Horoscope",
            session_id=session_id
        )
        
        print(f"Chat Result Status: {chat_result.get('Status')}")
        chat_payload = chat_result.get("Payload", {})
        
        if isinstance(chat_payload, str):
             print(f"Chat Response: {chat_payload}")
        else:
            print(f"Chat Response Text: {chat_payload.get('Text')}")
            print(f"Chat Response HTML length: {len(chat_payload.get('Html', '') or chat_payload.get('TextHtml', '') or '')}")

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_vedastro_flow()
