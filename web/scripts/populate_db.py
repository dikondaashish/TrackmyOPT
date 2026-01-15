
import os
import csv
import json
import re
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load from web/.env.local relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '../.env.local')
load_dotenv(env_path)

# Use service role key to bypass RLS for inserts
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Missing credentials (need SUPABASE_SERVICE_ROLE_KEY)")
    exit(1)

supabase: Client = create_client(url, key)


CSV_PATH = "/Users/ashishdikonda/Documents/Office/ZYENE/TrackMyOPT/TrackMyOPT/ITContractorsUnion-Main/Data/LCA_Disclosure_Data_FY2025_Q4.csv"
BATCH_SIZE = 100

# Columns from types/supabase.ts
VALID_COLUMNS = {
    "agent_attorney_email", "agent_attorney_name", "begin_date", "case_number", 
    "decision_date", "employer_address1", "employer_address2", "employer_city", 
    "employer_country", "employer_name", "employer_phone", "employer_poc_email", 
    "employer_poc_name", "employer_postal_code", "employer_state", "end_date", 
    "full_time_position", "job_title", "lawfirm_name", "naics_code", 
    "original_cert_date", "prevailing_wage", "pw_source", "pw_source_year", 
    "pw_unit", "pw_wage_level", "received_date", "secondary_entity", 
    "secondary_entity_business_name", "soc_code", "soc_title", "sponsor_id", 
    "status", "total_workers", "visa_class", "wage_rate_from", "wage_rate_to", 
    "wage_unit", "worksite_address1", "worksite_address2", "worksite_city", 
    "worksite_county", "worksite_postal_code", "worksite_state", "worksite_workers"
}

# Mapping: CSV Header -> DB Column
COLUMN_MAP = {
    "CASE_NUMBER": "case_number",
    "CASE_STATUS": "status",
    "RECEIVED_DATE": "received_date",
    "DECISION_DATE": "decision_date",
    "ORIGINAL_CERT_DATE": "original_cert_date",
    "VISA_CLASS": "visa_class",
    "JOB_TITLE": "job_title",
    "SOC_CODE": "soc_code",
    "SOC_TITLE": "soc_title",
    "FULL_TIME_POSITION": "full_time_position",
    "BEGIN_DATE": "begin_date",
    "END_DATE": "end_date",
    "TOTAL_WORKER_POSITIONS": "total_workers",
    "EMPLOYER_NAME": "employer_name",
    "EMPLOYER_ADDRESS1": "employer_address1",
    "EMPLOYER_ADDRESS2": "employer_address2",
    "EMPLOYER_CITY": "employer_city",
    "EMPLOYER_STATE": "employer_state",
    "EMPLOYER_POSTAL_CODE": "employer_postal_code",
    "EMPLOYER_COUNTRY": "employer_country",
    "EMPLOYER_PHONE": "employer_phone",
    "NAICS_CODE": "naics_code",
    "TRADE_NAME_DBA": "trade_name_dba",
    
    # POC Info
    "EMPLOYER_POC_EMAIL": "employer_poc_email",
    "EMPLOYER_POC_JOB_TITLE": "employer_poc_job_title",
    "EMPLOYER_POC_PHONE": "employer_poc_phone",
    "EMPLOYER_POC_PHONE_EXT": "employer_poc_phone_ext",
    "EMPLOYER_POC_ADDRESS1": "employer_poc_address1",
    "EMPLOYER_POC_ADDRESS2": "employer_poc_address2",
    "EMPLOYER_POC_CITY": "employer_poc_city",
    "EMPLOYER_POC_STATE": "employer_poc_state",
    "EMPLOYER_POC_POSTAL_CODE": "employer_poc_postal_code",
    "EMPLOYER_POC_COUNTRY": "employer_poc_country",
    "EMPLOYER_POC_PROVINCE": "employer_poc_province",

    # Attorney/Agent Info
    "AGENT_ATTORNEY_EMAIL_ADDRESS": "agent_attorney_email",
    "AGENT_ATTORNEY_PHONE": "agent_attorney_phone",
    "AGENT_ATTORNEY_PHONE_EXT": "agent_attorney_phone_ext",
    "AGENT_ATTORNEY_ADDRESS1": "agent_attorney_address1",
    "AGENT_ATTORNEY_ADDRESS2": "agent_attorney_address2",
    "AGENT_ATTORNEY_CITY": "agent_attorney_city",
    "AGENT_ATTORNEY_STATE": "agent_attorney_state",
    "AGENT_ATTORNEY_POSTAL_CODE": "agent_attorney_postal_code",
    "AGENT_ATTORNEY_COUNTRY": "agent_attorney_country",
    "AGENT_ATTORNEY_PROVINCE": "agent_attorney_province",
    "LAWFIRM_NAME_BUSINESS_NAME": "lawfirm_name",
    "LAWFIRM_BUSINESS_FEIN": "lawfirm_business_fein",
    "STATE_OF_HIGHEST_COURT": "state_of_highest_court",
    "NAME_OF_HIGHEST_STATE_COURT": "name_of_highest_state_court",
    "AGENT_REPRESENTING_EMPLOYER": "agent_representing_employer",

    # Employment Counts
    "NEW_EMPLOYMENT": "new_employment",
    "CONTINUED_EMPLOYMENT": "continued_employment",
    "CHANGE_PREVIOUS_EMPLOYMENT": "change_previous_employment",
    "NEW_CONCURRENT_EMPLOYMENT": "new_concurrent_employment",
    "CHANGE_EMPLOYER": "change_employer",
    "AMENDED_PETITION": "amended_petition",

    # LCA Details
    "H_1B_DEPENDENT": "h_1b_dependent",
    "WILLFUL_VIOLATOR": "willful_violator",
    "SUPPORT_H1B": "support_h1b",
    "APPENDIX_A_ATTACHED": "appendix_a_attached",
    "PUBLIC_DISCLOSURE": "public_disclosure",
    "AGREE_TO_LC_STATEMENT": "agree_to_lc_statement",
    "STATUTORY_BASIS": "statutory_basis",

    # Preparer - KEEP SPLIT
    "PREPARER_LAST_NAME": "preparer_last_name",
    "PREPARER_FIRST_NAME": "preparer_first_name",
    "PREPARER_MIDDLE_INITIAL": "preparer_middle_initial",
    "PREPARER_BUSINESS_NAME": "preparer_business_name",
    "PREPARER_EMAIL": "preparer_email",

    # Worksite
    "TOTAL_WORKSITE_LOCATIONS": "total_worksite_locations",
    "WORKSITE_WORKERS": "worksite_workers",
    "SECONDARY_ENTITY": "secondary_entity",
    "SECONDARY_ENTITY_BUSINESS_NAME": "secondary_entity_business_name",
    "WORKSITE_ADDRESS1": "worksite_address1",
    "WORKSITE_ADDRESS2": "worksite_address2",
    "WORKSITE_CITY": "worksite_city",
    "WORKSITE_COUNTY": "worksite_county",
    "WORKSITE_STATE": "worksite_state",
    "WORKSITE_POSTAL_CODE": "worksite_postal_code",
    
    # Wage
    "WAGE_RATE_OF_PAY_FROM": "wage_rate_from",
    "WAGE_RATE_OF_PAY_TO": "wage_rate_to",
    "WAGE_UNIT_OF_PAY": "wage_unit",
    "PREVAILING_WAGE": "prevailing_wage",
    "PW_UNIT_OF_PAY": "pw_unit",
    "PW_WAGE_LEVEL": "pw_wage_level",
    "PW_OES_YEAR": "pw_source_year", 
    "PW_OTHER_SOURCE": "pw_other_source",
    "PW_OTHER_YEAR": "pw_other_year",
    "PW_SURVEY_PUBLISHER": "pw_survey_publisher",
    "PW_SURVEY_NAME": "pw_survey_name",
    "PW_TRACKING_NUMBER": "pw_tracking_number"
}

