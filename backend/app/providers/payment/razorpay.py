import hmac
import hashlib
import requests
from app.providers.payment.base import PaymentProvider
from app.config import settings
import logging

logger = logging.getLogger("uvicorn")

class RazorpayProvider(PaymentProvider):
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        self.webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
        self.api_url = "https://api.razorpay.com/v1/orders"

    def create_order(self, amount: float, receipt_id: str) -> dict:
        """Creates an order in Razorpay (amount converted to paise)."""
        amount_in_paise = int(amount * 100)
        
        # In a real-world scenario we call Razorpay API. If mock credentials are used, we fallback gracefully.
        if self.key_id.startswith("rzp_test_mock"):
            logger.info(f"[MOCK PAYMENT] Creating mock Razorpay order for {amount} INR (Receipt: {receipt_id})")
            return {
                "id": f"order_mock_{hashlib.md5(receipt_id.encode()).hexdigest()[:12]}",
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": receipt_id,
                "status": "created",
                "provider": "razorpay_mock"
            }

        try:
            payload = {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": receipt_id,
            }
            response = requests.post(
                self.api_url,
                json=payload,
                auth=(self.key_id, self.key_secret),
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise RuntimeError(f"Payment gateway communication failed: {e}")

    def verify_payment_signature(self, payment_id: str, order_id: str, signature: str) -> bool:
        """Verifies the checkout signature using HMAC SHA256."""
        if self.key_id.startswith("rzp_test_mock"):
            logger.info("[MOCK PAYMENT] Verifying mock Razorpay signature")
            return signature == f"mock_sig_{payment_id}_{order_id}"

        try:
            msg = f"{order_id}|{payment_id}".encode("utf-8")
            generated_signature = hmac.new(
                self.key_secret.encode("utf-8"),
                msg,
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(generated_signature, signature)
        except Exception as e:
            logger.error(f"Razorpay signature verification failed: {e}")
            return False

    def verify_webhook_signature(self, body: bytes, signature: str) -> bool:
        """Verifies Razorpay webhook header signature."""
        if self.key_id.startswith("rzp_test_mock"):
            return True
            
        try:
            generated_signature = hmac.new(
                self.webhook_secret.encode("utf-8"),
                body,
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(generated_signature, signature)
        except Exception as e:
            logger.error(f"Webhook signature verification failed: {e}")
            return False
