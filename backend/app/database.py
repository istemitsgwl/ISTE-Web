import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger("uvicorn")

import asyncio

# Global singleton instances for MongoDB client & database
_mongo_client: AsyncIOMotorClient | None = None
_mongo_db: AsyncIOMotorDatabase | None = None

def get_mongo_client() -> AsyncIOMotorClient:
    """Returns or initializes the global AsyncIOMotorClient singleton, re-initializing if the loop has closed."""
    global _mongo_client
    try:
        # Check if the active event loop is closed or different
        if _mongo_client is not None:
            client_loop = _mongo_client.get_io_loop()
            if client_loop.is_closed():
                logger.info("MongoDB client event loop is closed. Re-initializing AsyncIOMotorClient.")
                _mongo_client = None
    except Exception:
        _mongo_client = None

    if _mongo_client is None:
        logger.info(f"Initializing AsyncIOMotorClient for URI: {settings.MONGODB_URI.split('@')[-1] if '@' in settings.MONGODB_URI else settings.MONGODB_URI}")
        _mongo_client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _mongo_client

def get_mongo_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency or internal helper returning the shared AsyncIOMotorDatabase singleton."""
    global _mongo_db
    client = get_mongo_client()
    if _mongo_db is None or _mongo_db.client != client:
        _mongo_db = client[settings.MONGODB_DB_NAME]
        logger.info(f"✓ Connected to MongoDB Database: '{settings.MONGODB_DB_NAME}'")
    return _mongo_db

async def init_db_indexes():
    """
    Asynchronously creates database indexes for unique constraints & query performance.
    Should be called during FastAPI application startup lifecycle.
    """
    db = get_mongo_db()
    try:
        # 1. Unique index on admins.email
        await db.admins.create_index("email", unique=True)
        
        # 2. Unique index on users.email
        await db.users.create_index("email", unique=True)

        # 3. Unique index on event_registrations.registrationId
        await db.event_registrations.create_index("registrationId", unique=True)

        # 4. Index on event_registrations (eventId, userId) for registration checks
        await db.event_registrations.create_index([("eventId", 1), ("userId", 1)])

        await db.events.create_index("date")
        await db.events.create_index("status")
        await db.events.create_index("id", unique=True)

        # 6. Contact Messages collection indexes
        await db.contact_messages.create_index([("createdAt", -1)])
        await db.contact_messages.create_index([("status", 1)])
        await db.contact_messages.create_index([("email", 1)])

        # 7. Seed the bootstrap Super Admin account(s) if they don't already exist
        super_admin_list = settings.super_admin_emails()
        if not super_admin_list:
            logger.info("SUPER_ADMIN_EMAIL not configured — skipping Super Admin seeding.")
        for super_admin_email in super_admin_list:
            exists = await db.admins.find_one({"email": super_admin_email})
            if not exists:
                from datetime import datetime
                await db.admins.insert_one({
                    "name": "Super Admin",
                    "email": super_admin_email,
                    "role": "super_admin",
                    "status": "active",
                    "provider": "google",
                    "picture": "",
                    "createdAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                })
                logger.info(f"✓ Super Admin ('{super_admin_email}') successfully seeded into 'admins' collection.")
            else:
                await db.admins.update_one(
                    {"email": super_admin_email},
                    {"$set": {"status": "active"}}
                )
                logger.info(f"✓ Existing Super Admin record ('{super_admin_email}') verified as 'active'.")

        # Update any other admin records that are missing status property
        await db.admins.update_many(
            {"status": {"$exists": False}},
            {"$set": {"status": "active", "provider": "google"}}
        )

        logger.info("✓ MongoDB database indexes & seeding verified & created successfully.")
    except Exception as e:
        logger.warning(f"Note on MongoDB index/seeding initialization: {e}")
