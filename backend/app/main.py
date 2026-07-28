import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, events, payments, content, health
from app.firebase import get_db

logger = logging.getLogger("uvicorn")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Official ISTE Student Chapter of MITS Gwalior API service console.",
    version="1.0.0"
)

# CORS configuration
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
if "*" in origins:
    origins = ["*"]
else:
    if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
        origins.append(settings.FRONTEND_URL)
    if "http://localhost:5173" not in origins:
        origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(content.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_firestore_verification():
    """Verifies Firestore connectivity with a direct minimal read on application boot."""
    try:
        db = get_db()
        # Minimal startup read test on 'events' collection
        docs = list(db.collection("events").limit(1).get())
        logger.info(f"✅ [FIRESTORE READY] Project ID: '{settings.FIREBASE_PROJECT_ID}' | Database: '(default)' | Read verification: SUCCESS ({len(docs)} doc(s) returned)")
    except Exception as e:
        logger.error(f"❌ [FIRESTORE ERROR] Startup read verification failed for Project ID: '{settings.FIREBASE_PROJECT_ID}'")
        logger.exception(e)

@app.get("/")
def read_root():
    return {
        "status": "active",
        "service": settings.PROJECT_NAME,
        "api_documentation": "/docs"
    }
