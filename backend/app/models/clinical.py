from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class PsychometricAssessment(Base):
    __tablename__ = "psychometric_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_type = Column(String(20), nullable=False, index=True) # "PHQ-9" or "GAD-7"
    total_score = Column(Integer, nullable=False)
    severity = Column(String(50), nullable=False) # e.g. "Minimal", "Mild", "Moderate", "Moderately Severe", "Severe"
    answers = Column(Text, nullable=False) # JSON array of 0-3 scores
    notes = Column(Text, nullable=True) # Optional user self-reflection note
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="psychometric_assessments")
