from sqlalchemy import Column, String, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from app.db.database import Base
from sqlalchemy.orm import relationship

class Zone(Base):
    __tablename__ = "zones"

    zone_id = Column(String, primary_key=True)
    centroid = Column(Geometry('POINT'), nullable=False)
    demand_score = Column(Float, default=0.0)
    active_drivers = Column(Integer, default=0)

    demands = relationship("Demand", back_populates="zone")