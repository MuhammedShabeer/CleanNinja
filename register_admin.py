import requests
import json

url = "http://localhost:5021/api/auth/register"
payload = {
    "name": "Admin Test",
    "email": "test@cleanninja.uk",
    "password": "admin123"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
