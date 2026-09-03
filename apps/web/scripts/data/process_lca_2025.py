import csv
import re
import os
import datetime
import urllib.request
import urllib.error
import json
import time

from dotenv import load_dotenv

from h1b_data_paths import require_h1b_raw_data_dir

# Load env variables from .env.local
load_dotenv(".env.local")

# Configuration
INPUT_FILE = require_h1b_raw_data_dir() / "Data" / "LCA_Disclosure_Data_FY2025_Q4.csv"
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://deknauqkqqzwuvopqott.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
FILINGS_URL = os.getenv("SUPABASE_FILINGS_URL")
FILINGS_KEY = os.getenv("SUPABASE_FILINGS_SERVICE_ROLE_KEY")

if not SUPABASE_KEY or not FILINGS_KEY:
    raise ValueError("Primary and filings Supabase service keys are required.")

FILINGS_TABLE = "h1b_filings"
SPONSORS_TABLE = "h1b_sponsors"
BATCH_SIZE = 1000  # API Batch size

def slugify(text):
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text

def clean_money(text):
    if not text:
        return None
    clean = re.sub(r'[$,\s]', '', text)
    try:
        return float(clean)
    except ValueError:
        return None

def clean_int(text):
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None

def format_date(text):
    if not text:
        return None
    try:
        dt = datetime.datetime.strptime(text, "%m/%d/%Y")
        return dt.strftime('%Y-%m-%d')
    except ValueError:
        return None

def upload_batch(table, batch):
    base_url = FILINGS_URL if table == FILINGS_TABLE else SUPABASE_URL
    api_key = FILINGS_KEY if table == FILINGS_TABLE else SUPABASE_KEY
    url = f"{base_url}/rest/v1/{table}"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=ignore-duplicates" 
    }
    
    data = json.dumps(batch).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    
    # Retry logic
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req) as response:
                if response.status in [200, 201]:
                    return True
        except urllib.error.HTTPError as e:
            if e.code == 409:
                print("Conflict error (duplicates), ignoring.")
                return True # Treat as success if ignoring duplicates
            error_msg = e.read().decode()
            print(f"Error {e.code}: {error_msg}")
            time.sleep(1)
        except Exception as e:
            print(f"Exception: {e}")
            time.sleep(1)
            
    return False

