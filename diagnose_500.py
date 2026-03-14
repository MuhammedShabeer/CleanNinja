import requests
import json

def test_endpoint(url, method="GET", payload=None):
    headers = {"Content-Type": "application/json"}
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        else:
            response = requests.post(url, data=json.dumps(payload), headers=headers)
        print(f"URL: {url}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error for {url}: {e}")

print("--- Testing Gallery ---")
test_endpoint("http://localhost:5021/api/gallery")

print("\n--- Testing Content ---")
test_endpoint("http://localhost:5021/api/content")

print("\n--- Testing Login ---")
test_endpoint("http://localhost:5021/api/auth/login", method="POST", payload={"email": "test@cleanninja.uk", "password": "admin123"})
