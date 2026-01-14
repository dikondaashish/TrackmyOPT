
import os
import glob

INPUT_FILE = 'supabase/seed_h1b.sql'
BATCH_SIZE = 1

# Cleanup old parts
for f in glob.glob('supabase/seed_part_*.sql'):
    os.remove(f)

try:
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print(f"Read {len(lines)} lines from {INPUT_FILE}")

    for i in range(0, len(lines), BATCH_SIZE):
        chunk = lines[i:i + BATCH_SIZE]
        part_num = i // BATCH_SIZE
        filename = f'supabase/seed_part_{part_num}.sql'
        with open(filename, 'w', encoding='utf-8') as out:
            out.writelines(chunk)

    print(f"Successfully split into {(len(lines) // BATCH_SIZE) + (1 if len(lines)%BATCH_SIZE else 0)} parts.")

except Exception as e:
    print(f"Error: {e}")
