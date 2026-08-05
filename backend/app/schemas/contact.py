from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=3, max_length=150)
    message: str = Field(..., min_length=5, max_length=3000)

class ContactResponse(ContactCreate):
    id: str
    createdAt: datetime
    updatedAt: datetime
    status: str = "Unread"
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
