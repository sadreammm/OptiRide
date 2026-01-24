import os
from pydantic import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "OptiRide Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/optiride")

    # Firebase Settings
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccount.json")

    # External API Settings
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        case_sensitive = True
    
@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
# CORS origins - hardcoded for now since env parsing is having issues
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000", 
    "http://localhost:8000",
    "*"
]