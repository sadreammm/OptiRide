from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, ARRAY, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.database import Base
import uuid
from datetime import datetime

class Demand(Base):
    __tablename__ = "demands"

    demand_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    zone_id = Column(String, ForeignKey('zones.zone_id'), nullable=False)
    demand = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    demandThresholdExceeded = Column(Boolean, default=False)
    influencing_factors = Column(ARRAY(String))
    timestamp = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="demands")

class GenInsights(Base):
    __tablename__ = "gen_insights"

    insight_id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    recepient_id = Column(String, ForeignKey('drivers.driver_id'), nullable=False)
    message = Column(String, nullable=False)
    priority = Column(Integer, nullable=False)  # 1 (low) to 5 (high)
    created_at = Column(DateTime, default=datetime.utcnow)