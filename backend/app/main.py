import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, auth_google, admin, events, content, contact, health
from app.database import init_db_indexes

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
app.include_router(auth_google.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(content.router, prefix=settings.API_V1_STR)
app.include_router(contact.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_db_verification():
    """Initializes MongoDB database indexes on application boot."""
    try:
        await init_db_indexes()
        logger.info("✅ [MONGODB READY] Database indexes initialized successfully.")
    except Exception as e:
        logger.error("❌ [MONGODB ERROR] Startup index initialization failed.")
        logger.exception(e)

@app.get("/")
def read_root():
    return {
        "status": "active",
        "service": settings.PROJECT_NAME,
        "api_documentation": "/docs"
    }
