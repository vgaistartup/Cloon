from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UploadResponse(BaseModel):
    success: bool
    message: str
    file_url: Optional[str] = None
    file_id: Optional[str] = None

class AIGenerateRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    photo_urls: list[str] = Field(..., description="List of user photo URLs")
    style: Optional[str] = Field(default="casual", description="Avatar style")

class AIGenerateResponse(BaseModel):
    success: bool
    message: str
    avatar_url: Optional[str] = None
    processing_time: float
    request_id: str