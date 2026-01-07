from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, ARRAY
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
    accelerometer_x = Column(Float, nullable=False)
    accelerometer_y = Column(Float, nullable=False)
    accelerometer_z = Column(Float, nullable=False)
    gyroscope_x = Column(Float, nullable=False)
    gyroscope_y = Column(Float, nullable=False)
    gyroscope_z = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    driver = relationship("Driver", back_populates="sensor_records")