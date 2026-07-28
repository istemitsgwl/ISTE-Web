import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ISTE MITS Backend"
    API_V1_STR: str = "/api"
    
    # Firebase settings
    FIREBASE_PROJECT_ID: str = "iste-mits-2026"
    FIREBASE_CREDENTIALS_PATH: Optional[str] = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "serviceAccountKey.json"
    )
    
    # Razorpay settings (mocked by default, set via env for production)
    RAZORPAY_KEY_ID: str = "rzp_test_mockkeyid123"
    RAZORPAY_KEY_SECRET: str = "mockkeysecret456"
    RAZORPAY_WEBHOOK_SECRET: str = "mockwebhooksecret789"
    
    # Server configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ALLOWED_ORIGINS: str = "*"
    FRONTEND_URL: str = "http://localhost:5173"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
