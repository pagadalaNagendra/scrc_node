import requests
import os
from fastapi import FastAPI

app = FastAPI()

class CCSPClient:
    def __init__(self, base_url, origin, ri, rvi, cert_name, key_name):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json;ty=3',
            'X-M2M-Origin': origin,
            'X-M2M-RI': ri,
            'X-M2M-RVI': rvi,
            'Accept': 'application/json'
        }
        self.cert_path = cert_name
        self.key_path = key_name

    def create_node(self, node):
        url = f"{self.base_url}/SOTIiithWQ1"
        payload_json = {
            "m2m:cnt": {
                "lbl": [f"{node}"],
                "rn": f"{node}",
                "acpi": ["R12644"]
            }
        }
        print(url, payload_json)
        response = requests.post(
            url,
            headers=self.headers,
            json=payload_json,
            cert=(self.cert_path, self.key_path),
            verify=False
        )
        return self._log_response(node, response)

    def create_data(self, resource):
        url = f"{self.base_url}/{resource['m2m:cnt']['ri']}"
        payload_json = {
            "m2m:cnt": {
                "lbl": [f"{resource['m2m:cnt']['rn']}"],
                "rn": "Data",
                "acpi": ["R12644"]
            }
        }
        response = requests.post(
            url,
            headers=self.headers,
            json=payload_json,
            cert=(self.cert_path, self.key_path),
            verify=False
        )
        return self._log_response(resource['m2m:cnt']['ri'], response)

    def create_descriptor(self, resource):
        url = f"{self.base_url}/{resource['m2m:cnt']['ri']}"
        payload_json = {
            "m2m:cnt": {
                "lbl": [f"{resource['m2m:cnt']['rn']}"],
                "rn": "Descriptor",
                "acpi": ["R12644"]
            }
        }
        response = requests.post(
            url,
            headers=self.headers,
            json=payload_json,
            cert=(self.cert_path, self.key_path),
            verify=False
        )
        return self._log_response(resource['m2m:cnt']['ri'], response)

    def _log_response(self, node_id, response):
        if response.ok:
            response_data = response.json()
            log_message = {
                "node_id": node_id,
                "response": response.status_code,
                "data": response_data
            }
        else:
            log_message = {
                "node_id": node_id,
                "response": response.status_code,
                "error": response.text
            }
        return log_message

def ccsp(node_id,url , cert_file, key_file):
    client = CCSPClient(
        base_url=url,
        origin="SOTIiithWQ1",
        ri="SmartCityiiith",
        rvi="3",
        cert_name=cert_file,
        key_name=key_file
    )    
    try:
        print(url)
        node_response = client.create_node(node=node_id)
        print(node_response)

        if not node_response.get('data'):
            raise ValueError("Failed to create node")

        descriptor_response = client.create_descriptor(node_response['data'])
        print(descriptor_response)

        if not descriptor_response.get('data'):
            raise ValueError("Failed to create descriptor")

        data_response = client.create_data(node_response["data"])
        print(data_response)

        if not data_response.get('data'):
            raise ValueError("Failed to create data")

        return data_response['data']['m2m:cnt']['ri'], data_response['response']
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return None, None
    except ValueError as e:
        print(f"Error: {e}")
        return None, None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None
