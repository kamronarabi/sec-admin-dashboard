import os
from pathlib import Path

# Load .env.local so the script works both standalone and via Next.js API
_env_local = Path(__file__).parent.parent / ".env.local"
if _env_local.exists():
    with open(_env_local) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())

# Path to the service account credentials JSON file
SERVICE_ACCOUNT_FILE = os.getenv(
    "GOOGLE_SERVICE_ACCOUNT_FILE",
    str(Path(__file__).parent / "service-account.json"),
)

# Google Sheets spreadsheet ID (from the URL)
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "")

# SQLite database path
DATABASE_PATH = os.getenv(
    "DATABASE_PATH",
    str(Path(__file__).parent.parent / "data" / "sec-dashboard.db"),
)

# The first sheet name that contains event metadata
EVENTS_SHEET_NAME = os.getenv("EVENTS_SHEET_NAME", "Events")
