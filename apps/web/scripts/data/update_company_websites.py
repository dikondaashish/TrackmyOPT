import os
import re
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env variables
load_dotenv('web/.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
filings_url = os.environ.get("SUPABASE_FILINGS_URL")
filings_key = os.environ.get("SUPABASE_FILINGS_SERVICE_ROLE_KEY")

if not url or not key or not filings_url or not filings_key:
    print("Error: Missing credentials")
    exit(1)

supabase: Client = create_client(url, key)
filings_supabase: Client = create_client(filings_url, filings_key)

BLACKLIST_DOMAINS = {
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
    'fragomen.com', 'balglobal.com', 'deloitte.com', 'ey.com', 'kpmg.com', 'pwc.com' 
     # Note: Big 4 are often agents, but if they are the EMPLOYER, it's fine. 
     # But usually law firms (fragomen) use their email for POC.
     # We should be careful. Actually, `employer_poc_email` is usually the internal HR person.
     # But sometimes it's the attorney.
     # Let's check `agent_representing_employer`.
     # For now, we will trust the email provided in EMPLOYER_POC_EMAIL as the best guess.
}

def extract_domain(email):
    if not email or '@' not in email:
        return None
    try:
        domain = email.split('@')[1].lower().strip()
        if domain in BLACKLIST_DOMAINS:
            return None
        return domain
    except:
        return None

import time
import random

# ... (imports remain)

def get_sponsors_batch(start, batch_size, max_retries=3):
    for i in range(max_retries):
        try:
            return supabase.table("h1b_sponsors").select("id, name, website").range(start, start + batch_size).execute()
        except Exception as e:
            print(f"Error fetching batch {start}: {e}. Retrying ({i+1}/{max_retries})...")
            time.sleep(2 * (i + 1))  # Exponential backoff
    return None

def main():
    print("Fetching unique employer emails...")
    
    # 1. Get all sponsors
    # Allow resuming if needed (hardcoded for now or arg)
    start = 0 
    batch_size = 200 # Reduced batch size
    total_updated = 0
    
    while True:
        sponsors = get_sponsors_batch(start, batch_size)
        if not sponsors or not sponsors.data:
            break
            
        print(f"Processing batch {start} - {start + len(sponsors.data)}")
        
        for sponsor in sponsors.data:
            sponsor_id = sponsor['id']
            curr_website = sponsor['website']
            
            try:
                # Fetch ONE filing for this sponsor to get the email
                # We assume filings are linked by sponsor_id
                filing = filings_supabase.table("h1b_filings")\
                    .select("employer_poc_email")\
                    .eq("sponsor_id", sponsor_id)\
                    .not_.is_("employer_poc_email", "null")\
                    .limit(1)\
                    .execute()
                    
                email = None
                if filing.data:
                    email = filing.data[0].get('employer_poc_email')
                
                if email:
                    domain = extract_domain(email)
                    if domain:
                        new_website = f"https://{domain}"
                        
                        if curr_website != new_website:
                            # Update
                            supabase.table("h1b_sponsors").update({"website": new_website}).eq("id", sponsor_id).execute()
                            # print(f"Updated {sponsor['name']}: {curr_website} -> {new_website}")
                            total_updated += 1
            except Exception as e:
                print(f"Error processing sponsor {sponsor['name']}: {e}")
                # Continue query, don't crash
                            
        start += batch_size
        print(f"Total Updated so far: {total_updated}")
        time.sleep(0.5) # Sleep to be nice to the API

if __name__ == "__main__":
    main()
