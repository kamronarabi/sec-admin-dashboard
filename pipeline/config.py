import os
from pathlib import Path

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
