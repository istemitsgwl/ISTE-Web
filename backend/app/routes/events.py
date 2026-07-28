import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user, require_admin, get_db
from app.schemas.event import EventCreate, EventResponse
from app.providers.payment.razorpay import RazorpayProvider
from google.cloud.firestore_v1 import Client
from datetime import datetime
import uuid

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/events", tags=["Events & Registrations"])
payment_provider = RazorpayProvider()

@router.get("", response_model=list)
def get_all_events(db: Client = Depends(get_db)):
    """Retrieves all active and completed events from Firestore sorted descending by date."""
    try:
        events_ref = db.collection("events")
        docs = events_ref.stream()
        events_list = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            events_list.append(data)

        def parse_date(ev):
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

        def parse_created(ev):
            raw = ev.get("createdAt")
            if isinstance(raw, datetime):
                return raw.timestamp()
            if isinstance(raw, str):
                try:
                    return datetime.fromisoformat(raw).timestamp()
                except Exception:
                    pass
            return 0

        events_list.sort(key=lambda ev: (parse_date(ev), parse_created(ev)), reverse=True)
        return events_list
    except Exception as e:
        logger.exception("Firestore events fetch failed:")
        return []

@router.get("/{eventId}")
def get_event(eventId: str, db: Client = Depends(get_db)):
    """Retrieves detailed information for a single event."""
    try:
        doc = db.collection("events").document(eventId).get()
        if not doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to fetch event '{eventId}':")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch event: {e}"
        )

@router.post("", status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    admin_user: dict = Depends(require_admin),
    db: Client = Depends(get_db)
):
    """Creates a new event (restricted to administrators)."""
    event_id = str(uuid.uuid4())
    event_data = payload.model_dump()
    event_data["currentParticipants"] = 0
    event_data["status"] = "upcoming"
    event_data["createdAt"] = datetime.utcnow()
    event_data["updatedAt"] = datetime.utcnow()
    
    try:
        db.collection("events").document(event_id).set(event_data)
        event_data["id"] = event_id
        return event_data
    except Exception as e:
        logger.exception("Database event creation failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction failed: {e}"
        )

@router.post("/{eventId}/register")
def register_for_event(
    eventId: str,
    responseData: dict,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Registers the authenticated user for an event, creating payment orders if paid."""
    uid = current_user.get("uid")
    
    try:
        # 1. Fetch Event
        event_ref = db.collection("events").document(eventId)
        event_doc = event_ref.get()
        if not event_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target event does not exist"
            )
        event_data = event_doc.to_dict()

        # 2. Check Capacity
        if event_data.get("currentParticipants", 0) >= event_data.get("maxParticipants", 9999):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration capacity reached for this event"
            )
            
        # 3. Check for existing registration
        reg_query = db.collection("eventRegistrations")\
                      .where("eventId", "==", eventId)\
                      .where("userId", "==", uid)\
                      .limit(1).get()
                      
        if reg_query and len(reg_query) > 0:
            existing_reg = reg_query[0].to_dict()
            if existing_reg.get("paymentStatus") in ["verified", "free"]:
                return {
                    "message": "User is already registered for this event",
                    "registrationId": reg_query[0].id,
                    "status": "confirmed"
                }
            
        registration_id = f"ISTE-REG-{uuid.uuid4().hex[:8].upper()}"
        
        # 4. Handle Payment order creation
        is_paid = event_data.get("isPaid", False)
        fee = event_data.get("fee", 0.0)
        
        reg_data = {
            "eventId": eventId,
            "userId": uid,
            "registrationId": registration_id,
            "responseData": responseData,
            "attendanceStatus": "absent",
            "registeredAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        if is_paid and fee > 0:
            order = payment_provider.create_order(amount=fee, receipt_id=registration_id)
            reg_data["paymentStatus"] = "pending"
            reg_data["razorpayOrderId"] = order["id"]
            
            db.collection("eventRegistrations").document(registration_id).set(reg_data)
            
            return {
                "registrationId": registration_id,
                "status": "pending",
                "paymentRequired": True,
                "razorpayOrderId": order["id"],
                "fee": fee
            }
        else:
            reg_data["paymentStatus"] = "free"
            
            db.collection("eventRegistrations").document(registration_id).set(reg_data)
            event_ref.update({
                "currentParticipants": event_data.get("currentParticipants", 0) + 1
            })
            
            return {
                "registrationId": registration_id,
                "status": "confirmed",
                "paymentRequired": False
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Event registration transaction failed:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration transaction failed: {e}"
        )
