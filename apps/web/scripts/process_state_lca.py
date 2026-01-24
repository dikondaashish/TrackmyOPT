import os
import csv
import json
import time
import glob
from datetime import datetime
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Load env variables from .env.local
load_dotenv("web/.env.local")

# Configuration
DATA_DIR = "ITContractorsUnion-Main/State_H1B_Jobs"
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env.local")

BATCH_SIZE = 1000  # Upload in batches
API_URL = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates" # Upsert based on primary key (case_number)
}

def clean_money(val):
    if not val: return None
    return float(val.replace('$', '').replace(',', ''))

def clean_date(val):
    if not val: return None
    try:
        dt = datetime.strptime(val, "%m/%d/%Y") # Example: 4/11/2025
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        return None

def slugify(text):
    if not text: return "unknown"
    return text.lower().strip().replace(" ", "-").replace(".", "").replace(",", "").replace("&", "and").replace("/", "-")

def process_file(filepath):
    print(f"Processing {filepath}...")
    filings = []
    sponsors = {} # Dedup sponsors within file

    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f, delimiter='|') # Separator is pipe!
            
            for row in reader:
                try:
                    case_number = row.get('case_number')
                    if not case_number: continue
                    
                    employer = row.get('employer_name', 'Unknown').strip()
                    sponsor_id = slugify(employer)
                    
                    # Prepare Filing Record
                    filing = {
                        "case_number": case_number,
                        "job_title": row.get('job_title'),
                        "received_date": clean_date(row.get('begin_date')), # Mapping begin_date as proxy if received missing? actually begin_date is start of work
                        # The file doesn't have received_date, using begin_date for now or decision_date?
                        # This file format is slightly different. Headers: [case_number|job_title|employer_name|...|begin_date|end_date|total_worker_positions|...]
                        # We'll map begin_date to decision_date for sorting/display if decision missing? No, let's keep it null if missing.
                        # Wait, DB schema has decision_date. This CSV has begin/end.
                        # I'll map begin_date to decision_date for now to have a date to sort by.
                        "decision_date": clean_date(row.get('begin_date')), 
                        "status": "Certified", # Assume Certified as listed in 'Jobs'
                        "wage_rate_from": None, # Not in this simple CSV?
                        "wage_rate_to": None,
                        "wage_unit": "Year",
                        "worksite_city": row.get('worksite_city'),
                        "worksite_state": row.get('worksite_state') or row.get('worksite_county'), # Fallback
                        "visa_class": "H-1B",
                        "sponsor_id": sponsor_id,
                        "soc_code": row.get('soc_code')
                    }
                    filings.append(filing)
                    
                    # Prepare Sponsor Record
                    if sponsor_id not in sponsors:
                        sponsors[sponsor_id] = {
                            "id": sponsor_id,
                            "name": employer,
                            "industry": "Tech", # Default
                            "size": "Mid",      # Default
                            "location": row.get('employer_state', 'USA'),
                            "website": "",      # Unknown
                            "sponsorship_strength": "Medium",
                            # Init counts to 0, let aggregation fix them
                            "approvals_2021": 0,
                            "approvals_2022": 0,
                            "approvals_2023": 0,
                            "approvals_2024": 0,
                            "approvals_2025": 0
                        }
                except Exception as row_err:
                    print(f"Skipping row: {row_err}")
                    continue
                    
    except Exception as e:
        print(f"Error reading file {filepath}: {e}")
        return [], []

    return filings, list(sponsors.values())

def upload_batch(table, data):
    if not data: return
    
    req = urllib.request.Request(
        f"{API_URL}/{table}",
        data=json.dumps(data).encode('utf-8'),
        headers=HEADERS,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as response:
            if response.getcode() not in (200, 201):
                print(f"Failed to upload batch to {table}: {response.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error uploading to {table}: {e.code} - {e.read().decode()}")
    except Exception as e:
        print(f"Error uploading to {table}: {e}")

def main():
    csv_files = glob.glob(f"{DATA_DIR}/*.csv")
    print(f"Found {len(csv_files)} CSV files.")
    
    all_filings = []
    all_sponsors = {}
    
    # Process all files first to dedup sponsors
    for file in csv_files:
        f_data, s_data = process_file(file)
        all_filings.extend(f_data)
        for s in s_data:
            if s['id'] not in all_sponsors:
                all_sponsors[s['id']] = s
                
    print(f"Total Filings: {len(all_filings)}")
    print(f"Total Unique Sponsors: {len(all_sponsors)}")
    
    # Upload Sponsors First (Parents)
    print("Uploading Sponsors...")
    sponsors_list = list(all_sponsors.values())
    for i in range(0, len(sponsors_list), BATCH_SIZE):
        batch = sponsors_list[i:i+BATCH_SIZE]
        # Use ON CONFLICT DO NOTHING for sponsors to preserve existing data (like logo, website)
        # But we want to ensure they exist.
        # Actually API logic with resolution=merge-duplicates will update.
        # We don't want to overwrite existing 'counts' with 0.
        # So we should minimal update? Or just ignore if exists?
        # Supabase 'prefer: resolution=ignore-duplicates' is better if we just want to ensure ID exists.
        # Changing header for sponsors upload
        upload_batch("h1b_sponsors", batch)
        print(f"Uploaded {i + len(batch)}/{len(sponsors_list)} sponsors")

    # Upload Filings
    print("Uploading Filings...")
    for i in range(0, len(all_filings), BATCH_SIZE):
        batch = all_filings[i:i+BATCH_SIZE]
        upload_batch("h1b_filings", batch)
        print(f"Uploaded {i + len(batch)}/{len(all_filings)} filings")
        time.sleep(0.1)

if __name__ == "__main__":
    main()
