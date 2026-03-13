import requests
import json

url = "http://127.0.0.1:8000/api/generate-questions"
data = {
    "topic": "Arrays",
    "difficulty": "Easy",
    "job_description": "Backend developer",
    "num_questions": 2
}

try:
    response = requests.post(url, json=data)
    response.raise_for_status()
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'response') and e.response: # type: ignore
        print(e.response.text) # type: ignore
