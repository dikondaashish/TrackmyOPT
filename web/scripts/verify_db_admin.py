
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # ADMIN KEY

if not url or not key:
    print("Error: Missing admin credentials")
    exit(1)

supabase: Client = create_client(url, key)

print("--- Admin Database Verification ---")

try:
    filings_count = supabase.table("h1b_filings").select("*", count="exact").limit(1).execute()
    print(f"✅ h1b_filings count (Admin): {filings_count.count}")
except Exception as e:
    print(f"❌ Error checking h1b_filings: {e}")

# Check Infosys specifically
try:
    infosys = supabase.table("h1b_filings").select("employer_name").ilike("employer_name", "%INFOSYS%").limit(5).execute()
    print(f"Infosys search result count: {len(infosys.data)}")
    for row in infosys.data:
        print(f" - {row['employer_name']}")
except Exception as e:
    print(f"Error searching Infosys: {e}")
