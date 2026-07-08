import csv
import glob
import json
import os
from collections import defaultdict

from h1b_data_paths import repo_root, require_h1b_raw_data_dir

# Configuration
INVESTIGATION_DIR = require_h1b_raw_data_dir() / "Investigation"
OUTPUT_FILE = repo_root() / "apps" / "web" / "data" / "suspicious_addresses.json"
MIN_COMPANY_COUNT = 15  # Minimum companies at one address to flag as "Virtual/Cluster"

def normalize_address(addr):
    """
    Simple normalization to catch duplicates like "Suite 100" vs "Ste 100".
    """
    if not addr:
        return ""
    addr = addr.lower().strip()
    addr = addr.replace("suite", "ste").replace("floor", "fl").replace("building", "bldg")
    addr = addr.replace(".", "").replace(",", "")
    return addr

def analyze_addresses():
    address_counts = defaultdict(int)
    address_samples = defaultdict(list)
    
    # Get all State CSVs
    csv_files = glob.glob(os.path.join(str(INVESTIGATION_DIR), "*_Desi_Consultancy.csv"))
    print(f"Found {len(csv_files)} investigation files.")

    for file_path in csv_files:
        filename = os.path.basename(file_path)
        print(f"Processing {filename}...")
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                # Some files might not have headers or use | separator
                # Based on previous view_file, they use | separator
                # count|employer_name|employer_address1|employer_address2|employer_city
                
                content = f.read()
                lines = content.splitlines()
                
                # Check header
                if not lines:
                    continue
                    
                # Skip header if it exists
                start_idx = 0
                if "employer_name" in lines[0]:
                    start_idx = 1
                
                for line in lines[start_idx:]:
                    parts = line.split('|')
                    if len(parts) >= 5:
                        # count = parts[0]
                        # emp_name = parts[1]
                        addr1 = parts[2]
                        # addr2 = parts[3]
                        city = parts[4]
                        
                        # Create a unique key for the address (combining Addr1 + City)
                        # We ignore suite numbers (addr2) to find the BUILDING cluster
                        if addr1 and city:
                            full_addr_key = f"{normalize_address(addr1)}, {normalize_address(city)}"
                            address_counts[full_addr_key] += 1
                            
                            # Keep sample employer names for verification (limit to 5)
                            emp_name = parts[1]
                            if len(address_samples[full_addr_key]) < 5:
                                address_samples[full_addr_key].append(emp_name)

        except Exception as e:
            print(f"Error reading {filename}: {e}")

    # Filter for suspicious clusters
    suspicious_data = {}
    for addr, count in address_counts.items():
        if count >= MIN_COMPANY_COUNT:
            suspicious_data[addr] = {
                "count": count,
                "samples": address_samples[addr],
                "risk_level": "HIGH" if count > 50 else "MEDIUM",
                "type": "Virtual Office / Cluster"
            }

    print(f"\nFound {len(suspicious_data)} suspicious address clusters.")
    
    # Sort by count descending
    sorted_data = dict(sorted(suspicious_data.items(), key=lambda item: item[1]['count'], reverse=True))

    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(sorted_data, f, indent=2)
        
    print(f"Saved blocklist to {OUTPUT_FILE}")

if __name__ == "__main__":
    analyze_addresses()
