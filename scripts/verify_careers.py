import os
import time
import requests
from supabase import create_client, Client
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse, urljoin
from dotenv import load_dotenv

# Load env from apps/web/.env.local (assuming script is in root/scripts)
env_path = os.path.join(os.path.dirname(__file__), '../apps/web/.env.local')
load_dotenv(env_path)

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
    "/join-us",
    "/about-us/careers",
    "/employment"
]

SUBDOMAINS = [
    "careers.",
    "jobs.",
    "hr."
]

KNOWN_ATS_DOMAINS = [
    "myworkdayjobs.com", "taleo.net", "greenhouse.io", "lever.co", "icims.com", 
    "ultipro.com", "jobvite.com", "smartrecruiters.com", "bamboohr.com", 
    "ashbyhq.com", "recruitee.com", "workable.com", "paylocity.com",
    "adp.com", "paycom.com", "rippling.com", "force.com", "oraclecloud.com", 
    "successfactors.com", "careers.com", "jobs.com", "appone.com", "compyase.com",
    "applytojob.com", "brassring.com", "jobboard.io"
]

CAREER_KEYWORDS = [
    "career", "job", "opening", "vacancy", "employment", "work-with-us", 
    "join-us", "join-our-team", "join-team", "positions", "recruit", "talent", "hiring"
]

def safe_print(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        # Fallback for systems that can't print weird chars
        print(msg.encode('ascii', 'ignore').decode('ascii'), flush=True)

def callback_is_valid(final_url, original_base):
    """
    Smart Check: Is this REALLY a career page?
    1. If it redirected to a known ATS (e.g. Workday), return True.
    2. If it is on the same domain, does the path contain 'career'/'job'?
    3. Filter out 'conference', 'webinar', 'login', 'portal' to avoid false positives.
    """
    final_lower = final_url.lower()
    
    # Filter out obvious non-career pages
    blocklist = ["login", "signin", "portal.html", "conference", "webinar", "blog", "news", "press", "contact", "support", "investor"]
    if any(b in final_lower for b in blocklist):
        return False
        
    # 1. High Confidence: Known ATS Domain
    # We trust these domains usually host jobs.
    if any(ats in final_lower for ats in KNOWN_ATS_DOMAINS):
        return True
        
    # 2. Keyword Check
    # If the URL contains explicit career words, it's likely valid.
    if any(kw in final_lower for kw in CAREER_KEYWORDS):
        return True
        
    # 3. If exact path match from our common list didn't redirect, it's likely valid
    # e.g. /careers returning 200 OK without redirecting to /
    parsed_final = urlparse(final_url)
    parsed_orig = urlparse(original_base)
    
    if parsed_final.netloc == parsed_orig.netloc:
        # Same domain, check path length/hompage redirect
        if final_url.rstrip("/") == original_base.rstrip("/"):
            return False # Redirected to home
        # If it matches one of our common paths exactly, it's good
        for cp in COMMON_PATHS:
             if final_url.endswith(cp) or final_url.endswith(cp + "/"):
                 return True
                 
    return False

def check_url(url):
    """Checks if a URL returns a 200 OK or valid redirect."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'}
        # Shorter timeout to keep things moving
        response = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
        
        final_url = response.url
        status = response.status_code

        # If HEAD fails, try GET
        if status == 405 or status == 403:
             response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
             final_url = response.url
             status = response.status_code
        
        if status == 200:
            return final_url
            
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

    safe_print(f"Checking {name} ({website})...")

    try:
        # 1. Check direct subdomains (e.g. careers.google.com)
        domain = urlparse(website).netloc.replace("www.", "")
        
        # Don't try subdomains on generic domains like "gmail.com" (edge case)
        if len(domain.split('.')) >= 2: 
            for sub in SUBDOMAINS:
                candidate = f"https://{sub}{domain}"
                valid_url = check_url(candidate)
                if valid_url and callback_is_valid(valid_url, website):
                    safe_print(f"  FOUND Subdomain: {valid_url}")
                    return valid_url

        # 2. Check common paths on main domain
        for path in COMMON_PATHS:
            candidate = urljoin(website, path)
            valid_url = check_url(candidate)
            if valid_url and callback_is_valid(valid_url, website):
                 safe_print(f"  FOUND Path: {valid_url}")
                 return valid_url
                 
    except Exception as e:
        safe_print(f"  Error checking {name}: {e}")

    return None

def process_sponsor(sponsor):
    try:
        careers_url = find_career_page_for_sponsor(sponsor)
        
        # Prepare update payload
        final_val = careers_url if careers_url else "" # Use empty string so frontend treats it as falsy (fallback to Google)

        try:
            # safe_print(f"  -> SAVING: {final_val}")
            supabase.table("h1b_sponsors").update({"careers_url": final_val}).eq("id", sponsor["id"]).execute()
            return True if careers_url else False
        except Exception as e:
            safe_print(f"  Error saving {sponsor['name']}: {e}")

    except Exception as e:
        pass
    return False

def main():
    safe_print("Starting Career Link Validation (STRICT MODE)...")
    
    CHUNK_SIZE = 100
    page = 0
    total_found = 0
    
    while True:
        safe_print(f"Fetching batch (starting at offset {page * CHUNK_SIZE})...")
        try:
            # We don't use page offset here because processed items are removed from the view (is_("careers_url", "null"))
            # So always fetch the first 100 null items
            response = supabase.table("h1b_sponsors")\
                .select("id, name, website")\
                .is_("careers_url", "null")\
                .neq("website", "null")\
                .limit(CHUNK_SIZE)\
                .execute()
            
            sponsors = response.data
            if not sponsors:
                safe_print("No more sponsors to process.")
                break
                
            safe_print(f"Processing {len(sponsors)} sponsors...")
            
            # Parallel processing
            with ThreadPoolExecutor(max_workers=20) as executor: # Increased workers
                results = list(executor.map(process_sponsor, sponsors))
                
            found_in_batch = sum(1 for r in results if r)
            total_found += found_in_batch
            safe_print(f"Batch Complete. Found {found_in_batch} new career links. Total found this run: {total_found}")
            
            time.sleep(0.5)
            
        except Exception as e:
            safe_print(f"Critical Loop Error: {e}")
            time.sleep(5)

    safe_print(f"Done! Total career links found: {total_found}")

if __name__ == "__main__":
    main()
