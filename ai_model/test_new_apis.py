import requests
import json

base_url = "http://127.0.0.1:8000/api/generate"

# Test Mode 1 (JD)
jd_data = {
    "role": "Backend Developer",
    "skills": "Node.js, SQL, REST APIs",
    "experience": "0-2 years",
    "difficulty": "Medium",
    "num_questions": 2
}

print("Testing JD endpoint...")
try:
    response = requests.post(f"{base_url}/jd", json=jd_data)
    response.raise_for_status()
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error testing JD API: {e}")
    if hasattr(e, 'response') and e.response: # type: ignore
        print(e.response.text) # type: ignore

print("\n-------------------------------\n")

# Test Mode 2 (Company)
company_data = {
    "company": "Amazon",
    "role": "Software Engineer",
    "difficulty": "Hard",
    "num_questions": 2
}

print("Testing Company endpoint...")
try:
    response = requests.post(f"{base_url}/company", json=company_data)
    response.raise_for_status()
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error testing Company API: {e}")
    if hasattr(e, 'response') and e.response: # type: ignore
        print(e.response.text) # type: ignore
