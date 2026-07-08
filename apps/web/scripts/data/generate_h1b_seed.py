
import csv
import re
import json
from collections import defaultdict
from datetime import datetime

import os

from h1b_data_paths import repo_root, require_h1b_raw_data_dir

script_dir = os.path.dirname(os.path.abspath(__file__))
repo_root_path = repo_root()

INPUT_FILE = require_h1b_raw_data_dir() / "Jobs" / "New_H1B_Tech_Jobs.csv"
OUTPUT_SQL = repo_root_path / "supabase" / "seed_h1b.sql"

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def get_year(date_str):
    if not date_str: return None
    try:
        if '-' in date_str:
            return int(date_str.split('-')[0])
        elif '/' in date_str:
            return int(date_str.split('/')[-1])
    except:
        return None
    return None

sponsors = defaultdict(lambda: {
    'name': '',
    'industry': 'Tech',
    'locations': set(),
    'job_titles': set(),
    'approvals': defaultdict(int),
    'size': 'Startup',
    'strength': 'Low'
})

print("Reading CSV...")
try:
    with open(INPUT_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f, delimiter='|')
        for row in reader:
            name = (row.get('employer_name') or '').strip()
            if not name: continue
            
            s = sponsors[name]
            s['name'] = name
            
            # Location
            state = (row.get('employer_state') or '').strip()
            if state: s['locations'].add(state)
            
            # Job Title
            title = (row.get('job_title') or '').strip()
            if title: s['job_titles'].add(title)
            
            # Year
            begin_date = (row.get('begin_date') or '')
            year = get_year(begin_date)
            if year:
                s['approvals'][year] += 1
                
except Exception as e:
    print(f"Error reading CSV: {e}")
    exit(1)

print(f"Found {len(sponsors)} unique names. Consolidating logic...")

# Consolidate by slug (handle 'AAA Inc' vs 'AAA INC')
sponsors_by_slug = {}

for name, data in sponsors.items():
    slug = slugify(name)
    if slug in sponsors_by_slug:
        # Merge
        existing = sponsors_by_slug[slug]
        for year, count in data['approvals'].items():
            existing['approvals'][year] += count
        existing['locations'].update(data['locations'])
        existing['job_titles'].update(data['job_titles'])
        
        # Prefer Title Case
        if existing['name'].isupper() and not name.isupper():
            existing['name'] = name
    else:
        sponsors_by_slug[slug] = data

print(f"Reduced to {len(sponsors_by_slug)} unique slugs. Generating SQL...")

values_list = []

# Sort for deterministic output
for slug in sorted(sponsors_by_slug.keys()):
    data = sponsors_by_slug[slug]
    name = data['name']
    
    total_approvals = sum(data['approvals'].values())
    
    if total_approvals >= 100: strength = 'High'
    elif total_approvals >= 25: strength = 'Medium'
    else: strength = 'Low'
    
    if total_approvals >= 100: size = 'Enterprise'
    elif total_approvals >= 20: size = 'Mid'
    else: size = 'Startup'
    
    common_roles = list(data['job_titles'])[:5]
    roles_formatted = [f'"{r.replace("\"", "\\\"").replace("\'", "\'\'")}"' for r in common_roles]
    roles_str = "{" + ",".join(roles_formatted) + "}"
    
    location = list(data['locations'])[0] if data['locations'] else ''
    
    safe_name = name.replace("'", "''")
    safe_loc = location.replace("'", "''")
    
    val = f"('{slug}', '{safe_name}', 'Tech', '{size}', '{safe_loc}', '', {data['approvals'].get(2021, 0)}, {data['approvals'].get(2022, 0)}, {data['approvals'].get(2023, 0)}, {data['approvals'].get(2024, 0)}, '{strength}', '{roles_str}')"
    values_list.append(val)

with open(OUTPUT_SQL, 'w') as f:
    f.write("TRUNCATE TABLE h1b_sponsors;\n")
    
    chunk_size = 50
    for i in range(0, len(values_list), chunk_size):
        chunk = values_list[i:i+chunk_size]
        stmt = f"INSERT INTO h1b_sponsors (id, name, industry, size, location, website, approvals_2021, approvals_2022, approvals_2023, approvals_2024, sponsorship_strength, common_roles) VALUES "
        stmt += ",".join(chunk)
        stmt += ";\n"
        f.write(stmt)

print(f"SQL seed generated at {OUTPUT_SQL} with {len(values_list)} records.")
