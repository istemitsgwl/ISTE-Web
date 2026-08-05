import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.dependencies import require_super_admin, get_mongo_db

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/v1/admins", tags=["RBAC Administrative Account Management"])

class AdminCreateRequest(BaseModel):
    email: EmailStr
    name: str
    role: str = "admin"

class AdminUpdateRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

class AdminStatusRequest(BaseModel):
    status: str  # "active" or "disabled"

class AdminRoleRequest(BaseModel):
    role: str  # "super_admin" or "admin"

def serialize_admin(doc) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

@router.get("", response_model=List[dict])
async def list_admins(
    super_admin: dict = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Lists all administrative accounts (Super Admin only)."""
    cursor = db.admins.find()
    admin_list = []
    async for doc in cursor:
        admin_list.append(serialize_admin(doc))
    return admin_list

@router.get("/{admin_id}", response_model=dict)
async def get_admin_by_id(
    admin_id: str,
    super_admin: dict = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Fetches details of a specific administrative account (Super Admin only)."""
    try:
        oid = ObjectId(admin_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Admin ID format")
    
    doc = await db.admins.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin account not found")
    return serialize_admin(doc)

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_admin(
    payload: AdminCreateRequest,
    super_admin: dict = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Enrolls a new administrative account (Super Admin only)."""
    email_clean = payload.email.lower().strip()
    existing = await db.admins.find_one({"email": email_clean})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Admin account with email '{email_clean}' already exists."
        )

    new_admin = {
        "email": email_clean,
        "name": payload.name.strip(),
        "role": payload.role.lower().strip() if payload.role.lower().strip() in ["super_admin", "admin"] else "admin",
        "status": "active",
        "provider": "google",
        "picture": "",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    res = await db.admins.insert_one(new_admin)
    new_admin["id"] = str(res.inserted_id)
    new_admin.pop("_id", None)
    logger.info(f"Super Admin '{super_admin.get('email')}' enrolled new admin account: '{email_clean}'")
    return new_admin

@router.patch("/{admin_id}", response_model=dict)
async def update_admin(
    admin_id: str,
    payload: AdminUpdateRequest,
    super_admin: dict = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Edits name or role of an administrative account (Super Admin only)."""
    try:
        oid = ObjectId(admin_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Admin ID format")

    target = await db.admins.find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin account not found")

    update_data = {}
    if payload.name is not None:
        update_data["name"] = payload.name.strip()
    if payload.role is not None:
        role_clean = payload.role.lower().strip()
        if role_clean in ["super_admin", "admin"]:
            # Super Admin cannot demote themselves
            if str(target["_id"]) == super_admin.get("id") and role_clean != "super_admin":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Super Admin cannot demote their own account."
                )
            update_data["role"] = role_clean

    if not update_data:
        return serialize_admin(target)

    update_data["updatedAt"] = datetime.utcnow()
    await db.admins.update_one({"_id": oid}, {"$set": update_data})
    
    updated_doc = await db.admins.find_one({"_id": oid})
    logger.info(f"Super Admin updated fields for Admin '{admin_id}': {list(update_data.keys())}")
    return serialize_admin(updated_doc)

@router.delete("/{admin_id}")
async def delete_admin(
    admin_id: str,
    super_admin: dict = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Removes an administrative account permanently (Super Admin only)."""
    try:
        oid = ObjectId(admin_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Admin ID format")

    target = await db.admins.find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin account not found")

    if str(target["_id"]) == super_admin.get("id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super Admin cannot delete their own account."
        )

    # Protect last active Super Admin
    if target.get("role") == "super_admin":
        count = await db.admins.count_documents({"role": "super_admin", "status": "active"})
        if count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last active Super Admin account."
            )

    await db.admins.delete_one({"_id": oid})
    logger.info(f"Super Admin deleted Admin account '{admin_id}'")
    return {"message": "Admin deleted successfully", "id": admin_id}

@router.patch("/{admin_id}/status")
async def update_admin_status(
    admin_id: str,
    payload: AdminStatusRequest,
    super_admin: dict = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Enables or disables an administrative account (Super Admin only)."""
    try:
        oid = ObjectId(admin_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Admin ID format")

    target = await db.admins.find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin account not found")

    status_clean = payload.status.lower().strip()
    if status_clean not in ["active", "disabled"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be 'active' or 'disabled'")

    # Super Admin cannot disable themselves
    if str(target["_id"]) == super_admin.get("id") and status_clean == "disabled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super Admin cannot disable their own account."
        )

    # Protect last active Super Admin
    if target.get("role") == "super_admin" and status_clean == "disabled":
        count = await db.admins.count_documents({"role": "super_admin", "status": "active"})
        if count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disable the last active Super Admin account."
            )

    await db.admins.update_one(
        {"_id": oid},
        {"$set": {"status": status_clean, "updatedAt": datetime.utcnow()}}
    )
    logger.info(f"Super Admin updated status of Admin '{admin_id}' to '{status_clean}'")
    return {"message": f"Admin status updated to {status_clean}", "id": admin_id, "status": status_clean}

@router.patch("/{admin_id}/role")
async def update_admin_role(
    admin_id: str,
    payload: AdminRoleRequest,
    super_admin: dict = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Changes the administrative role (Super Admin only)."""
    try:
        oid = ObjectId(admin_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Admin ID format")

    target = await db.admins.find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin account not found")

    role_clean = payload.role.lower().strip()
    if role_clean not in ["super_admin", "admin"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be 'super_admin' or 'admin'")

    # Super Admin cannot demote themselves
    if str(target["_id"]) == super_admin.get("id") and role_clean == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super Admin cannot demote their own account."
        )

    # Protect last active Super Admin
    if target.get("role") == "super_admin" and role_clean == "admin":
        count = await db.admins.count_documents({"role": "super_admin", "status": "active"})
        if count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the last active Super Admin account."
            )

    await db.admins.update_one(
        {"_id": oid},
        {"$set": {"role": role_clean, "updatedAt": datetime.utcnow()}}
    )
    logger.info(f"Super Admin updated role of Admin '{admin_id}' to '{role_clean}'")
    return {"message": f"Admin role updated to {role_clean}", "id": admin_id, "role": role_clean}
