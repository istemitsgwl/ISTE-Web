import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.dependencies import get_current_user, require_admin, get_mongo_db
from app.rate_limit import RateLimiter
from app.schemas.event import EventCreate, EventResponse
from app.cloudinary_service import upload_image_to_cloudinary, delete_image_from_cloudinary, upload_base64_to_cloudinary

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/events", tags=["Events & Free Registrations"])

# Fields an administrator is allowed to modify through PUT /events/{eventId}.
# Prevents mass assignment of internal fields (currentParticipants, cloudinaryPublicId, ...).
EVENT_UPDATABLE_FIELDS = {
    "title", "desc", "description", "category", "date", "eventDate", "venue",
    "bannerImage", "image", "speakers", "customFieldsSchema", "status",
    "maxParticipants", "registrationOpen", "updatedAt", "createdAt",
}

def sanitize_mongo_document(value, depth: int = 0, max_str: int = None):
    """Recursively strips MongoDB operator keys ($...) and dotted keys from user JSON.
    Optionally truncates string values to max_str characters."""
    if depth > 8:
        return None
    if isinstance(value, dict):
        return {
            k: sanitize_mongo_document(v, depth + 1, max_str)
            for k, v in value.items()
            if isinstance(k, str) and not k.startswith("$") and "." not in k
        }
    if isinstance(value, list):
        return [sanitize_mongo_document(v, depth + 1, max_str) for v in value[:100]]
    if isinstance(value, str) and max_str is not None:
        return value[:max_str]
    return value

def parse_event_date(ev: dict) -> float:
    raw = ev.get("eventDate") or ev.get("date") or ""
    if isinstance(raw, datetime):
        return raw.timestamp()
    if isinstance(raw, str):
        import re
        cleaned = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', raw, flags=re.IGNORECASE)
        if "-" in cleaned:
            cleaned = cleaned.split("-")[-1].strip()
        elif "–" in cleaned:
            cleaned = cleaned.split("–")[-1].strip()
        try:
            return datetime.fromisoformat(cleaned).timestamp()
        except Exception:
            pass
        year_match = re.search(r'\b(20\d\d)\b', raw)
        if year_match:
            return datetime(int(year_match.group(1)), 1, 1).timestamp()
    return 0

