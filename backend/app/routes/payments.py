from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.dependencies import get_current_user, get_db
from app.providers.payment.razorpay import RazorpayProvider
from google.cloud.firestore_v1 import Client
from datetime import datetime
from pydantic import BaseModel
import logging

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/payments", tags=["Payments & Checkouts"])
payment_provider = RazorpayProvider()

class PaymentVerifyPayload(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

@router.post("/verify")
def verify_payment(
    payload: PaymentVerifyPayload,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Verifies Razorpay checkouts, confirming event registration status in Firestore."""
    uid = current_user.get("uid")
    
    # 1. Cryptographic check
    is_valid = payment_provider.verify_payment_signature(
        payment_id=payload.razorpay_payment_id,
        order_id=payload.razorpay_order_id,
        signature=payload.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cryptographic check failed. Unauthorized payment confirmation signature."
        )
        
    # 2. Find registration in Firestore
    try:
        reg_query = db.collection("eventRegistrations")\
                      .where("razorpayOrderId", "==", payload.razorpay_order_id)\
                      .limit(1).get()
                      
        if len(reg_query) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matching event registration record not found for this order ID."
            )
            
        reg_doc = reg_query[0]
        reg_data = reg_doc.to_dict()
        
        # Check if already processed
        if reg_data.get("paymentStatus") == "verified":
            return {
                "message": "Payment already verified",
                "registrationId": reg_doc.id,
                "status": "confirmed"
            }
            
        # 3. Complete transactions
        # Update registration status
        db.collection("eventRegistrations").document(reg_doc.id).update({
            "paymentStatus": "verified",
            "paymentId": payload.razorpay_payment_id,
            "updatedAt": datetime.utcnow()
        })
        
        # Update current participants count in events
        event_id = reg_data.get("eventId")
        event_ref = db.collection("events").document(event_id)
        event_doc = event_ref.get()
        if event_doc.exists:
            event_data = event_doc.to_dict()
            event_ref.update({
                "currentParticipants": event_data.get("currentParticipants", 0) + 1
            })
            
        # 4. Generate invoice log in payments collection
        db.collection("payments").document(payload.razorpay_payment_id).set({
            "paymentId": payload.razorpay_payment_id,
            "orderId": payload.razorpay_order_id,
            "userId": uid,
            "eventId": event_id,
            "amount": event_data.get("fee") if event_doc.exists else 0.0,
            "currency": "INR",
            "status": "captured",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })
        
        return {
            "message": "Payment verified successfully",
            "registrationId": reg_doc.id,
            "status": "confirmed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process verification transaction: {e}"
        )

@router.post("/webhook")
async def payments_webhook(request: Request, db: Client = Depends(get_db)):
    """Backchannel Webhook callback from Razorpay capturing async completions."""
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    
    is_valid = payment_provider.verify_webhook_signature(body, signature)
    if not is_valid:
        logger.warning("Razorpay webhook signature verification failed.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature."
        )
        
    try:
        payload = await request.json()
        event_type = payload.get("event")
        
        if event_type == "payment.captured":
            payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
            payment_id = payment_entity.get("id")
            order_id = payment_entity.get("order_id")
            
            # Find and update corresponding registration asynchronously
            reg_query = db.collection("eventRegistrations")\
                          .where("razorpayOrderId", "==", order_id)\
                          .limit(1).get()
                          
            if len(reg_query) > 0:
                reg_doc = reg_query[0]
                reg_data = reg_doc.to_dict()
                
                if reg_data.get("paymentStatus") != "verified":
                    # Update status
                    db.collection("eventRegistrations").document(reg_doc.id).update({
                        "paymentStatus": "verified",
                        "paymentId": payment_id,
                        "updatedAt": datetime.utcnow()
                    })
                    
                    # Update event count
                    event_id = reg_data.get("eventId")
                    event_ref = db.collection("events").document(event_id)
                    event_doc = event_ref.get()
                    if event_doc.exists:
                        event_ref.update({
                            "currentParticipants": event_doc.to_dict().get("currentParticipants", 0) + 1
                        })
                        
                    # Save Invoice log
                    db.collection("payments").document(payment_id).set({
                        "paymentId": payment_id,
                        "orderId": order_id,
                        "userId": reg_data.get("userId"),
                        "eventId": event_id,
                        "amount": payment_entity.get("amount", 0) / 100.0,
                        "currency": "INR",
                        "status": "captured",
                        "createdAt": datetime.utcnow(),
                        "updatedAt": datetime.utcnow()
                    })
                    logger.info(f"Razorpay Webhook: Successfully processed payment captured for order {order_id}")
                    
        return {"status": "acknowledged"}
    except Exception as e:
        logger.error(f"Razorpay Webhook processing failed: {e}")
        # Webhooks must return 200 acknowledged or gateway retries, but we return 500 if error is severe
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook handling failed: {e}"
        )
