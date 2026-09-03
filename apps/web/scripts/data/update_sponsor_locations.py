
import os
import time
from collections import Counter
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('web/.env.local')

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
filings_url = os.environ.get("SUPABASE_FILINGS_URL")
filings_key = os.environ.get("SUPABASE_FILINGS_SERVICE_ROLE_KEY")

if not url or not key or not filings_url or not filings_key:
    raise ValueError("Supabase credentials not found in .env.local")

supabase: Client = create_client(url, key)
filings_supabase: Client = create_client(filings_url, filings_key)

BATCH_SIZE = 50

def get_sponsors_batch(offset, limit):
    """Fetch a batch of sponsors."""
    response = supabase.table('h1b_sponsors')\
        .select('id, name, location')\
        .range(offset, offset + limit - 1)\
        .execute()
    return response.data

def get_top_location(sponsor_id):
    """
    Find the most frequent (city, state) pair for a given sponsor 
    from their filings history.
    """
    # Query filings linked to this sponsor
    # We only care about filings that actually have a city
    response = filings_supabase.table('h1b_filings')\
        .select('employer_city, employer_state')\
        .eq('sponsor_id', sponsor_id)\
        .not_.is_('employer_city', 'null')\
        .execute()
    
    filings = response.data
    if not filings:
        return None

    # Count occurrences of "City, State"
    locations = []
    for f in filings:
        city = f.get('employer_city')
        state = f.get('employer_state')
        if city and state:
            # Normalize casing
            city = city.strip().title()
            state = state.strip().upper()
            locations.append(f"{city}, {state}")
    
    if not locations:
        return None

    # Return the most common location
    most_common = Counter(locations).most_common(1)
    if most_common:
        return most_common[0][0]
    return None

def update_sponsor_location(sponsor_id, new_location):
    """Update the sponsor's location in the database."""
    try:
        supabase.table('h1b_sponsors')\
            .update({'location': new_location})\
            .eq('id', sponsor_id)\
            .execute()
        return True
    except Exception as e:
        print(f"Error updating sponsor {sponsor_id}: {e}")
        return False

def robust_call(func, *args, **kwargs):
    """Retries a function call with exponential backoff."""
    max_retries = 3
    for i in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if i == max_retries - 1:
                print(f"Failed after {max_retries} retries: {e}")
                return None
            time.sleep(1 * (2 ** i)) # 1s, 2s, 4s

def main():
    START_OFFSET = 8000
    offset = START_OFFSET
    total_processed = 0
    total_updated = 0

    print(f"Starting location backfill from offset {START_OFFSET}...")

    while True:
        try:
            sponsors = get_sponsors_batch(offset, BATCH_SIZE)
        except Exception as e:
            print(f"Error fetching batch at {offset}: {e}. Retrying in 5s...")
            time.sleep(5)
            continue

        if not sponsors:
            break

        print(f"Processing batch {offset} to {offset + len(sponsors)}...")

        updates_in_batch = 0
        
        for sponsor in sponsors:
            current_loc = sponsor.get('location', '')
            
            # Use robust wrapper for DB calls
            top_loc = robust_call(get_top_location, sponsor['id'])
            
            if top_loc and top_loc != current_loc:
                if robust_call(update_sponsor_location, sponsor['id'], top_loc):
                    updates_in_batch += 1
                    total_updated += 1
                    print(f"  Updated {sponsor['name'][:30]}: {current_loc} -> {top_loc}")
        
        total_processed += len(sponsors)
        offset += BATCH_SIZE
        
        # Simple progress tracking
        print(f"Batch complete. Updated {updates_in_batch}/{len(sponsors)}. Total updated since start: {total_updated}")
        time.sleep(0.5) 

    print(f"Done! Processed {total_processed} sponsors. Updated {total_updated} locations.")

if __name__ == "__main__":
    main()
