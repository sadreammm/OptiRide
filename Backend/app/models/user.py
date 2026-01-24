from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, unique=True)
    name = Column(String, nullable=False)
    user_type = Column(String) # 'driver', 'administrator'
    last_login = Column(DateTime)

    created_by = Column(String)

    driver = relationship("Driver", back_populates="user", uselist=False)


class Administrator(Base):
    __tablename__ = "administrators"

    user_id = Column(String, ForeignKey('users.user_id'), primary_key=True)
    admin_id = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)
    department = Column(String) 
    access_level = Column(Integer, default=1)  # 1 to 5

    user = relationship("User", backref="administrator")