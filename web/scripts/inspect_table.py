
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env variables from .env.local
load_dotenv('.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase: Client = create_client(url, key)

print("--- Inspecting random records from h1b_filings ---")

# Get 5 random records
response = supabase.table("h1b_filings").select("employer_name, case_number, job_title").limit(5).execute()

print(f"Total count returned: {len(response.data)}")
for row in response.data:
    print(row)

# Check total table count
count = supabase.table("h1b_filings").select("*", count="exact").limit(1).execute()
print(f"Total rows in h1b_filings: {count.count}")
