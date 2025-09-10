from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class User(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    phone_number: str = Field(..., description="User's phone number")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    profile_photos: List[str] = Field(default_factory=list, description="List of uploaded photo URLs")

class UserCreate(BaseModel):
    phone_number: str = Field(..., description="User's phone number")

class UserResponse(BaseModel):
    user_id: str
    phone_number: str
    created_at: datetime
    is_active: bool
    profile_photos: List[str]