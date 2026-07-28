from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SpeakerSchema(BaseModel):
    name: str
    designation: str
    imageUrl: str

class CustomFieldSchema(BaseModel):
    fieldName: str
    fieldType: str = Field(..., pattern=r"^(text|number|select|textarea)$")
    options: Optional[List[str]] = None
    required: bool = True

class EventCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: str
    category: str
    date: str
    venue: str
    bannerImage: Optional[str] = None
    speakers: List[SpeakerSchema] = []
    customFieldsSchema: List[CustomFieldSchema] = []

class EventResponse(EventCreate):
    id: str
    currentParticipants: int = 0
    status: str = "upcoming"
    createdAt: datetime
    updatedAt: datetime
