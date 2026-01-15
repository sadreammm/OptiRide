import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "OptiRide Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    # Firebase Settings
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccount.json")

    # Big Data Storage (AWS S3) Settings

    # Streaming Service (Kafka) Settings

    # External API Settings
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # CORS Settings
    ALLOWED_ORIGINS: list = ["*"] # Change this in production to specific domains

    # Cache Settings (Maybe Redis?)

    # Notification Service Settings 

    class Config:
        env_file = ".env"
        case_sensitive = True
    
@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()