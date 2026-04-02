import os
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "OptiRide Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/optiride")

    # Firebase Settings
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccount.json")

    # Streaming Service (Kafka) Settings
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

    # External API Settings
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Redis Settings
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))

    class Config:
        env_file = ".env"
        case_sensitive = True
    
@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000", 
    "http://localhost:8000",
    "https://admin.optiride.app",
    "http://localhost:8080"
]