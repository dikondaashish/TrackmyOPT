import os
import time
import requests
from supabase import create_client, Client
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse, urljoin

# Configuration
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role Key for writing!

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Environment Variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
    print("Usage: SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... python3 scripts/verify_careers.py")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

COMMON_PATHS = [
    "/careers",
    "/jobs",
    "/en/careers",
    "/about/careers",
    "/work-with-us",
    "/join-us"
]

SUBDOMAINS = [
    "careers.",
    "jobs."
]

def check_url(url):
    """Checks if a URL returns a 200 OK or valid redirect."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'}
        response = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
        if response.status_code == 200:
            return response.url
        # Try GET if HEAD fails (some servers block HEAD)
        if response.status_code == 405:
            response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
            if response.status_code == 200:
                return response.url
    except Exception:
        pass
    return None

def find_career_page_for_sponsor(sponsor):
    """
    Attempts to find a valid career page for a sponsor.
    Returns the valid URL or None.
    """
    website = sponsor.get("website")
    name = sponsor.get("name")
    
    if not website:
        return None

    # Normalize website
    if not website.startswith("http"):
        website = "https://" + website

    print(f"Checking {name} ({website})...")

    # 1. Check direct subdomains (e.g. careers.google.com)
    domain = urlparse(website).netloc.replace("www.", "")
    for sub in SUBDOMAINS:
        candidate = f"https://{sub}{domain}"
        valid_url = check_url(candidate)
        if valid_url:
            print(f"  FOUND Subdomain: {valid_url}")
            return valid_url

    # 2. Check common paths on main domain
    for path in COMMON_PATHS:
        candidate = urljoin(website, path)
        valid_url = check_url(candidate)
        if valid_url:
             # Check if it didn't just redirect back to home (common false positive)
             # Simple heuristic: path length > 1 or contains "career"
             if callback_is_valid(valid_url, website):
                 print(f"  FOUND Path: {valid_url}")
                 return valid_url

    print(f"  No direct match found for {name}")
    return None

def callback_is_valid(final_url, original_base):
    """Rudimentary check to ensure we didn't just get redirected to homepage."""
    if final_url.rstrip("/") == original_base.rstrip("/"):
        return False
    return True

def process_sponsor(sponsor):
    careers_url = find_career_page_for_sponsor(sponsor)
    if careers_url:
        # Update Database
        try:
            supabase.table("h1b_sponsors").update({"careers_url": careers_url}).eq("id", sponsor["id"]).execute()
            return True
        except Exception as e:
            print(f"  Error saving {sponsor['name']}: {e}")
    return False

def main():
    print("Starting Career Link Validation...")
    
    # 1. Fetch sponsors without careers_url
    # Fetch in chunks to handle large dataset
    CHUNK_SIZE = 100
    page = 0
    total_found = 0
    
    while True:
        print(f"Fetching page {page}...")
        response = supabase.table("h1b_sponsors")\
            .select("id, name, website")\
            .is_("careers_url", "null")\
            .neq("website", "null")\
            .range(page * CHUNK_SIZE, (page + 1) * CHUNK_SIZE - 1)\
            .execute()
        
        sponsors = response.data
        if not sponsors:
            print("No more sponsors to process.")
            break
            
        print(f"Processing {len(sponsors)} sponsors...")
        
        # Parallel processing
        with ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(process_sponsor, sponsors))
            
        found_in_batch = sum(1 for r in results if r)
        total_found += found_in_batch
        print(f"Batch Complete. Found {found_in_batch} career links.")
        
        page += 1
        time.sleep(1) # Rate limit protection

    print(f"Done! Total career links found: {total_found}")

if __name__ == "__main__":
    main()
