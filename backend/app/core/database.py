from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

db = Database()

async def get_database():
    return db.database

async def init_database():
    """Initialize database connection"""
    try:
        db.client = AsyncIOMotorClient(settings.mongodb_url)
        db.database = db.client[settings.database_name]
        
        # Test the connection
        await db.client.admin.command('ismaster')
        logger.info(f"Connected to MongoDB at {settings.mongodb_url}")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def create_indexes():
    """Create necessary database indexes"""
    try:
        # Users collection indexes
        await db.database.users.create_index("phone_number", unique=True)
        await db.database.users.create_index("user_id", unique=True)
        
        # OTP collection indexes (TTL index for auto-expiry)
        await db.database.otps.create_index("expires_at", expireAfterSeconds=0)
        await db.database.otps.create_index("phone_number")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")

async def close_database():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")