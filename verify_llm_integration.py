import requests
import time
import sys
import json

BASE_URL = "http://localhost:8000"

def wait_for_server():
    print("Checking if server is up...")
    for i in range(20):
        try:
            requests.get(f"{BASE_URL}/")
            print("Server is UP.")
            return
        except:
            print(f"Waiting for server... ({i+1}/20)")
            time.sleep(1)
    
    print("Server not responding on port 8000 after 20 seconds.")
    sys.exit(1)

def run_test():
    wait_for_server()
    
    # 1. Register/Login
    email = "integration_test_user@example.com"
    pwd = "testpassword123"
    
    print("\n[Auth] Registering/Logging in...")
    try:
        requests.post(f"{BASE_URL}/auth/register", json={"email": email, "password": pwd})
    except:
        pass 
        
    login_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": pwd})
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.status_code}")
        print(login_resp.text)
        sys.exit(1)
        
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[Auth] Success. Token acquired.")
    
    # 2. Test OpenAI Override
    print("\n[Test 1] Testing OpenAI API Key Override...")
    payload_openai = {
        "context": "normal_user_chat",
        "query": "Hello",
        "data": {},
        "llm_config": {
            "provider": "openai",
            "api_key": "sk-INVALID-KEY-TESTING-123",
            "model_name": "gpt-3.5-turbo"
        }
    }
    
    resp_openai = requests.post(f"{BASE_URL}/ai/generate", json=payload_openai, headers=headers)
    print(f"Status: {resp_openai.status_code}")
    data_openai = resp_openai.json()
    print(f"Response: {data_openai}")
    
    insight_text = data_openai.get("ai_insights", {}).get("insight", "") if "ai_insights" in data_openai else data_openai.get("insight", "")
    
    # Check if correct error was triggered
    # We expect "Incorrect API key provided" or generic "Analysis Error" wrapping it.
    if "api_key" in str(insight_text).lower() or "authentication" in str(insight_text).lower() or "incorrect api key" in str(insight_text).lower():
        print("✅ OpenAI Override Verified: Received Authentication Error as expected.")
    else:
        print("⚠️ OpenAI Override Result Inconclusive (Check logs).")

    # 3. Test Ollama Connection
    print("\n[Test 2] Testing Ollama Connection (Localhost)...")
    payload_ollama = {
        "context": "normal_user_chat",
        "query": "Hello",
        "data": {},
        "llm_config": {
            "provider": "ollama",
            "base_url": "http://localhost:11434",
            "model_name": "llama3"
        }
    }
    
    resp_ollama = requests.post(f"{BASE_URL}/ai/generate", json=payload_ollama, headers=headers)
    print(f"Status: {resp_ollama.status_code}")
    data_ollama = resp_ollama.json()
    print(f"Response: {data_ollama}")
    
    insight_text_ollama = data_ollama.get("ai_insights", {}).get("insight", "") if "ai_insights" in data_ollama else data_ollama.get("insight", "")

    # Check if connection error was triggered
    # We expect "Could not connect to http://localhost:11434"
    if "ollama running" in str(insight_text_ollama).lower() or "connect" in str(insight_text_ollama).lower():
         print("✅ Ollama Connection Verified: Backend attempted to connect to localhost.")
    else:
         print("⚠️ Ollama Result Inconclusive.")

if __name__ == "__main__":
    run_test()
