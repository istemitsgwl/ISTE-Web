from abc import ABC, abstractmethod

class PaymentProvider(ABC):
    @abstractmethod
    def create_order(self, amount: float, receipt_id: str) -> dict:
        """Creates a payment order with the gateway.
        
        Args:
            amount: The amount to charge (in INR).
            receipt_id: Local reference identifier (e.g. registration ID).
            
        Returns:
            A dictionary containing gateway-specific order details.
        """
        pass
        
    @abstractmethod
    def verify_payment_signature(self, payment_id: str, order_id: str, signature: str) -> bool:
        """Verifies the cryptographic signature received after client checkouts.
        
        Returns:
            bool: True if signature is valid, else False.
        """
        pass

    @abstractmethod
    def verify_webhook_signature(self, body: bytes, signature: str) -> bool:
        """Verifies raw webhook signals received from the gateway backend."""
        pass
