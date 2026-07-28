from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserProfileUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., pattern=r"^\+?[0-9]{10,15}$")
    college: str = Field(..., min_length=2, max_length=150)
    branch: str = Field(..., min_length=2, max_length=100)
    year: str = Field(..., pattern=r"^[1-4]$")
    enrollmentNo: str = Field(..., min_length=5, max_length=50)

class UserProfile(BaseModel):
    uid: str
    email: str
    name: str
    role: str = "user"
    phone: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    enrollmentNo: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
