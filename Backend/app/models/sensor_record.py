from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, ARRAY, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.database import Base
import uuid
from datetime import datetime


class SensorRecord(Base):
    __tablename__ = "sensor_records"

    record_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    driver_id = Column(String, ForeignKey('drivers.driver_id'), nullable=False)

    accelerometer_x = Column(Float)
    accelerometer_y = Column(Float)
    accelerometer_z = Column(Float)
    gyroscope_x = Column(Float)
    gyroscope_y = Column(Float)
    gyroscope_z = Column(Float)

    acceleration_magnitude = Column(Float)
    angular_velocity_magnitude = Column(Float)

    fatigue_score = Column(Float, default=0.0)
    eye_blink_rate = Column(Float)
    yawn_detected = Column(Boolean, default=False)
    head_tilt_rate = Column(Float)

    harsh_braking = Column(Boolean, default=False)
    harsh_acceleration = Column(Boolean, default=False)
    sharp_turn = Column(Boolean, default=False)
    sudden_impact = Column(Boolean, default=False)

    latitude = Column(Float)
    longitude = Column(Float)
    speed = Column(Float)

    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    processed_at = Column(DateTime)

    driver = relationship("Driver", back_populates="sensor_records")