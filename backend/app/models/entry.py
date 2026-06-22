from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class DiaryEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="entries")
    analysis = relationship("EntryAnalysis", back_populates="entry", uselist=False, cascade="all, delete-orphan")

class EntryAnalysis(Base):
    __tablename__ = "entry_analysis"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    sentiment = Column(String(50), nullable=False)
    sentiment_score = Column(Float, nullable=False, default=0.0)
    primary_emotion = Column(String(50), nullable=False)
    secondary_emotion = Column(String(50), nullable=True)
    emotion_score = Column(Float, nullable=False, default=0.0)
    intensity = Column(Float, nullable=False, default=0.0)
    confidence = Column(Float, nullable=False, default=0.0)
    languages_detected = Column(Text, nullable=False) # JSON array string
    explanation = Column(Text, nullable=True)
    salient_tokens = Column(Text, nullable=True) # JSON array string
    model_version = Column(String(100), nullable=False)
    is_safety_flagged = Column(Boolean, default=False)
    safety_message = Column(Text, nullable=True)

    entry = relationship("DiaryEntry", back_populates="analysis")

class DailyEmotionalScore(Base):
    __tablename__ = "daily_emotional_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    average_emotion_score = Column(Float, nullable=False, default=0.0)
    entry_count = Column(Integer, nullable=False, default=1)
    dominant_emotion = Column(String(50), nullable=True)
    trend = Column(String(50), nullable=True) # "improving", "declining", "stable", "fluctuating"
