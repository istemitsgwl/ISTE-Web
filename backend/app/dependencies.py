from fastapi import Depends, HTTPException, status, Header
from app.firebase import verify_token, get_db
from google.cloud.firestore_v1 import Client
import logging

logger = logging.getLogger("uvicorn")

def get_token_from_header(authorization: str = Header(...)) -> str:
    """Helper to extract token from Authorization: Bearer <token> header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Use 'Bearer <JWT>'",
        )
    return authorization.split(" ")[1]

def get_current_user(
    token: str = Depends(get_token_from_header),
    db: Client = Depends(get_db)
) -> dict:
    """Verifies Firebase token and loads user profile from Firestore."""
    decoded = verify_token(token)
    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
        )
    
    uid = decoded.get("uid") or decoded.get("user_id")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user identifier",
        )
        
    try:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            return user_doc.to_dict()
    except Exception as e:
        logger.exception("User profile Firestore fetch failed:")
    
    return {
        "uid": uid,
        "email": decoded.get("email", ""),
        "name": decoded.get("name", decoded.get("email", "").split("@")[0]),
        "role": "admin" if ("admin" in decoded.get("email", "") or decoded.get("email") == "shivampatidar780@gmail.com") else "user"
    }

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Asserts that the authenticated user possesses administrative privileges."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource",
        )
    return current_user
