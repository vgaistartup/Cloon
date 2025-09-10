from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name: str = os.getenv("DATABASE_NAME", "virtual_try_on")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-this-secret-key")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expiration_hours: int = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    max_upload_size: int = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))
    
    class Config:
        env_file = ".env"

settings = Settings()