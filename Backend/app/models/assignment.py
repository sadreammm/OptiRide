from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.database import Base
import uuid
from datetime import datetime

class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    driver = Column(String, ForeignKey('drivers.driver_id'), nullable=False)
    orders = Column(ARRAY(String), nullable=False)
    route = Column(ARRAY(Geometry('POINT')), nullable=False)
    eta = Column(DateTime)
    status = Column(String, default="assigned")  # assigned, in_progress, completed, cancelled
    assigned_at = Column(DateTime, default=datetime.utcnow)

    driver_rel = relationship("Driver", back_populates="assignments")
    orders_rel = relationship("Order", primaryjoin="Assignment.orders.any(Order.order_id)", viewonly=True)