@router.get("", response_model=list)
async def get_all_events(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """Retrieves all active and completed events from MongoDB sorted descending by date."""
    try:
        cursor = db.events.find()
        events_list = []
        async for doc in cursor:
            doc["id"] = doc.get("id") or str(doc["_id"])
            doc.pop("_id", None)
            events_list.append(doc)

        events_list.sort(key=lambda ev: (parse_event_date(ev), ev.get("createdAt", 0)), reverse=True)
        return events_list
    except Exception as e:
        logger.exception("MongoDB events fetch failed:")
        return []

@router.get("/{eventId}")
async def get_event(eventId: str, db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """Retrieves detailed information for a single event."""
    try:
        doc = await db.events.find_one({"$or": [{"id": eventId}, {"_id": ObjectId(eventId) if ObjectId.is_valid(eventId) else None}]})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        doc["id"] = doc.get("id") or str(doc["_id"])
        doc.pop("_id", None)
        return doc
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to fetch event '{eventId}':")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch event."
        )

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: EventCreate,
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Creates a new event (restricted to administrators)."""
    event_id = str(uuid.uuid4())
    event_data = payload.model_dump()
    event_data["id"] = event_id
    event_data["isPaid"] = False
    event_data["fee"] = 0.0
    event_data["currentParticipants"] = 0
    event_data["status"] = event_data.get("status") or "upcoming"
    event_data["createdAt"] = datetime.utcnow()
    event_data["updatedAt"] = datetime.utcnow()
    
    # Intercept Base64 banner image and upload to Cloudinary
    banner_url = event_data.get("bannerImage") or ""
    if banner_url.startswith("data:image/"):
        try:
            res = upload_base64_to_cloudinary(banner_url, folder="events")
            event_data["bannerImage"] = res["url"]
            event_data["image"] = res["url"]
            event_data["cloudinaryPublicId"] = res["public_id"]
        except Exception as e:
            logger.error(f"Failed to upload event banner to Cloudinary: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload event banner."
            )
            
    try:
        await db.events.insert_one(event_data)
        event_data.pop("_id", None)
        return event_data
    except Exception as e:
        logger.exception("Database event creation failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create event."
        )

@router.put("/{eventId}")
async def update_event(
    eventId: str,
    payload: dict,
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Updates an existing event (restricted to administrators)."""
    query_filter = {"$or": [{"id": eventId}, {"_id": ObjectId(eventId) if ObjectId.is_valid(eventId) else None}]}
    existing = await db.events.find_one(query_filter)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        
    # Whitelist updatable fields and strip Mongo operators (mass-assignment protection)
    payload = {k: v for k, v in payload.items() if k in EVENT_UPDATABLE_FIELDS}
    payload = sanitize_mongo_document(payload)
    payload["updatedAt"] = datetime.utcnow()

    # Intercept Base64 banner image and upload to Cloudinary
    banner_url = payload.get("bannerImage") or ""
    if banner_url.startswith("data:image/"):
        try:
            if existing.get("cloudinaryPublicId"):
                delete_image_from_cloudinary(existing.get("cloudinaryPublicId"))
            res = upload_base64_to_cloudinary(banner_url, folder="events")
            payload["bannerImage"] = res["url"]
            payload["image"] = res["url"]
            payload["cloudinaryPublicId"] = res["public_id"]
        except Exception as e:
            logger.error(f"Failed to upload event banner to Cloudinary during update: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload event banner."
            )
            
    await db.events.update_one(query_filter, {"$set": payload})
    updated = await db.events.find_one(query_filter)
    updated["id"] = updated.get("id") or str(updated["_id"])
    updated.pop("_id", None)
    return updated

@router.delete("/{eventId}")
async def delete_event(
    eventId: str,
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Deletes an event record (restricted to administrators)."""
    query_filter = {"$or": [{"id": eventId}, {"_id": ObjectId(eventId) if ObjectId.is_valid(eventId) else None}]}
    existing = await db.events.find_one(query_filter)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        
    if existing.get("cloudinaryPublicId"):
        delete_image_from_cloudinary(existing.get("cloudinaryPublicId"))

    await db.events.delete_one(query_filter)
    return {"message": "Event deleted successfully", "id": eventId}

@router.post(
    "/{eventId}/register",
    dependencies=[Depends(RateLimiter(times=10, seconds=60, scope="event_register"))],
)
async def register_for_event(
    eventId: str,
    responseData: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Registers authenticated user for an event (100% Free registration)."""
    uid = current_user.get("id") or current_user.get("uid") or current_user.get("email")

    # Sanitize free-form registration answers (strip Mongo operators, cap sizes)
    responseData = sanitize_mongo_document(responseData, max_str=2000) or {}
    if len(responseData) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration form contains too many fields."
        )

    try:
        # 1. Fetch Event
        query_filter = {"$or": [{"id": eventId}, {"_id": ObjectId(eventId) if ObjectId.is_valid(eventId) else None}]}
        event_doc = await db.events.find_one(query_filter)
        if not event_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target event does not exist"
            )

        # 2. Check for existing registration
        existing_reg = await db.event_registrations.find_one({"eventId": eventId, "userId": uid})
        if existing_reg:
            return {
                "message": "User is already registered for this event",
                "registrationId": existing_reg.get("registrationId", str(existing_reg.get("_id"))),
                "status": "confirmed"
            }

        # 3. Atomically claim a capacity slot (prevents overbooking under concurrency)
        capacity_filter = {
            **query_filter,
            "$expr": {
                "$lt": [
                    {"$ifNull": ["$currentParticipants", 0]},
                    {"$ifNull": ["$maxParticipants", 999999]},
                ]
            },
        }
        claim = await db.events.update_one(capacity_filter, {"$inc": {"currentParticipants": 1}})
        if claim.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration capacity reached for this event"
            )

        registration_id = f"ISTE-REG-{uuid.uuid4().hex[:8].upper()}"

        reg_data = {
            "registrationId": registration_id,
            "eventId": eventId,
            "userId": uid,
            "userEmail": current_user.get("email"),
            "userName": current_user.get("name"),
            "responseData": responseData,
            "paymentStatus": "free",
            "attendanceStatus": "absent",
            "registeredAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        try:
            await db.event_registrations.insert_one(reg_data)
        except Exception:
            # Release the claimed slot if the registration document could not be saved
            await db.events.update_one(query_filter, {"$inc": {"currentParticipants": -1}})
            raise

        return {
            "registrationId": registration_id,
            "status": "confirmed",
            "paymentRequired": False,
            "message": "Registration successful! Welcome to the event."
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("Event registration transaction failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to a server error. Please try again."
        )
