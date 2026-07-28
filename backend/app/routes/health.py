import logging
import time
from fastapi import APIRouter
from app.firebase import get_db, _firebase_app
from app.config import settings
import firebase_admin

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/health", tags=["Infrastructure Health Diagnostics"])

@router.get("/firestore")
def get_firestore_health():
    """
    Firestore Health Check Endpoint:
    Executes a direct minimal read query and measures latency.
    """
    start_time = time.perf_counter()
    is_admin_initialized = _firebase_app is not None or bool(firebase_admin._apps)
    project_id = settings.FIREBASE_PROJECT_ID

    try:
        db = get_db()
        docs = list(db.collection("events").limit(1).get())
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "firestore_connected": True,
            "project_id": project_id,
            "database_id": "(default)",
            "firebase_admin_initialized": is_admin_initialized,
            "connection_latency_ms": latency_ms,
            "documents_retrieved": len(docs),
            "error_details": None
        }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.exception("Firestore health check failed:")
        return {
            "firestore_connected": False,
            "project_id": project_id,
            "database_id": "(default)",
            "firebase_admin_initialized": is_admin_initialized,
            "connection_latency_ms": latency_ms,
            "documents_retrieved": 0,
            "error_details": str(e)
        }
