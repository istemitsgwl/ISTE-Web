import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

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
    JWT_SECRET_KEY: str = "iste-mits-jwt-secret-key-2026-super-secure"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 4320
    GOOGLE_CLIENT_ID: str = "mock-google-client-id.apps.googleusercontent.com"
    
    # Server configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ALLOWED_ORIGINS: str = "*"
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
