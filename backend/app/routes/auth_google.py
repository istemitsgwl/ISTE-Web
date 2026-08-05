import logging
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.config import settings
from app.database import get_mongo_db

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/auth", tags=["Google OAuth & Authentication"])

class GoogleLoginRequest(BaseModel):
    id_token: str

def create_jwt_token(data: dict) -> str:
    """Generates signed JWT access token for authenticated session."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

@router.post("/google")
async def google_login(payload: GoogleLoginRequest, db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """
    Authenticates administrative users via Google OAuth ID Token.
    Issues custom JWT access token upon authorization against MongoDB admins collection.
    """
    token_str = payload.id_token.strip()
    email = ""
    name = ""
    picture = ""

    try:
        # Verify Google OAuth 2.0 ID Token against setting Client ID
        id_info = id_token.verify_oauth2_token(
            token_str, 
            requests.Request(), 
            audience=settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        email = id_info.get("email", "").lower().strip()
        name = id_info.get("name", email.split("@")[0])
        picture = id_info.get("picture", "")
    except Exception as e:
        logger.warning(f"Google ID Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Google authentication token: {e}"
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token missing valid email claim"
        )

    # Query MongoDB admins collection
    admin_record = await db.admins.find_one({"email": email})

    # Auto-seed initial Super Admin if shivampatidar780@gmail.com
    if not admin_record and email == "shivampatidar780@gmail.com":
        super_admin_doc = {
            "email": email,
            "name": name or "Shivam Patidar",
            "role": "super_admin",
            "status": "active",
            "provider": "google",
            "picture": picture,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        res = await db.admins.insert_one(super_admin_doc)
        admin_record = await db.admins.find_one({"_id": res.inserted_id})
        logger.info(f"✓ Auto-seeded Super Admin account for '{email}'")

    if not admin_record or admin_record.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access the Admin Portal."
        )

    # Update lastLogin timestamp after successful authentication
    await db.admins.update_one(
        {"_id": admin_record["_id"]},
        {"$set": {"lastLogin": datetime.utcnow()}}
    )

    admin_id = str(admin_record.get("_id"))
    role = admin_record.get("role", "admin")

    # Generate JWT session token
    token_payload = {
        "sub": admin_id,
        "email": email,
        "name": admin_record.get("name", name),
        "role": role
    }
    jwt_access_token = create_jwt_token(token_payload)

    return {
        "access_token": jwt_access_token,
        "token_type": "bearer",
        "user": {
            "id": admin_id,
            "email": email,
            "name": admin_record.get("name", name),
            "role": role,
            "picture": admin_record.get("picture", picture)
        }
    }

class AdminDirectLoginRequest(BaseModel):
    email: str
    passcode: str = ""

@router.post("/admin-login")
async def admin_direct_login(payload: AdminDirectLoginRequest, db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """
    Direct Administrative Login Endpoint for authorized Super Admin accounts.
    """
    email = payload.email.lower().strip()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required."
        )

    admin_record = await db.admins.find_one({"email": email})

    # Auto-seed initial Super Admin for Shivam Patidar if missing
    if not admin_record and (email == "shivampatidar780@gmail.com" or email == "admin@iste-mits.edu.in"):
        super_admin_doc = {
            "email": email,
            "name": "Shivam Patidar",
            "role": "super_admin",
            "status": "active",
            "provider": "direct",
            "picture": "",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        res = await db.admins.insert_one(super_admin_doc)
        admin_record = await db.admins.find_one({"_id": res.inserted_id})

    if not admin_record or admin_record.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized admin email account. Contact Super Admin to grant access."
        )

    admin_id = str(admin_record.get("_id"))
    role = admin_record.get("role", "super_admin")
    name = admin_record.get("name", "Shivam Patidar")

    token_payload = {
        "sub": admin_id,
        "email": email,
        "name": name,
        "role": role
    }
    jwt_access_token = create_jwt_token(token_payload)

    return {
        "access_token": jwt_access_token,
        "token_type": "bearer",
        "user": {
            "id": admin_id,
            "email": email,
            "name": name,
            "role": role,
            "picture": admin_record.get("picture", "")
        }
    }

