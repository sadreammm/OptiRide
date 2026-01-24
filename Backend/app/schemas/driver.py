from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class DriverStatus(str, Enum):
    AVAILABLE = "available"
    OFFLINE = "offline"
    BUSY = "busy"
    ON_BREAK = "on_break"

class DutyStatus(str, Enum):
    ON_DUTY = "on_duty"
    OFF_DUTY = "off_duty"


class DriverBase(BaseModel):
    name : str
    current_zone : Optional[str] = None

class LocationSchema(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    speed: Optional[float] = None
    heading: Optional[float] = None

class StatusUpdate(BaseModel):
    status: DriverStatus

class DutyStatusUpdate(BaseModel):
    duty_status: DutyStatus

class ZoneUpdate(BaseModel):
    zone_id: str

class DriverCreate(DriverBase):
    user_id : str
    vehicle_type : Optional[str] = None
    license_plate : Optional[str] = None

class DriverUpdate(DriverBase):
    user_id : str
    vehicle_type : Optional[str] = None
    license_plate : Optional[str] = None

class DriverResponse(BaseModel):
    driver_id: str
    user_id: str
    name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    license_plate: Optional[str] = None
    current_zone: Optional[str] = None
    status: DriverStatus
    location: Optional[LocationSchema] = None
    report_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    duty_status: str
    orders_received: int
    rating: float
    breaks: int
    safety_alerts: int
    fatigue_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DriverListResponse(BaseModel):
    drivers: list[DriverResponse]
    total: int

class DriverPerformanceStats(BaseModel):
    driver_id : str
    name : str

    today_orders : int
    today_breaks : int
    today_distance : float 
    today_safety_alerts : int 
    average_fatigue_score : float
    total_orders : int
    average_rating : float
    completion_rate : float
    

class NearbyDriverResponse(BaseModel):
    driver_id : str
    name : str
    status : DriverStatus
    rating : float
    latitude : float
    longitude : float
    distance_meters : float
    current_zone : Optional[str] = None

class ShiftStart(BaseModel):
    driver_id : str
    start_time : datetime
    start_latitude : float = Field(..., ge=-90, le=90)
    start_longitude : float = Field(..., ge=-180, le=180)

class ShiftEnd(BaseModel):
    driver_id : str
    end_time : datetime
    end_latitude : float = Field(..., ge=-90, le=90)
    end_longitude : float = Field(..., ge=-180, le=180)

class ShiftSummary(BaseModel):
    driver_id : str
    name : str
    start_time : datetime
    end_time : Optional[datetime]
    total_hours : float
    total_orders : int
    total_distance : float
    breaks_taken : int
    safety_alerts : int
    average_rating : float

class BreakRequest(BaseModel):
    break_type : str
    start_time : datetime
    end_time : Optional[datetime] = None
    latitude : Optional[float] = Field(None, ge=-90, le=90)
    longitude : Optional[float] = Field(None, ge=-180, le=180)

class BreakResponse(BaseModel):
    driver_id : str
    break_type : str
    start_time : datetime
    end_time : Optional[datetime] = None
    latitude : Optional[float] = None
    longitude : Optional[float] = None


