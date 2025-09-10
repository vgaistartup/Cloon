from pydantic import BaseModel, Field
from datetime import datetime

class OTPRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number to send OTP")

class OTPVerify(BaseModel):
    phone_number: str = Field(..., description="Phone number")
    otp_code: str = Field(..., description="OTP code")

class OTPResponse(BaseModel):
    success: bool
    message: str
    expires_at: datetime

class LoginResponse(BaseModel):
    success: bool
    message: str
    access_token: str
    token_type: str = "bearer"
    user_id: str

class OTP(BaseModel):
    phone_number: str
    otp_code: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    verified: bool = False