import logging
import jwt
from fastapi import Depends, HTTPException, status, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
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
    """Decodes custom JWT access token and verifies active session in MongoDB."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email = payload.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload missing user identifier"
            )
            
        admin_doc = await db.admins.find_one({"email": email})
        if not admin_doc or admin_doc.get("status") != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or revoked"
            )
            
        admin_doc["id"] = str(admin_doc["_id"])
        return admin_doc
    except jwt.PyJWTError as e:
        logger.warning(f"JWT Token validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials"
        )

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
