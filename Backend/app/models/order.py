from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.database import Base
import uuid
from datetime import datetime

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pickup = Column(Geometry('POINT'), nullable=False)
    dropoff = Column(Geometry('POINT'), nullable=False)
    status = Column(String, default="pending") # pending, assigned, picked_up, delivered, cancelled
    driver_id = Column(String, ForeignKey('drivers.driver_id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    assigned_at = Column(DateTime)
    picked_up_at = Column(DateTime)
    delivered_at = Column(DateTime)

    driver = relationship("Driver", back_populates="orders")