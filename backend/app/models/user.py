from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    consent_model_training = Column(Boolean, default=False)
    theme_preference = Column(String(20), default="system") # light, dark, system
    created_at = Column(DateTime, default=datetime.utcnow)

    entries = relationship("DiaryEntry", back_populates="owner", cascade="all, delete-orphan")
