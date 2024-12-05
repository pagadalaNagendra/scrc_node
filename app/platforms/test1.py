import requests

response = requests.get('http://localhost:8000/simulations/')
if response.status_code == 200:
 print(response.json())
 print(len(response.json()))
else:
 print(f"Error: {response.status_code}")