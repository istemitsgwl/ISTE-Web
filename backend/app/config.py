import logging
import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("uvicorn")

class Settings(BaseSettings):
    PROJECT_NAME: str = "ISTE MITS Backend"
    API_V1_STR: str = "/api"

    # MongoDB Settings
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "iste_mits_db"

    # Cloudinary Settings
    CLOUDINARY_CLOUD_NAME: str = "iste_mits"
    CLOUDINARY_API_KEY: str = "mock_key"
    CLOUDINARY_API_SECRET: str = "mock_secret"

    # Auth & JWT Settings
    # SECURITY: never hardcode the JWT secret. Set JWT_SECRET_KEY via environment /
    # .env in every deployed environment. If unset, an ephemeral random secret is
    # generated at boot (sessions will not survive restarts).
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours
    GOOGLE_CLIENT_ID: str = "mock-google-client-id.apps.googleusercontent.com"

    # Initial Super Admin bootstrap account (auto-seeded on first login)
    SUPER_ADMIN_EMAIL: str = "shivampatidar780@gmail.com"

    # Server configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    # Comma-separated list of allowed browser origins. Use "*" only for local
    # experimentation — it disables credentialed CORS.
    ALLOWED_ORIGINS: str = ""
    FRONTEND_URL: str = "http://localhost:5173"

    # Email Notification Settings
    RESEND_API_KEY: str = ""
    SMTP_SERVER: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    NOTIFICATION_EMAIL: str = "shivampatidar780@gmail.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

if not settings.JWT_SECRET_KEY:
    settings.JWT_SECRET_KEY = secrets.token_urlsafe(48)
    logger.warning(
        "JWT_SECRET_KEY is not configured — generated an ephemeral secret for this "
        "process. Set the JWT_SECRET_KEY environment variable so sessions survive "
        "restarts and scale across instances."
    )
