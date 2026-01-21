from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings, ALLOWED_ORIGINS
from app.routers.auth import router as auth_router
from app.routers.driver import router as driver_router

app = FastAPI(
    title="Optiride Backend API",
    description="API for the Optiride backend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(driver_router, prefix="/drivers", tags=["Drivers"])

@app.get("/")
async def root():
    return {"message": "Optiride Backend API is running."}