def clean_date(date_str):
    if not date_str:
        return None
    try:
        # Expected format: "10/1/2024" or similar
        return datetime.strptime(date_str, "%m/%d/%Y").strftime("%Y-%m-%d")
        # Add handling for other formats if necessary
    except ValueError:
        return None

def clean_currency(amount_str):
    if not amount_str:
        return None
    # Remove '$', ',', spaces
    clean_str = re.sub(r'[$,\s]', '', str(amount_str))
    try:
        return float(clean_str)
    except ValueError:
        return None

def clean_int(int_str):
    if not int_str:
        return None
    try:
        # Handle cases like "1.0" or "1,000"
        clean_str = re.sub(r'[,\s]', '', str(int_str))
        return int(float(clean_str))
    except (ValueError, TypeError):
        return None

def process_file(csv_file_path):
    print(f"Processing {csv_file_path}...")
    
    # Check current count
    try:
        count_response = supabase.table("h1b_filings").select("count", count="exact").execute()
        print(f"Current rows in h1b_filings: {count_response.count}")
    except Exception as e:
        print(f"Error checking count: {e}")

    rows_to_insert = []
    
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for i, row in enumerate(reader):
            db_row = {}
            for csv_col, db_col in COLUMN_MAP.items():
                val = row.get(csv_col, "").strip()
                if not val:
                    db_row[db_col] = None
                    continue
                
                # Apply transformations based on column name
                if "date" in db_col:
                    db_row[db_col] = clean_date(val)
                elif "wage" in db_col or "rate" in db_col:
                    db_row[db_col] = clean_currency(val)
                elif "_workers" in db_col or "total_" in db_col or "employment" in db_col or "amended_" in db_col or "change_" in db_col or "year" in db_col:
                     db_row[db_col] = clean_int(val)
                else:
                    db_row[db_col] = val

            # Composite Name Logic
            emp_first = row.get("EMPLOYER_POC_FIRST_NAME", "").strip()
            emp_last = row.get("EMPLOYER_POC_LAST_NAME", "").strip()
            emp_mid = row.get("EMPLOYER_POC_MIDDLE_NAME", "").strip()
            if emp_first or emp_last:
                db_row["employer_poc_name"] = f"{emp_first} {emp_mid} {emp_last}".replace("  ", " ").strip()
            
            att_first = row.get("AGENT_ATTORNEY_FIRST_NAME", "").strip()
            att_last = row.get("AGENT_ATTORNEY_LAST_NAME", "").strip()
            att_mid = row.get("AGENT_ATTORNEY_MIDDLE_NAME", "").strip()
            if att_first or att_last:
                db_row["agent_attorney_name"] = f"{att_first} {att_mid} {att_last}".replace("  ", " ").strip()

            rows_to_insert.append(db_row)
            
            if len(rows_to_insert) >= BATCH_SIZE:
                try:
                    result = supabase.table("h1b_filings").insert(rows_to_insert).execute()
                    print(f"Inserted batch ending at row {i}")
                    rows_to_insert = []
                except Exception as e:
                    print(f"Error inserting batch: {e}")
                    rows_to_insert = []

    if rows_to_insert:
         try:
            result = supabase.table("h1b_filings").insert(rows_to_insert).execute()
            print(f"Inserted final batch.")
         except Exception as e:
            print(f"Error inserting final batch: {e}")

if __name__ == "__main__":
    process_file(CSV_PATH)