def process_data():
    print("Starting data processing...")
    
    unique_sponsors = {}
    filings_batch = []
    
    total_filings = 0
    total_sponsors = 0

    with open(INPUT_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            status = row.get("CASE_STATUS")
            if status not in ["Certified", "Certified - Withdrawn"]:
                continue

            employer_name = row.get("EMPLOYER_NAME", "").strip()
            if not employer_name:
                continue

            sponsor_id = slugify(employer_name)
            
            # Prepare Sponsor Data (Upsert later)
            if sponsor_id not in unique_sponsors:
                unique_sponsors[sponsor_id] = {
                    "id": sponsor_id,
                    "name": employer_name,
                    "location": f"{row.get('EMPLOYER_CITY', '')}, {row.get('EMPLOYER_STATE', '')}",
                    "industry": "Tech",
                    "size": "Startup",
                    "approvals_2021": 0, "approvals_2022": 0, "approvals_2023": 0,
                    "sponsorship_strength": "Low",
                    "common_roles": []
                }

            # Prepare Filing Data
            filing = {
                "case_number": row.get("CASE_NUMBER"),
                "status": status,
                "received_date": format_date(row.get("RECEIVED_DATE")),
                "decision_date": format_date(row.get("DECISION_DATE")),
                "original_cert_date": format_date(row.get("ORIGINAL_CERT_DATE")),
                "visa_class": row.get("VISA_CLASS"),
                "job_title": row.get("JOB_TITLE"),
                "soc_code": row.get("SOC_CODE"),
                "soc_title": row.get("SOC_TITLE"),
                "full_time_position": row.get("FULL_TIME_POSITION"),
                "begin_date": format_date(row.get("BEGIN_DATE")),
                "end_date": format_date(row.get("END_DATE")),
                "total_workers": clean_int(row.get("TOTAL_WORKER_POSITIONS")),
                "employer_name": employer_name,
                "employer_address1": row.get("EMPLOYER_ADDRESS1"),
                "employer_address2": row.get("EMPLOYER_ADDRESS2"),
                "employer_city": row.get("EMPLOYER_CITY"),
                "employer_state": row.get("EMPLOYER_STATE"),
                "employer_postal_code": row.get("EMPLOYER_POSTAL_CODE"),
                "employer_country": row.get("EMPLOYER_COUNTRY"),
                "employer_phone": row.get("EMPLOYER_PHONE"),
                "naics_code": row.get("NAICS_CODE"),
                "employer_poc_name": f"{row.get('EMPLOYER_POC_FIRST_NAME')} {row.get('EMPLOYER_POC_LAST_NAME')}".strip(),
                "employer_poc_email": row.get("EMPLOYER_POC_EMAIL"),
                "agent_attorney_name": f"{row.get('AGENT_ATTORNEY_FIRST_NAME')} {row.get('AGENT_ATTORNEY_LAST_NAME')}".strip(),
                "agent_attorney_email": row.get("AGENT_ATTORNEY_EMAIL_ADDRESS"),
                "lawfirm_name": row.get("LAWFIRM_NAME_BUSINESS_NAME"),
                "worksite_workers": clean_int(row.get("WORKSITE_WORKERS")),
                "secondary_entity": row.get("SECONDARY_ENTITY"),
                "secondary_entity_business_name": row.get("SECONDARY_ENTITY_BUSINESS_NAME"),
                "worksite_address1": row.get("WORKSITE_ADDRESS1"),
                "worksite_address2": row.get("WORKSITE_ADDRESS2"),
                "worksite_city": row.get("WORKSITE_CITY"),
                "worksite_county": row.get("WORKSITE_COUNTY"),
                "worksite_state": row.get("WORKSITE_STATE"),
                "worksite_postal_code": row.get("WORKSITE_POSTAL_CODE"),
                "wage_rate_from": clean_money(row.get("WAGE_RATE_OF_PAY_FROM")),
                "wage_rate_to": clean_money(row.get("WAGE_RATE_OF_PAY_TO")),
                "wage_unit": row.get("WAGE_UNIT_OF_PAY"),
                "prevailing_wage": clean_money(row.get("PREVAILING_WAGE")),
                "pw_unit": row.get("PW_UNIT_OF_PAY"),
                "pw_wage_level": row.get("PW_WAGE_LEVEL"),
                "pw_source": row.get("PW_OTHER_SOURCE") or row.get("PW_SURVEY_PUBLISHER"),
                "pw_source_year": clean_int(row.get("PW_OES_YEAR") or row.get("PW_OTHER_YEAR")),
                "sponsor_id": sponsor_id
            }
            
            filings_batch.append(filing)
            
            if len(filings_batch) >= BATCH_SIZE:
                if upload_batch(FILINGS_TABLE, filings_batch):
                    total_filings += len(filings_batch)
                    print(f"Uploaded {total_filings} filings...")
                else:
                    print(f"Failed to upload batch at offset {total_filings}")
                filings_batch = []
                
    # Upload remaining filings
    if filings_batch:
        if upload_batch(FILINGS_TABLE, filings_batch):
            total_filings += len(filings_batch)
            print(f"Uploaded {total_filings} filings (Final).")
    
    # Upload Sponsors
    print("Uploading Sponsors...")
    sponsor_list = list(unique_sponsors.values())
    sponsor_batch = []
    
    for sponsor in sponsor_list:
        sponsor_batch.append(sponsor)
        if len(sponsor_batch) >= BATCH_SIZE:
            if upload_batch(SPONSORS_TABLE, sponsor_batch):
                 total_sponsors += len(sponsor_batch)
                 print(f"Uploaded {total_sponsors} sponsors...")
            sponsor_batch = []

    if sponsor_batch:
        if upload_batch(SPONSORS_TABLE, sponsor_batch):
             total_sponsors += len(sponsor_batch)
             print(f"Uploaded {total_sponsors} sponsors (Final).")

    print("Done!")

if __name__ == "__main__":
    process_data()
