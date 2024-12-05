import requests


class mobius:
    def __init__(self, XM2MRI, XM2MORIGIN, url):
        self.XM2MORIGIN = XM2MORIGIN
        self.XM2MRI = XM2MRI
        self.url = url

    def create_ae(self, name, labels=[], rr=False):
        data = {
            "m2m:ae": {
                "rn": name,
                "api": "0.2.481.2.0001.001.000111",
                "lbl": labels,
                "rr": rr,
            }
        }
        headers = {
            "X-M2M-RI": self.XM2MRI,
            "X-M2M-Origin": self.XM2MORIGIN + name,
            "Content-Type": "application/json;ty=2",
        }

        r = requests.post(self.url, headers=headers, json=data)
        return r.status_code, r.text

    def create_container(self, name, parent= "AE", labels=[], mni=120):
        # Create Node
        print("Creating Container", parent, name, labels, mni)
        data = {"m2m:cnt": {"rn": name, "lbl": labels, "mni": mni}}
        headers = {
            "X-M2M-RI": self.XM2MRI,
            "X-M2M-Origin": self.XM2MORIGIN ,
            "Content-Type": "application/json;ty=3",
        }
        print("data and headers",data, headers)
        r = requests.post(self.url + "/" + parent, headers=headers, json=data)

        # Create Data Container inside Node
        data = {"m2m:cnt": {"rn": "Data", "lbl": labels, "mni": mni}}

        r = requests.post(
            self.url + "/" + parent + "/" + name, headers=headers, json=data
        )

        return r.status_code

    def create_cin(self, parent, node, con, lbl=None, timeout=None):
        data = {"m2m:cin": {"con": con, "lbl": lbl}}

        headers = {
            "X-M2M-RI": self.XM2MRI,
            "X-M2M-Origin": self.XM2MORIGIN + parent,
            "Content-Type": "application/json;ty=4",
        }

        r = requests.post(
            self.url + "/" + parent + "/" + node + "/Data?rcn=1",
            headers=headers,
            json=data,
            timeout=timeout,
        )
        return r
    
    
# if __name__ == "__main__":
#     mobius_instance = mobius("12345", "SOrigin", "http://10.2.16.116:8210/Mobius")
        
#         # Create AE
#     # ae_status, ae_response = mobius_instance.create_ae("AE",  ["label1", "label2"], True)
#     # print(f"AE Creation Status: {ae_status}, Response: {ae_response}")
        
#         # Create Container
#     container_response = mobius_instance.create_container("Node_1001", "AE", ["label1", "label2"], 100)
#     print(f"Container Creation Response: {container_response.status_code}, Response: {container_response.text}")
        
#         # Create CIN
#     cin_response = mobius_instance.create_cin("AE", "Node_1001", "120120122", ["label1"], 5)
#     print(f"CIN Creation Response: {cin_response.status_code}, Response: {cin_response.text}")


def mobius_function(node_id, xm2m_ri, xm2m_origin, url, port):
    try:
        if url.endswith(':'):
            full_url = f"{url}{port}/Mobius"
        else:
            full_url = f"{url}:{port}/Mobius"
        
        client = mobius(
            XM2MRI=xm2m_ri,
            XM2MORIGIN=xm2m_origin,
            url=full_url
        )
        print(full_url)
        # ae_response = client.create_ae( "AE", ["AE"], True)
        # print(ae_response)
        container_response = client.create_container(node_id)
        # cin_response = client.create_cin(xm2m_origin, node_id, "testContent", ["label1"], 5)
        print(container_response)
        if container_response == 201:
            return node_id
        return None
    except Exception as e:
        return e    


# print(mobius_function("Node_101201", "12345", "SOrigin", "http://10.2.16.116", 8210))