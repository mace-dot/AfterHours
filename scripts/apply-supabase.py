"""Apply the reviewed, transactional migration using a proxy-bound management token.
Run once on an empty AfterHours project. Do not put a service-role key in the browser.
"""
import json
import os
from pathlib import Path
import sys
import urllib.request
import urllib.error

project = "plpvygpgymfwwkflauaa"
token = os.environ.get("SUPABASE_ACCESS_TOKEN")
if not token:
    sys.exit("Missing SUPABASE_ACCESS_TOKEN. Add it securely in environment settings for api.supabase.com, then rerun.")
query = Path("supabase/migrations/202610270001_circle.sql").read_text()
request = urllib.request.Request(
    f"https://api.supabase.com/v1/projects/{project}/database/query",
    data=json.dumps({"query": query}).encode(),
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(request, timeout=60) as response:
        response.read()  # DDL only; do not print credentials or database contents.
        print("Circle migration applied successfully.")
except urllib.error.HTTPError as error:
    sys.exit(f"Migration request failed: HTTP {error.code}. No success is claimed; inspect project status before retrying.")
