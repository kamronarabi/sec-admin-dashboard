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

# SQLite database path
DATABASE_PATH = os.getenv(
    "DATABASE_PATH",
    str(Path(__file__).parent.parent / "data" / "sec-dashboard.db"),
)


def get_config_from_db(source: str, key: str, fallback: str = "") -> str:
    """Read a config value from the pipeline_config table, falling back to the given default."""
    import sqlite3
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        row = conn.execute(
            "SELECT config_value FROM pipeline_config WHERE source = ? AND config_key = ?",
            (source, key),
        ).fetchone()
        conn.close()
        if row and row[0]:
            return row[0]
    except Exception:
        pass
    return fallback


# Google Sheets spreadsheet ID — check DB first, then env var
SPREADSHEET_ID = get_config_from_db(
    "google_sheets", "spreadsheet_id", os.getenv("SPREADSHEET_ID", "")
)

# The first sheet name that contains event metadata
EVENTS_SHEET_NAME = os.getenv("EVENTS_SHEET_NAME", "Events")

# Gmail OAuth2 credentials
GMAIL_CLIENT_ID = os.getenv("GMAIL_CLIENT_ID", "")
GMAIL_CLIENT_SECRET = os.getenv("GMAIL_CLIENT_SECRET", "")
GMAIL_REFRESH_TOKEN = os.getenv("GMAIL_REFRESH_TOKEN", "")


def get_gmail_credentials():
    """Return OAuth2 Credentials for the Gmail API."""
    from google.oauth2.credentials import Credentials

    return Credentials(
        token=None,
        refresh_token=GMAIL_REFRESH_TOKEN,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GMAIL_CLIENT_ID,
        client_secret=GMAIL_CLIENT_SECRET,
        scopes=[
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
        ],
    )
