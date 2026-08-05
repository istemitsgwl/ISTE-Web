import logging
import time
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_mongo_db

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/health", tags=["Infrastructure Health Diagnostics"])

@router.get("")
@router.get("/")
async def get_health_status(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """System and Database Health Check Endpoint."""
    start_time = time.perf_counter()
    try:
        await db.command("ping")
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "status": "healthy",
            "mongodb_connected": True,
            "latency_ms": latency_ms
        }
    except Exception as e:
        return {
            "status": "degraded",
            "mongodb_connected": False,
            "error": str(e)
        }

@router.get("/mongodb")
async def get_mongodb_health(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """
    MongoDB Atlas Health Check Endpoint:
    Executes a direct database ping and measures connection latency.
    """
    start_time = time.perf_counter()
    try:
        # Send a ping to verify connection
        await db.command("ping")
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "mongodb_connected": True,
            "connection_latency_ms": latency_ms,
            "error_details": None
        }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.exception("MongoDB Atlas health check failed:")
        return {
            "mongodb_connected": False,
            "connection_latency_ms": latency_ms,
            "error_details": str(e)
        }
