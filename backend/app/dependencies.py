import logging
import jwt
from fastapi import Depends, HTTPException, status, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from app.config import settings
from app.database import get_mongo_db, get_mongo_db as get_db

logger = logging.getLogger("uvicorn")

def get_token_from_header(authorization: str = Header(...)) -> str:
    """Helper to extract token from Authorization: Bearer <token> header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Use 'Bearer <JWT>'",
        )
    return authorization.split(" ")[1]

async def get_current_user(
    token: str = Depends(get_token_from_header),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
) -> dict:
    """
    Decodes custom JWT access token or directly verifies Google OAuth ID token,
    and verifies active session in MongoDB admins collection.
    """
    email = ""
    # 1. Attempt decoding as signed custom session JWT
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email = payload.get("email", "").lower().strip()
    except jwt.PyJWTError:
        # 2. Fallback: Check if token is a direct Google OAuth ID token
        configured_audiences = [
            cid.strip() for cid in settings.GOOGLE_CLIENT_ID.split(",") if cid.strip()
        ]
        default_prod_client_id = "1009258419935-1dgi30dfn1ev51v3gs4145cu26ibclmq.apps.googleusercontent.com"
        if default_prod_client_id not in configured_audiences:
            configured_audiences.append(default_prod_client_id)

        id_info = None
        for aud in configured_audiences:
            try:
                id_info = google_id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    audience=aud,
                    clock_skew_in_seconds=60
                )
                if id_info:
                    break
            except Exception:
                continue

        if id_info and id_info.get("email_verified", False):
            email = id_info.get("email", "").lower().strip()
            # If bootstrap Super Admin is connecting with valid Google ID token, auto-seed if needed
            if email in settings.super_admin_emails():
                existing = await db.admins.find_one({"email": email})
                if not existing:
                    from datetime import datetime
                    seed_doc = {
                        "email": email,
                        "name": id_info.get("name", "Super Admin"),
                        "role": "super_admin",
                        "status": "active",
                        "provider": "google",
                        "picture": id_info.get("picture", ""),
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    }
                    await db.admins.insert_one(seed_doc)
                    logger.info(f"✓ Auto-seeded Super Admin account for '{email}' via ID token")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials"
        )

    admin_doc = await db.admins.find_one({"email": email})
    if not admin_doc and email in settings.super_admin_emails():
        from datetime import datetime
        seed_doc = {
            "email": email,
            "name": "Super Admin",
            "role": "super_admin",
            "status": "active",
            "provider": "google",
            "picture": "",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        res = await db.admins.insert_one(seed_doc)
        admin_doc = await db.admins.find_one({"_id": res.inserted_id})
        logger.info(f"✓ Auto-seeded Super Admin account for '{email}'")

    if not admin_doc or admin_doc.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or revoked"
        )

    admin_doc["id"] = str(admin_doc["_id"])
    return admin_doc

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Asserts that authenticated user has Super Admin or Admin privileges."""
    user_role = (current_user.get("role") or "").lower()
    if user_role not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource",
        )
    return current_user

async def require_super_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Asserts that authenticated user has Super Admin privileges."""
    user_role = (current_user.get("role") or "").lower()
    if user_role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privileges required to perform this action",
        )
    return current_user
