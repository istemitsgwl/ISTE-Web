"""One-off admin bootstrap tool.

Promotes (or creates) an account as an active Super Admin in the admins
collection, so the "Admins Management" tab appears for them in the dashboard
and they can grant access to others from the UI.

Usage:
    # MONGODB_URI must be set in the environment or in backend/.env
    python scripts/make_super_admin.py someone@gmail.com "Full Name"

Requires: pip install pymongo python-dotenv (python-dotenv optional).
"""

import os
import sys
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))
except ImportError:
    pass

from pymongo import MongoClient


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/make_super_admin.py <email> [\"Full Name\"]")
        return 1

    email = sys.argv[1].lower().strip()
    name = sys.argv[2].strip() if len(sys.argv) > 2 else email.split("@")[0]

    uri = os.environ.get("MONGODB_URI")
    if not uri:
        print("ERROR: set the MONGODB_URI environment variable (or backend/.env) first.")
        return 1

    db_name = os.environ.get("MONGODB_DB_NAME", "iste_mits_db")
    db = MongoClient(uri, serverSelectionTimeoutMS=15000)[db_name]

    existing = db.admins.find_one({"email": email})
    now = datetime.utcnow()
    if existing:
        db.admins.update_one(
            {"email": email},
            {"$set": {"role": "super_admin", "status": "active", "updatedAt": now}},
        )
        print(f"✓ Existing account '{email}' promoted to active Super Admin.")
    else:
        db.admins.insert_one({
            "name": name,
            "email": email,
            "role": "super_admin",
            "status": "active",
            "provider": "google",
            "picture": "",
            "createdAt": now,
            "updatedAt": now,
        })
        print(f"✓ New Super Admin account created for '{email}'.")

    print("They can now sign in with Google at /patidar/admin — the 'Admins Management' tab will be visible.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
