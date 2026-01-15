
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env variables from .env.local
load_dotenv('.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(url, key)

print("--- Searching for Infosys in h1b_filings ---")

# 1. Try generic search
response = supabase.table("h1b_filings").select("employer_name, sponsor_id").ilike("employer_name", "%INFOSYS%").limit(5).execute()

print(f"Found {len(response.data)} records matching %INFOSYS%:")
for row in response.data:
    print(f"  Name: '{row.get('employer_name')}', Sponsor ID: {row.get('sponsor_id')}")

# 2. Check a known record
print("\n--- Checking count ---")
count = supabase.table("h1b_filings").select("*", count="exact").ilike("employer_name", "%INFOSYS LIMITED%").execute()
print(f"Count for 'INFOSYS LIMITED': {count.count}")
