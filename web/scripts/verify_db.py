
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Missing credentials")
    exit(1)

supabase: Client = create_client(url, key)

print("--- Database Verification ---")

# 1. Check h1b_sponsors count
try:
    sponsors_count = supabase.table("h1b_sponsors").select("*", count="exact").limit(1).execute()
    print(f"✅ h1b_sponsors count: {sponsors_count.count}")
except Exception as e:
    print(f"❌ Error checking h1b_sponsors: {e}")

# 2. Check h1b_filings count
try:
    filings_count = supabase.table("h1b_filings").select("*", count="exact").limit(1).execute()
    print(f"✅ h1b_filings count: {filings_count.count}")
except Exception as e:
    print(f"❌ Error checking h1b_filings: {e}")

# 3. Check for any filing with 'Infosys' in employer_name (to be absolutely sure)
try:
    infosys = supabase.table("h1b_filings").select("employer_name").ilike("employer_name", "%INFOSYS%").limit(1).execute()
    print(f"Infosys search result count: {len(infosys.data)}")
except Exception as e:
    print(f"Error searching Infosys: {e}")
