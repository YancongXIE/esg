import requests

# Path to the PDF file
pdf_path = 'Select_Harvests_Sustainability_Report_27Oct17.pdf'
import base64

# Server URL
server_url = 'https://3.24.35.11/dashboard_process'

def send_pdf(file_path):
    try:
        with open(file_path, "rb") as f:
            encoded_pdf = base64.b64encode(f.read()).decode('utf-8')

        # criteria = json.load(open("S2.json", "r", encoding="utf-8"))

        payload = {
            "pdf_base64": encoded_pdf,
            "standards": ["gri", "s2", "s3"]
        }

        headers = {'Content-Type': 'application/json'}
        response = requests.post(server_url, json=payload, headers=headers, verify=False)

        if response.status_code == 200:
            print("Response:", response.json())
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print("Exception occurred:", e)

if __name__ == '__main__':
    send_pdf(pdf_path)
