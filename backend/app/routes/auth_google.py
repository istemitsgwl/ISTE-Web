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
from app.rate_limit import RateLimiter

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/auth", tags=["Google OAuth & Authentication"])

class GoogleLoginRequest(BaseModel):
    id_token: str

def create_jwt_token(data: dict) -> str:
    """Generates signed JWT access token for authenticated session."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

@router.post(
    "/google",
    dependencies=[Depends(RateLimiter(times=10, seconds=60, scope="auth_google"))],
)
async def google_login(payload: GoogleLoginRequest, db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """
    Authenticates administrative users via Google OAuth ID Token.
    Issues custom JWT access token upon authorization against MongoDB admins collection.
    """
    token_str = payload.id_token.strip()
    email = ""
    name = ""
    picture = ""

    # Prepare allowed audiences list (support comma-separated env values and default prod ID)
    default_prod_client_id = "1009258419935-1dgi30dfn1ev51v3gs4145cu26ibclmq.apps.googleusercontent.com"
    configured_audiences = [
        cid.strip() for cid in settings.GOOGLE_CLIENT_ID.split(",") if cid.strip()
    ]
    if default_prod_client_id not in configured_audiences:
        configured_audiences.append(default_prod_client_id)

    id_info = None
    last_verification_error = None

    for aud in configured_audiences:
        try:
            id_info = id_token.verify_oauth2_token(
                token_str,
                requests.Request(),
                audience=aud,
                clock_skew_in_seconds=60
            )
            if id_info:
                break
        except Exception as e:
            last_verification_error = e

    if not id_info:
        logger.warning(
            f"Google ID Token verification failed for token. Allowed audiences: {configured_audiences}. Error: {last_verification_error}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Google authentication token: {last_verification_error}"
        )

    email = id_info.get("email", "").lower().strip()
    name = id_info.get("name", email.split("@")[0])
    picture = id_info.get("picture", "")

    if not email or not id_info.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email is missing or unverified."
        )

    # Query MongoDB admins collection
    admin_record = await db.admins.find_one({"email": email})

    # Auto-seed the configured initial Super Admin account on first login
    if not admin_record and settings.SUPER_ADMIN_EMAIL and email == settings.SUPER_ADMIN_EMAIL.lower().strip():
        super_admin_doc = {
            "email": email,
            "name": name or "Super Admin",
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
