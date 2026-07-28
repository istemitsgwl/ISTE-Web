from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user, get_db
from app.schemas.user import UserProfileUpdate, UserProfile
from google.cloud.firestore_v1 import Client
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users & Authentication"])

@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: dict = Depends(get_current_user)):
    """Retrieves the authenticated user's profile metadata."""
    return current_user

@router.put("/profile", response_model=UserProfile)
def update_profile(
    payload: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Updates user information (college, phone, branch, enrollment) in Firestore."""
    uid = current_user.get("uid")
    
    update_data = payload.model_dump()
    update_data["updatedAt"] = datetime.utcnow()
    
    try:
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            # First time completing profile
            update_data["uid"] = uid
            update_data["email"] = current_user.get("email")
            update_data["role"] = current_user.get("role", "user")
            update_data["createdAt"] = datetime.utcnow()
            user_ref.set(update_data)
        else:
            # Existing profile update
            user_ref.update(update_data)
            
        # Get updated document
        updated_doc = user_ref.get().to_dict()
        return updated_doc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failed: {e}"
        )
