import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, auth_google, admin, events, content, contact, health
from app.database import init_db_indexes

logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes MongoDB database indexes on application boot."""
    try:
        await init_db_indexes()
        logger.info("✅ [MONGODB READY] Database indexes initialized successfully.")
    except Exception as e:
        logger.error("❌ [MONGODB ERROR] Startup index initialization failed.")
        logger.exception(e)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Official ISTE Student Chapter of MITS Gwalior API service console.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
allow_all_origins = "*" in origins

if allow_all_origins:
    # Wildcard origins must never be combined with credentials.
    logger.warning("CORS is configured with a wildcard origin — credentialed requests are disabled.")
    cors_kwargs = {"allow_origins": ["*"], "allow_credentials": False}
else:
    if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
        origins.append(settings.FRONTEND_URL)
    if "http://localhost:5173" not in origins:
        origins.append("http://localhost:5173")
    cors_kwargs = {"allow_origins": origins, "allow_credentials": True}

app.add_middleware(
    CORSMiddleware,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    **cors_kwargs,
)

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Attaches standard security headers to every API response."""
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
    return response

# Register API Routers with /api prefix (Primary)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(auth_google.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(content.router, prefix=settings.API_V1_STR)
app.include_router(contact.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

# Register API Routers at root (Fallback for direct non-prefixed paths)
app.include_router(auth.router)
app.include_router(auth_google.router)
app.include_router(admin.router)
app.include_router(events.router)
app.include_router(content.router)
app.include_router(contact.router)
app.include_router(health.router)

@app.get("/")
def read_root():
    return {
        "status": "active",
        "service": settings.PROJECT_NAME,
        "api_documentation": "/docs"
    }
