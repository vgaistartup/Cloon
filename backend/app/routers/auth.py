from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import logging

from app.models.auth import OTPRequest, OTPVerify, OTPResponse, LoginResponse
from app.models.user import User, UserCreate, UserResponse
from app.core.database import get_database
from app.core.security import generate_otp, create_access_token, generate_user_id

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/send-otp", response_model=OTPResponse)
async def send_otp(request: OTPRequest, db=Depends(get_database)):
    """Send OTP to phone number (mocked for now)"""
    try:
        # Generate OTP
        otp_code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Store OTP in database
        otp_doc = {
            "phone_number": request.phone_number,
            "otp_code": otp_code,
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "verified": False
        }
        
        # Remove any existing OTP for this phone number
        await db.otps.delete_many({"phone_number": request.phone_number})
        
        # Insert new OTP
        await db.otps.insert_one(otp_doc)
        
        logger.info(f"OTP sent to {request.phone_number}: {otp_code}")  # In production, don't log OTP
        
        return OTPResponse(
            success=True,
            message=f"OTP sent successfully to {request.phone_number}. (Mock OTP: {otp_code})",
            expires_at=expires_at
        )
        
    except Exception as e:
        logger.error(f"Failed to send OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")

@router.post("/verify-otp", response_model=LoginResponse)
async def verify_otp(request: OTPVerify, db=Depends(get_database)):
    """Verify OTP and login user"""
    try:
        # Find OTP in database
        otp_doc = await db.otps.find_one({
            "phone_number": request.phone_number,
            "otp_code": request.otp_code,
            "verified": False
        })
        
        if not otp_doc:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # Check if OTP is expired
        if otp_doc["expires_at"] < datetime.utcnow():
            raise HTTPException(status_code=400, detail="OTP has expired")
        
        # Mark OTP as verified
        await db.otps.update_one(
            {"_id": otp_doc["_id"]},
            {"$set": {"verified": True}}
        )
        
        # Find or create user
        user_doc = await db.users.find_one({"phone_number": request.phone_number})
        
        if not user_doc:
            # Create new user
            user_id = generate_user_id()
            user_doc = {
                "user_id": user_id,
                "phone_number": request.phone_number,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "is_active": True,
                "profile_photos": []
            }
            await db.users.insert_one(user_doc)
        else:
            user_id = user_doc["user_id"]
        
        # Create access token
        access_token = create_access_token(data={"user_id": user_id, "phone_number": request.phone_number})
        
        return LoginResponse(
            success=True,
            message="Login successful",
            access_token=access_token,
            user_id=user_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")