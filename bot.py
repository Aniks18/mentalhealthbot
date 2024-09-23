from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS

# Updated API URL and Key
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
API_KEY = "use your own gemini api key here"

headers = {
    "Content-Type": "application/json"
}

def chat_with_gemini(user_input):
    # Prepend a prompt to guide the AI towards mental health-related responses
    prompt = ("You are a research prototype designed to simulate a supportive conversation "
              "about mental health. You are not a real therapist or counselor. Always encourage "
              "seeking professional help for mental health concerns. Respond to: ")
    
    full_input = prompt + user_input

    payload = {
        "contents": [
            {
                "parts": [{"text": full_input}]
            }
        ]
    }

    # Append API key as a query parameter
    response = requests.post(f"{API_URL}?key={API_KEY}", headers=headers, json=payload)
    
    if response.status_code == 200:
        response_data = response.json()
        ai_response = response_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        
        # Append a disclaimer to every response
        disclaimer = ("\n\nRemember, I am an AI research prototype and not a real mental health "
                      )
        return ai_response + disclaimer
    else:
        return f"Error: {response.status_code}, {response.text}"

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("user_input")
    response = chat_with_gemini(user_input)
    return jsonify({"response": response})

if __name__ == "__main__":
    print("WARNING: This is a research prototype only.")
    app.run(port=5000)
