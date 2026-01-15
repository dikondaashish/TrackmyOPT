#!/usr/bin/env python3
"""
Bulk update company career page URLs in Supabase.

This script fetches all H1B sponsors without websites and attempts to 
construct and validate their career page URLs.

Usage:
    python update_company_websites.py

Requirements:
    pip install supabase requests python-dotenv
"""

import os
import re
import time
import requests
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env.local
load_dotenv(".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Career page URL patterns to try
CAREER_PATTERNS = [
    "{domain}/careers",
    "{domain}/jobs", 
    "careers.{domain}",
    "jobs.{domain}",
    "{domain}/careers/",
    "{domain}/jobs/",
    "{domain}/work-with-us",
    "{domain}/join-us",
    "{domain}/career",
]

# Known company domain mappings for major employers
KNOWN_DOMAINS = {
    # Tech Giants
    "amazon": "amazon.jobs",
    "google": "careers.google.com",
    "microsoft": "careers.microsoft.com",
    "apple": "apple.com/careers",
    "meta": "metacareers.com",
    "facebook": "metacareers.com",
    "netflix": "jobs.netflix.com",
    "uber": "uber.com/careers",
    "lyft": "lyft.com/careers",
    "airbnb": "careers.airbnb.com",
    "salesforce": "salesforce.com/company/careers",
    "oracle": "oracle.com/careers",
    "ibm": "ibm.com/careers",
    "cisco": "jobs.cisco.com",
    "intel": "intel.com/jobs",
    "nvidia": "nvidia.com/careers",
    "adobe": "adobe.com/careers",
    "vmware": "careers.vmware.com",
    "dell": "jobs.dell.com",
    "hp": "jobs.hp.com",
    "hpe": "hpe.com/careers",
    "qualcomm": "qualcomm.com/company/careers",
    "broadcom": "broadcom.com/company/careers",
    "paypal": "paypal.com/careers",
    "stripe": "stripe.com/jobs",
    "square": "squareup.com/careers",
    "twitter": "careers.twitter.com",
    "x corp": "careers.twitter.com",
    "linkedin": "careers.linkedin.com",
    "snap": "snap.com/jobs",
    "pinterest": "pinterest.com/careers",
    "reddit": "redditinc.com/careers",
    "spotify": "spotifyjobs.com",
    "zoom": "zoom.us/careers",
    "slack": "slack.com/careers",
    "dropbox": "dropbox.com/jobs",
    "box": "box.com/careers",
    "github": "github.com/about/careers",
    "atlassian": "atlassian.com/company/careers",
    "twilio": "twilio.com/company/jobs",
    "shopify": "shopify.com/careers",
    "robinhood": "robinhood.com/careers",
    "coinbase": "coinbase.com/careers",
    "doordash": "careers.doordash.com",
    "instacart": "instacart.com/careers",
    "grubhub": "grubhub.com/careers",
    "databricks": "databricks.com/company/careers",
    "snowflake": "snowflake.com/careers",
    "palantir": "palantir.com/careers",
    "splunk": "splunk.com/careers",
    "servicenow": "servicenow.com/careers.html",
    "workday": "workday.com/en-us/company/careers.html",
    "zendesk": "zendesk.com/jobs",
    "hubspot": "hubspot.com/careers",
    
    # Consulting
    "infosys": "infosys.com/careers",
    "tata consultancy": "tcs.com/careers",
    "tcs": "tcs.com/careers",
    "wipro": "wipro.com/careers",
    "cognizant": "careers.cognizant.com",
    "accenture": "accenture.com/us-en/careers",
    "deloitte": "deloitte.com/us/en/careers.html",
    "pwc": "pwc.com/us/en/careers.html",
    "kpmg": "kpmg.com/xx/en/home/careers.html",
    "ernst": "ey.com/en_us/careers",
    "ey": "ey.com/en_us/careers",
    "mckinsey": "mckinsey.com/careers",
    "boston consulting": "bcg.com/careers",
    "bcg": "bcg.com/careers",
    "bain": "bain.com/careers",
    "capgemini": "capgemini.com/us-en/careers",
    "cgi": "cgi.com/en/careers",
    "hcl": "hcltech.com/careers",
    "tech mahindra": "techmahindra.com/careers",
    "l&t infotech": "ltimindtree.com/careers",
    "mindtree": "ltimindtree.com/careers",
    "mphasis": "mphasis.com/careers",
    "hexaware": "hexaware.com/careers",
    "virtusa": "virtusa.com/careers",
    "persistent": "persistent.com/careers",
    "zensar": "zensar.com/careers",
    "cyient": "cyient.com/careers",
    "compunnel": "compunnel.com/careers",
    
    # Finance
    "jpmorgan": "careers.jpmorgan.com",
    "jp morgan": "careers.jpmorgan.com",
    "goldman sachs": "goldmansachs.com/careers",
    "goldman": "goldmansachs.com/careers",
    "morgan stanley": "morganstanley.com/careers",
    "bank of america": "careers.bankofamerica.com",
    "bofa": "careers.bankofamerica.com",
    "wells fargo": "wellsfargojobs.com",
    "citibank": "jobs.citi.com",
    "citi": "jobs.citi.com",
    "capital one": "capitalone.com/careers",
    "american express": "americanexpress.com/careers",
    "amex": "americanexpress.com/careers",
    "visa": "visa.com/careers",
    "mastercard": "mastercard.com/careers",
    "fidelity": "fidelitycareers.com",
    "charles schwab": "schwab.com/careers",
    "schwab": "schwab.com/careers",
    "blackrock": "blackrock.com/careers",
    "vanguard": "vanguard.com/careers",
    "state street": "statestreet.com/careers.html",
    "ubs": "ubs.com/careers",
    "credit suisse": "credit-suisse.com/careers",
    "deutsche bank": "db.com/careers",
    "barclays": "barclays.com/careers",
    "hsbc": "hsbc.com/careers",
    "bnp paribas": "group.bnpparibas/en/careers",
    "bloomberg": "bloomberg.com/careers",
    "geico": "careers.geico.com",
    "progressive": "progressive.com/careers",
    "allstate": "allstate.com/careers",
    "liberty mutual": "libertymutual.com/careers",
    "travelers": "travelers.com/careers",
    
    # Healthcare
    "unitedhealth": "careers.unitedhealthgroup.com",
    "uhg": "careers.unitedhealthgroup.com",
    "optum": "optum.com/careers",
    "anthem": "elevancehealth.com/careers",
    "elevance": "elevancehealth.com/careers",
    "cigna": "jobs.cigna.com",
    "humana": "careers.humana.com",
    "cvs": "jobs.cvshealth.com",
    "aetna": "jobs.cvshealth.com",
    "caremark": "jobs.cvshealth.com",
    "walgreens": "jobs.walgreens.com",
    "pfizer": "pfizer.com/careers",
    "johnson & johnson": "careers.jnj.com",
    "j&j": "careers.jnj.com", 
    "merck": "jobs.merck.com",
    "abbvie": "abbvie.com/careers",
    "bristol-myers": "bms.com/careers",
    "eli lilly": "careers.lilly.com",
    "lilly": "careers.lilly.com",
    "amgen": "amgen.com/careers",
    "gilead": "gilead.com/careers",
    "regeneron": "regeneron.com/careers",
    "biogen": "biogen.com/careers",
    "moderna": "modernatx.com/careers",
    "medtronic": "jobs.medtronic.com",
    "abbott": "abbott.com/careers",
    "boston scientific": "bostonscientific.com/careers",
    "stryker": "stryker.com/careers",
    "becton dickinson": "jobs.bd.com",
    "bd": "jobs.bd.com",
    "danaher": "danaher.com/careers",
    "thermo fisher": "thermofisher.com/careers",
    "agilent": "agilent.com/careers",
    "illumina": "illumina.com/careers",
    "quest diagnostics": "questdiagnostics.com/careers",
    "labcorp": "labcorp.com/careers",
    "mayo clinic": "jobs.mayoclinic.org",
    "cleveland clinic": "jobs.clevelandclinic.org",
    "kaiser": "jobs.kaiserpermanente.org",
    
    # Retail
    "walmart": "careers.walmart.com",
    "wal-mart": "careers.walmart.com",
    "target": "jobs.target.com",
    "costco": "costco.com/jobs",
    "kroger": "jobs.kroger.com",
    "home depot": "careers.homedepot.com",
    "lowes": "jobs.lowes.com",
    "lowe's": "jobs.lowes.com",
    "best buy": "bestbuy-jobs.com",
    "macy's": "jobs.macys.com",
    "macys": "jobs.macys.com",
    "nordstrom": "nordstrom.com/careers",
    "tj maxx": "tjx.com/careers",
    "tjx": "tjx.com/careers",
    "ross": "rosscareers.com",
    "dollar general": "dollargeneral.com/careers",
    "dollar tree": "dollartree.com/careers",
    "albertsons": "albertsonscompanies.com/careers",
    "publix": "publix.com/careers",
    "aldi": "careers.aldi.us",
    "trader joe's": "traderjoes.com/careers",
    "whole foods": "wholefoodsmarket.com/careers",
    "sephora": "sephora.com/careers",
    "ulta": "careers.ulta.com",
    "gap": "gapinc.com/careers",
    "nike": "jobs.nike.com",
    "under armour": "underarmour.jobs",
    "lululemon": "shop.lululemon.com/careers",
    "vf corporation": "vfc.com/careers",
    
    # Universities - Construct dynamically later
    "university": None,  # Handle separately
    "college": None,
    "institute": None,
    
    # Automotive
    "tesla": "tesla.com/careers",
    "ford": "corporate.ford.com/careers",
    "general motors": "gm.com/careers",
    "gm": "gm.com/careers",
    "toyota": "toyota.com/usa/careers",
    "honda": "hondacareer.com",
    "nissan": "nissan-jobs.com",
    "bmw": "bmwusfactory.com/careers",
    "mercedes": "mercedes-benzusa.com/careers",
    "stellantis": "careers.stellantis.com",
    "chrysler": "careers.stellantis.com",
    "jeep": "careers.stellantis.com",
    "rivian": "rivian.com/careers",
    "lucid": "lucidmotors.com/careers",
    
    # Airlines & Travel
    "american airlines": "jobs.aa.com",
    "delta": "delta.com/careers",
    "united airlines": "united.com/careers",
    "southwest": "careers.southwestair.com",
    "jetblue": "jetblue.com/careers",
    "marriott": "careers.marriott.com",
    "hilton": "jobs.hilton.com",
    "hyatt": "hyatt.com/careers",
    "ihg": "careers.ihg.com",
    "wyndham": "wyndhamhotels.com/careers",
    "airbnb": "careers.airbnb.com",
    "booking.com": "careers.booking.com",
    "expedia": "careers.expediagroup.com",
    "tripadvisor": "tripadvisor.com/careers",
    
    # Telecom
    "at&t": "att.jobs",
    "att": "att.jobs",
    "verizon": "verizon.com/careers",
    "t-mobile": "t-mobile.com/careers",
    "comcast": "jobs.comcast.com",
    "charter": "jobs.spectrum.com",
    "spectrum": "jobs.spectrum.com",
    "cox": "jobs.coxenterprises.com",
    "dish": "dish.com/careers",
    
    # Energy
    "exxon": "corporate.exxonmobil.com/careers",
    "exxonmobil": "corporate.exxonmobil.com/careers",
    "chevron": "chevron.com/careers",
    "conocophillips": "conocophillips.com/careers",
    "shell": "shell.com/careers",
    "bp": "bp.com/careers",
    "schlumberger": "slb.com/careers",
    "halliburton": "halliburton.com/careers",
    "baker hughes": "bakerhughes.com/careers",
    
    # Manufacturing
    "boeing": "jobs.boeing.com",
    "lockheed": "lockheedmartinjobs.com",
    "raytheon": "rtx.com/careers",
    "rtx": "rtx.com/careers",
    "northrop": "careers.northropgrumman.com",
    "general electric": "ge.com/careers",
    "ge": "ge.com/careers",
    "honeywell": "careers.honeywell.com",
    "3m": "3m.com/careers",
    "caterpillar": "caterpillar.com/careers",
    "deere": "deere.com/careers",
    "john deere": "deere.com/careers",
    "parker hannifin": "parker.com/careers",
    "emerson": "emerson.com/careers",
    "rockwell": "rockwellautomation.com/careers",
    "illinois tool works": "itw.com/careers",
    "itw": "itw.com/careers",
}


def get_supabase_client() -> Client:
    """Initialize Supabase client."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def normalize_company_name(name: str) -> str:
    """Normalize company name for matching."""
    name = name.lower()
    # Remove common suffixes
    suffixes = [
        " inc", " incorporated", " corp", " corporation", " llc", " llp",
        " ltd", " limited", " co", " company", " & co", " group",
        " holdings", " services", " solutions", " systems", " technologies",
        " technology", " software", " consulting", " associates", " partners",
        " plc", " sa", " ag", " gmbh", " n.a.", " na", " usa", " us", " america",
        " international", " global", " worldwide", ",", "."
    ]
    for suffix in suffixes:
        name = name.replace(suffix, "")
    return name.strip()


def construct_domain_from_name(name: str) -> str:
    """Construct likely domain from company name."""
    normalized = normalize_company_name(name)
    # Remove special characters and spaces
    domain_name = re.sub(r'[^a-z0-9]', '', normalized)
    return f"{domain_name}.com"


def find_known_domain(company_name: str) -> Optional[str]:
    """Check if company matches a known domain mapping."""
    normalized = normalize_company_name(company_name)
    
    for key, domain in KNOWN_DOMAINS.items():
        if domain is None:
            continue
        if key in normalized or normalized in key:
            return f"https://{domain}"
    
    return None


def validate_url(url: str, timeout: int = 5) -> bool:
    """Check if URL is reachable."""
    try:
        response = requests.head(url, timeout=timeout, allow_redirects=True)
        return response.status_code < 400
    except:
        try:
            response = requests.get(url, timeout=timeout, allow_redirects=True)
            return response.status_code < 400
        except:
            return False


def find_career_url(company_name: str, validate: bool = False) -> Optional[str]:
    """Find career URL for a company."""
    # First check known domains
    known_url = find_known_domain(company_name)
    if known_url:
        if not validate or validate_url(known_url):
            return known_url
    
    # Construct domain from name and try patterns
    base_domain = construct_domain_from_name(company_name)
    
    for pattern in CAREER_PATTERNS:
        url = "https://" + pattern.format(domain=base_domain)
        if validate:
            if validate_url(url):
                return url
        else:
            # Return first pattern without validation
            return url
    
    return None


def process_batch(supabase: Client, companies: list, validate: bool = False) -> dict:
    """Process a batch of companies and update their websites."""
    results = {"updated": 0, "failed": 0, "skipped": 0}
    
    for company in companies:
        company_id = company["id"]
        company_name = company["name"]
        
        career_url = find_career_url(company_name, validate=validate)
        
        if career_url:
            try:
                supabase.table("h1b_sponsors").update(
                    {"website": career_url}
                ).eq("id", company_id).execute()
                results["updated"] += 1
                print(f"  ✓ {company_name[:50]}: {career_url}")
            except Exception as e:
                print(f"  ✗ {company_name[:50]}: Error updating - {e}")
                results["failed"] += 1
        else:
            results["skipped"] += 1
            print(f"  - {company_name[:50]}: No URL found")
    
    return results


def main():
    """Main function to update all company websites."""
    print("=" * 60)
    print("H1B Sponsor Career URL Bulk Updater")
    print("=" * 60)
    
    supabase = get_supabase_client()
    
    # Count companies without websites
    count_result = supabase.table("h1b_sponsors").select("id", count="exact").or_(
        "website.is.null,website.eq.,website.eq.No site"
    ).execute()
    
    total_missing = count_result.count
    print(f"\nTotal companies without websites: {total_missing:,}")
    
    if total_missing == 0:
        print("All companies already have websites!")
        return
    
    # Process in batches
    batch_size = 100
    offset = 0
    total_updated = 0
    total_failed = 0
    total_skipped = 0
    
    print(f"\nProcessing in batches of {batch_size}...")
    print("Note: Using known domain mappings (no URL validation for speed)")
    print("-" * 60)
    
    while offset < total_missing:
        print(f"\nBatch {offset // batch_size + 1} ({offset} - {min(offset + batch_size, total_missing)} of {total_missing})")
        
        # Fetch batch
        result = supabase.table("h1b_sponsors").select("id, name").or_(
            "website.is.null,website.eq.,website.eq.No site"
        ).range(offset, offset + batch_size - 1).execute()
        
        if not result.data:
            break
        
        # Process batch (without URL validation for speed)
        batch_results = process_batch(supabase, result.data, validate=False)
        
        total_updated += batch_results["updated"]
        total_failed += batch_results["failed"]
        total_skipped += batch_results["skipped"]
        
        offset += batch_size
        
        # Small delay to avoid rate limiting
        time.sleep(0.1)
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total Updated:  {total_updated:,}")
    print(f"Total Failed:   {total_failed:,}")
    print(f"Total Skipped:  {total_skipped:,}")
    print("=" * 60)


if __name__ == "__main__":
    main()
