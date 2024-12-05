import requests

class OM2MClient:
    def __init__(self, url, headers):
        self.url = url
        self.headers = headers

    def nodecreate(self, node_id):
        url = self.url
        headers = {
            'X-M2M-Origin': self.headers['X-M2M-Origin'],
            'Content-Type': self.headers['Content-Type'] + '3'
        }
        payload_json = {
            "m2m:cnt": {
                "rn": node_id,
                "lbl": [node_id],
                "mni": 120
            }
        }
        print(headers, payload_json,url)
        response = requests.post(
            url,
            headers=headers,
            json=payload_json
        )
        
        # Check if the response is empty or not JSON
        if response.status_code != 200:
            return(f"Request failed with status code {response.status_code}: {response.text}")
        
        return response.json()
    def datacreate(self, node_id):
        url = self.url+node_id
        headers = {
            'X-M2M-Origin': self.headers['X-M2M-Origin'],
            'Content-Type': self.headers['Content-Type'] + '3'
        }
        payload_json = {
            "m2m:cnt": {
                "rn": "Data",
                "lbl": ["Data"],
                "mni": 120
            }
        }
        response = requests.post(
            url,
            headers=headers,
            json=payload_json
        )
        if response.status_code != 200:
            return(f"Request failed with status code {response.status_code}: {response.text}")
        
        return response.json()

def om2m(node_id, om2m_username, om2m_password, url, port):
    try:
        if url.endswith(':'):
            full_url = f"{url}{port}/~/in-cse/in-name/AE-TEST/"
        else:
            full_url = f"{url}:{port}/~/in-cse/in-name/AE-TEST/"
        
        client = OM2MClient(
            url=full_url,
            headers={
            'X-M2M-Origin': f'{om2m_username}:{om2m_password}',
            'Content-Type': 'application/json;ty='
            }
        )
        node_response = client.nodecreate(node_id)
        data_response = client.datacreate(node_id)
        print(node_response, data_response)
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making a request: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")