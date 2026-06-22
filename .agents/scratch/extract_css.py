import re

backup_path = r"c:\Users\HT90\Downloads\backup_2026-06-17-1315_WEDTECH_SHOW_2026_B2B_Wedding__0de30d81ead9-db (1)"

print("Searching for custom_css...")

# We can search lines that have custom_css
with open(backup_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line_idx, line in enumerate(f, 1):
        if 'custom_css' in line:
            # print line number and start/end of line to get context
            snippet = line[:200]
            print(f"Line {line_idx}: {snippet}...")
