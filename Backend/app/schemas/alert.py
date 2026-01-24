from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class AlertType(str, Enum):
    FATIGUE = "fatigue"
    HARSH_BRAKING = "harsh_braking"
    HARSH_ACCELERATION = "harsh_acceleration"
    UNUSUAL_MOVEMENT = "unusual_movement"
    ACCIDENT = "accident"
    SPEEDING = "speeding"

class AlertSeverity(int, Enum):
    LOW = 1
    MODERATE = 2
    WARNING = 3
    CRITICAL = 4

class AlertCreate(BaseModel):
    driver_id: str
    alert_type: AlertType
    severity: AlertSeverity
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class AlertResponse(BaseModel):
    alert_id: str
    driver_id: str
    alert_type: str
    severity: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: datetime
    acknowledged: bool

    class Config:
        from_attributes = True

class AlertAcknowledge(BaseModel):
    acknowledged: bool = True
