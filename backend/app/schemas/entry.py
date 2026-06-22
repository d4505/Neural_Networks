from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class EntryAnalysisBase(BaseModel):
    sentiment: str
    sentiment_score: float = 0.0
    primary_emotion: str
    secondary_emotion: Optional[str] = None
    emotion_score: float = 0.0
    intensity: float = 0.0
    confidence: float = 0.0
    languages_detected: str = "[\"English\"]"
    explanation: Optional[str] = None
    salient_tokens: Optional[str] = None
    model_version: str = "MuRIL-multitask-v1.0"
    is_safety_flagged: bool = False
    safety_message: Optional[str] = None

class EntryAnalysis(EntryAnalysisBase):
    id: int
    entry_id: int

    class Config:
        from_attributes = True
        orm_mode = True

class EntryBase(BaseModel):
    title: Optional[str] = "Personal Reflection"
    content: str = Field(..., min_length=1, description="Journal entry content")

class EntryCreate(EntryBase):
    pass

class EntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Entry(EntryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    analysis: Optional[EntryAnalysis] = None

    class Config:
        from_attributes = True
        orm_mode = True

class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to analyze")

class TextAnalysisResponse(BaseModel):
    sentiment: str
    sentiment_score: float
    primary_emotion: str
    secondary_emotion: Optional[str] = None
    emotion_score: float
    intensity: float
    confidence: float
    languages_detected: List[str]
    model_version: str
    explanation: str
    salient_tokens: List[str]
    safety: dict
