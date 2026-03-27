#!/usr/bin/env python3
"""
One-time Gmail OAuth2 setup script.

Runs the OAuth consent flow to obtain a refresh token for the SEC Gmail account.
Prints the environment variables to paste into .env.local.

Usage:
    python3 setup_gmail_oauth.py [path/to/client_secret.json]
"""

import json
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]

DEFAULT_SECRET_PATH = "client_secret.json"


def main():
    secret_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SECRET_PATH

    try:
        with open(secret_path) as f:
            client_config = json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Client secret file not found: {secret_path}")
        print("Download it from Google Cloud Console > APIs & Services > Credentials")
        sys.exit(1)

    flow = InstalledAppFlow.from_client_secrets_file(secret_path, scopes=SCOPES)
    creds = flow.run_local_server(port=8085)

    # Extract client ID and secret from the config file
    key = "installed" if "installed" in client_config else "web"
    client_id = client_config[key]["client_id"]
    client_secret = client_config[key]["client_secret"]

    print("\n" + "=" * 60)
    print("Add these to your .env.local:")
    print("=" * 60)
    print(f"GMAIL_CLIENT_ID={client_id}")
    print(f"GMAIL_CLIENT_SECRET={client_secret}")
    print(f"GMAIL_REFRESH_TOKEN={creds.refresh_token}")
    print("=" * 60)


if __name__ == "__main__":
    main()
