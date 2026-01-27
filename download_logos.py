import requests
import os

universities = [
    {"name": "cmu", "domain": "cmu.edu"},
    {"name": "gatech", "domain": "gatech.edu"},
    {"name": "usc", "domain": "usc.edu"},
    {"name": "nyu", "domain": "nyu.edu"},
    {"name": "columbia", "domain": "columbia.edu"},
    {"name": "mit", "domain": "mit.edu"},
    {"name": "stanford", "domain": "stanford.edu"},
    {"name": "berkeley", "domain": "berkeley.edu"},
    {"name": "harvard", "domain": "harvard.edu"},
    {"name": "cornell", "domain": "cornell.edu"},
    {"name": "uiuc", "domain": "illinois.edu"},
    {"name": "purdue", "domain": "purdue.edu"},
    {"name": "utexas", "domain": "utexas.edu"},
    {"name": "northeastern", "domain": "northeastern.edu"},
    {"name": "bu", "domain": "bu.edu"},
    {"name": "tamu", "domain": "tamu.edu"},
    {"name": "asu", "domain": "asu.edu"},
    {"name": "uw", "domain": "washington.edu"},
    {"name": "ucla", "domain": "ucla.edu"},
    {"name": "umich", "domain": "umich.edu"},
]

output_dir = "apps/web/public/unis"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

print(f"Downloading {len(universities)} logos to {output_dir}...")

for uni in universities:
    url = f"https://logo.clearbit.com/{uni['domain']}?size=128&format=png"
    filename = f"{uni['name']}.png"
    filepath = os.path.join(output_dir, filename)
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print(f"✅ Downloaded: {filename}")
        else:
            print(f"❌ Failed (Status {response.status_code}): {filename}")
    except Exception as e:
        print(f"⚠️ Error downloading {filename}: {e}")

print("Done.")
