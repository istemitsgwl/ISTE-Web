import logging
import html
import time
from collections import defaultdict
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.dependencies import require_admin, get_mongo_db
from app.schemas.contact import ContactCreate
from app.email_service import send_contact_notification_email

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="", tags=["Contact & Messages Engine"])

# Rate limiter storage (IP -> list of timestamps)
_ip_rate_limit_map = defaultdict(list)

def is_rate_limited(ip_address: str, limit: int = 5, window: int = 60) -> bool:
    now = time.time()
    valid_timestamps = [ts for ts in _ip_rate_limit_map[ip_address] if now - ts < window]
    _ip_rate_limit_map[ip_address] = valid_timestamps
    if len(valid_timestamps) >= limit:
        return True
    _ip_rate_limit_map[ip_address].append(now)
    return False

# ==========================================
# PUBLIC CONTACT API
# ==========================================

@router.post("/contact", status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    payload: ContactCreate,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """
    Public endpoint for visitors to submit a contact inquiry.
    Validates input, enforces rate limits, stores message in MongoDB, and triggers email alerts.
    """
    # 1. Client IP & User Agent Extraction
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "127.0.0.1"

    user_agent = request.headers.get("User-Agent") or "Unknown"

    # 2. Rate Limiting Check (5 submissions per minute)
    if is_rate_limited(client_ip, limit=5, window=60):
        logger.warning(f"⚠️ Rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many message submissions. Please wait 1 minute before trying again."
        )

    # 3. Input Sanitization & XSS Protection
    clean_name = html.escape(payload.name.strip())
    clean_email = html.escape(payload.email.strip())
    clean_subject = html.escape(payload.subject.strip())
    clean_message = html.escape(payload.message.strip())

    now = datetime.utcnow()
    message_doc = {
        "name": clean_name,
        "email": clean_email,
        "subject": clean_subject,
        "message": clean_message,
        "status": "Unread",
        "ipAddress": client_ip,
        "userAgent": user_agent,
        "createdAt": now,
        "updatedAt": now
    }

    try:
        # 4. Save into MongoDB contact_messages collection
        res = await db.contact_messages.insert_one(message_doc)
        doc_id = str(res.inserted_id)
        message_doc["id"] = doc_id
        message_doc.pop("_id", None)

        # 5. Trigger Email Notification (Resend API / SMTP)
        submitted_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")
        send_contact_notification_email(
            name=clean_name,
            email=clean_email,
            subject=clean_subject,
            message=clean_message,
            submitted_at=submitted_str,
            ip_address=client_ip,
            user_agent=user_agent
        )

        logger.info(f"✅ [CONTACT FORM SUCCESS] Saved message #{doc_id} from {clean_email}")
        return {
            "success": True,
            "message": "Your message has been received! Our team will get back to you shortly.",
            "data": message_doc
        }

    except Exception as e:
        logger.exception("❌ Error processing contact form submission:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record contact submission. Please try again."
        )


# ==========================================
# ADMIN CONTACT MESSAGES CMS APIs
# ==========================================

@router.get("/admin/contact")
async def get_admin_contact_messages(
    search: Optional[str] = Query(None, description="Search term for name, email, or subject"),
    status_filter: Optional[str] = Query("All", alias="status", description="Filter by status: All, Unread, Read"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """
    Retrieves contact messages for the Admin CMS with search, filter, and pagination support.
    """
    query_filter = {}

    # Status filtering
    if status_filter and status_filter.lower() != "all":
        query_filter["status"] = "Read" if status_filter.lower() == "read" else "Unread"

    # Search filtering across name, email, and subject
    if search and search.strip():
        regex_pattern = {"$regex": search.strip(), "$options": "i"}
        query_filter["$or"] = [
            {"name": regex_pattern},
            {"email": regex_pattern},
            {"subject": regex_pattern},
            {"message": regex_pattern}
        ]

    try:
        # Count statistics
        total_count = await db.contact_messages.count_documents({})
        unread_count = await db.contact_messages.count_documents({"status": "Unread"})
        read_count = await db.contact_messages.count_documents({"status": "Read"})
        filtered_count = await db.contact_messages.count_documents(query_filter)

        # Pagination & Query
        skip = (page - 1) * limit
        cursor = db.contact_messages.find(query_filter).sort([("createdAt", -1)]).skip(skip).limit(limit)
        
        messages = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            messages.append(doc)

        return {
            "messages": messages,
            "total": total_count,
            "unread": unread_count,
            "read": read_count,
            "filtered": filtered_count,
            "page": page,
            "limit": limit
        }
    except Exception as e:
        logger.exception("Failed to fetch admin contact messages:")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database fetch failed: {e}")


@router.get("/admin/contact/{id}")
async def get_single_contact_message(
    id: str,
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Retrieves a single contact message details by ID."""
    try:
        query_filter = {"$or": [{"id": id}, {"_id": ObjectId(id) if ObjectId.is_valid(id) else None}]}
        doc = await db.contact_messages.find_one(query_filter)
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message record not found")
        
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        return doc
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.patch("/admin/contact/{id}/read")
async def toggle_message_read_status(
    id: str,
    status_value: Optional[str] = Query(None, alias="status"),
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """
    Toggles or marks a contact message as 'Read' or 'Unread'.
    """
    try:
        query_filter = {"$or": [{"id": id}, {"_id": ObjectId(id) if ObjectId.is_valid(id) else None}]}
        existing = await db.contact_messages.find_one(query_filter)
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message record not found")

        # Determine target status
        if status_value:
            new_status = "Read" if status_value.lower() == "read" else "Unread"
        else:
            new_status = "Read" if existing.get("status") == "Unread" else "Unread"

        await db.contact_messages.update_one(
            query_filter,
            {"$set": {"status": new_status, "updatedAt": datetime.utcnow()}}
        )

        updated = await db.contact_messages.find_one(query_filter)
        updated["id"] = str(updated["_id"])
        updated.pop("_id", None)
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/admin/contact/{id}")
async def delete_contact_message(
    id: str,
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Deletes a contact message document from MongoDB."""
    try:
        query_filter = {"$or": [{"id": id}, {"_id": ObjectId(id) if ObjectId.is_valid(id) else None}]}
        existing = await db.contact_messages.find_one(query_filter)
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message record not found")

        await db.contact_messages.delete_one(query_filter)
        return {"success": True, "message": "Contact message deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
