import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.dependencies import get_current_user, get_mongo_db
from app.schemas.user import UserProfileUpdate, UserProfile

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/users", tags=["Users & Authentication"])

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Retrieves the authenticated user's profile metadata."""
    return current_user

@router.put("/profile")
async def update_profile(
    payload: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Updates administrative user information in MongoDB."""
    email = current_user.get("email")
    update_data = payload.model_dump(exclude_unset=True)
    update_data["updatedAt"] = datetime.utcnow()
    
    try:
        await db.admins.update_one({"email": email}, {"$set": update_data})
        updated = await db.admins.find_one({"email": email})
        if updated:
            updated["id"] = str(updated["_id"])
            updated.pop("_id", None)
            return updated
        return current_user
    except Exception:
        logger.exception("Profile update failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed."
        )
