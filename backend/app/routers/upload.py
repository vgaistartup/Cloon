from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Header
from typing import Optional
import aiofiles
import os
import uuid
from pathlib import Path
import logging
from datetime import datetime

from app.models.api import UploadResponse
from app.core.config import settings
from app.core.database import get_database
from app.core.security import verify_token

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_current_user(authorization: Optional[str] = Header(None), db=Depends(get_database)):
    """Get current user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_doc = await db.users.find_one({"user_id": payload.get("user_id")})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_doc

@router.post("/photo", response_model=UploadResponse)
async def upload_photo(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db=Depends(get_database)
):
    """Upload user photo"""
    try:
        # Validate file type
        allowed_types = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed")
        
        # Validate file size
        contents = await file.read()
        if len(contents) > settings.max_upload_size:
            raise HTTPException(status_code=400, detail=f"File too large. Maximum size is {settings.max_upload_size} bytes")
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path(settings.upload_dir)
        upload_dir.mkdir(exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(contents)
        
        # Generate file URL
        file_url = f"/uploads/{unique_filename}"
        
        # Update user's profile photos
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$push": {"profile_photos": file_url},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        logger.info(f"Photo uploaded successfully for user {user['user_id']}: {file_url}")
        
        return UploadResponse(
            success=True,
            message="Photo uploaded successfully",
            file_url=file_url,
            file_id=unique_filename.split('.')[0]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload photo: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload photo")