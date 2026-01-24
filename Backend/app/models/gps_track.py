from sqlalchemy import Column, String, ForeignKey, Float, DateTime
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid

class GPSTrack(Base):
    __tablename__ = "gps_tracks"

    track_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    driver_id = Column(String, ForeignKey('drivers.driver_id'), nullable=False)

    location = Column(Geometry('POINT'), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    speed = Column(Float)
    heading = Column(Float)
    altitude = Column(Float)
    accuracy = Column(Float)

    distance_from_last = Column(Float, default=0.0)
    cumulative_distance = Column(Float, default=0.0)

    session_id = Column(String, nullable=True)
    recorded_at = Column(DateTime, nullable=False)
    
    driver = relationship("Driver", back_populates="gps_tracks")