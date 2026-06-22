import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.entry import DiaryEntry, EntryAnalysis, DailyEmotionalScore
from app.schemas.entry import Entry, EntryCreate, EntryUpdate, TextAnalysisRequest, TextAnalysisResponse, EntryAnalysis as EntryAnalysisSchema
from app.api.auth import get_current_user
from app.models.user import User
from app.services.ml_pipeline import analyze_text

router = APIRouter()

def sync_daily_emotional_score(user_id: int, date_str: str, db: Session):
    # Fetch all entries for this user on this date
    # Start and end of the day
    start_date = datetime.strptime(f"{date_str} 00:00:00", "%Y-%m-%d %H:%M:%S")
    end_date = datetime.strptime(f"{date_str} 23:59:59", "%Y-%m-%d %H:%M:%S")
    
    entries = db.query(DiaryEntry).filter(
        DiaryEntry.user_id == user_id,
        DiaryEntry.created_at >= start_date,
        DiaryEntry.created_at <= end_date
    ).all()
    
    daily_record = db.query(DailyEmotionalScore).filter(
        DailyEmotionalScore.user_id == user_id,
        DailyEmotionalScore.date == date_str
    ).first()
    
    if not entries:
        if daily_record:
            db.delete(daily_record)
            db.commit()
        return
        
    scores = [e.analysis.emotion_score for e in entries if e.analysis]
    avg_score = sum(scores) / len(scores) if scores else 0.0
    
    # Calculate dominant emotion
    emotions = [e.analysis.primary_emotion for e in entries if e.analysis]
    dominant = max(set(emotions), key=emotions.count) if emotions else "calm"
    
    trend = "stable"
    if avg_score > 0.2:
        trend = "positive"
    elif avg_score < -0.2:
        trend = "negative"
        
    if not daily_record:
        daily_record = DailyEmotionalScore(
            user_id=user_id,
            date=date_str,
            average_emotion_score=round(avg_score, 4),
            entry_count=len(entries),
            dominant_emotion=dominant,
            trend=trend
        )
        db.add(daily_record)
    else:
        daily_record.average_emotion_score = round(avg_score, 4)
        daily_record.entry_count = len(entries)
        daily_record.dominant_emotion = dominant
        daily_record.trend = trend
        
    db.commit()

@router.post("/", response_model=Entry, status_code=status.HTTP_201_CREATED)
def create_entry(entry: EntryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_entry = DiaryEntry(
        user_id=current_user.id,
        title=entry.title or "Personal Reflection",
        content=entry.content.strip()
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    # Execute actual ML Model Inference
    try:
        analysis_result = analyze_text(db_entry.content)
        safety_info = analysis_result.get("safety", {})
        
        db_analysis = EntryAnalysis(
            entry_id=db_entry.id,
            sentiment=analysis_result["sentiment"],
            sentiment_score=analysis_result["sentiment_score"],
            primary_emotion=analysis_result["primary_emotion"],
            secondary_emotion=analysis_result["secondary_emotion"],
            emotion_score=analysis_result["emotion_score"],
            intensity=analysis_result["intensity"],
            confidence=analysis_result["confidence"],
            languages_detected=analysis_result["languages_detected"],
            explanation=analysis_result["explanation"],
            salient_tokens=json.dumps(analysis_result.get("salient_tokens", [])),
            model_version=analysis_result["model_version"],
            is_safety_flagged=safety_info.get("flagged", False),
            safety_message=safety_info.get("message")
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_entry)
        
        # Sync daily score aggregate
        date_str = db_entry.created_at.strftime("%Y-%m-%d")
        sync_daily_emotional_score(current_user.id, date_str, db)
        
    except Exception as e:
        print(f"Error during ML inference for entry {db_entry.id}: {e}")
        
    return db_entry

@router.get("/", response_model=List[Entry])
def read_entries(
    search: Optional[str] = Query(None, description="Search keyword across entry text and title"),
    emotion: Optional[str] = Query(None, description="Filter by primary emotion"),
    language: Optional[str] = Query(None, description="Filter by detected language"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DiaryEntry).filter(DiaryEntry.user_id == current_user.id)
    
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                DiaryEntry.content.ilike(search_pattern),
                DiaryEntry.title.ilike(search_pattern)
            )
        )
        
    if emotion:
        query = query.join(EntryAnalysis).filter(EntryAnalysis.primary_emotion.ilike(emotion.strip()))
        
    if language:
        query = query.join(EntryAnalysis).filter(EntryAnalysis.languages_detected.ilike(f"%{language.strip()}%"))
        
    entries = query.order_by(DiaryEntry.created_at.desc()).offset(skip).limit(limit).all()
    return entries

@router.get("/{entry_id}", response_model=Entry)
def read_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id, DiaryEntry.user_id == current_user.id).first()
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
    return entry

@router.put("/{entry_id}", response_model=Entry)
def update_entry(entry_id: int, payload: EntryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id, DiaryEntry.user_id == current_user.id).first()
    if db_entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
        
    if payload.title is not None:
        db_entry.title = payload.title
    if payload.content is not None:
        db_entry.content = payload.content.strip()
        db_entry.updated_at = datetime.utcnow()
        
        # Re-run ML Inference
        analysis_result = analyze_text(db_entry.content)
        safety_info = analysis_result.get("safety", {})
        
        if db_entry.analysis:
            db_entry.analysis.sentiment = analysis_result["sentiment"]
            db_entry.analysis.sentiment_score = analysis_result["sentiment_score"]
            db_entry.analysis.primary_emotion = analysis_result["primary_emotion"]
            db_entry.analysis.secondary_emotion = analysis_result["secondary_emotion"]
            db_entry.analysis.emotion_score = analysis_result["emotion_score"]
            db_entry.analysis.intensity = analysis_result["intensity"]
            db_entry.analysis.confidence = analysis_result["confidence"]
            db_entry.analysis.languages_detected = analysis_result["languages_detected"]
            db_entry.analysis.explanation = analysis_result["explanation"]
            db_entry.analysis.salient_tokens = json.dumps(analysis_result.get("salient_tokens", []))
            db_entry.analysis.is_safety_flagged = safety_info.get("flagged", False)
            db_entry.analysis.safety_message = safety_info.get("message")
        else:
            db_analysis = EntryAnalysis(
                entry_id=db_entry.id,
                sentiment=analysis_result["sentiment"],
                sentiment_score=analysis_result["sentiment_score"],
                primary_emotion=analysis_result["primary_emotion"],
                secondary_emotion=analysis_result["secondary_emotion"],
                emotion_score=analysis_result["emotion_score"],
                intensity=analysis_result["intensity"],
                confidence=analysis_result["confidence"],
                languages_detected=analysis_result["languages_detected"],
                explanation=analysis_result["explanation"],
                salient_tokens=json.dumps(analysis_result.get("salient_tokens", [])),
                model_version=analysis_result["model_version"],
                is_safety_flagged=safety_info.get("flagged", False),
                safety_message=safety_info.get("message")
            )
            db.add(db_analysis)
            
    db.commit()
    db.refresh(db_entry)
    
    date_str = db_entry.created_at.strftime("%Y-%m-%d")
    sync_daily_emotional_score(current_user.id, date_str, db)
    return db_entry

@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id, DiaryEntry.user_id == current_user.id).first()
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
        
    date_str = entry.created_at.strftime("%Y-%m-%d")
    db.delete(entry)
    db.commit()
    
    sync_daily_emotional_score(current_user.id, date_str, db)
    return {"ok": True, "message": "Entry and associated analysis deleted successfully"}

@router.get("/{entry_id}/analysis", response_model=EntryAnalysisSchema)
def get_entry_analysis(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id, DiaryEntry.user_id == current_user.id).first()
    if entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
    if not entry.analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No analysis associated with this entry")
    return entry.analysis

@router.post("/analyze-entry", response_model=TextAnalysisResponse)
def live_analyze_entry(payload: TextAnalysisRequest):
    """Standalone live analysis of arbitrary text for real-time preview without persisting."""
    result = analyze_text(payload.text)
    return {
        "sentiment": result["sentiment"],
        "sentiment_score": result["sentiment_score"],
        "primary_emotion": result["primary_emotion"],
        "secondary_emotion": result["secondary_emotion"],
        "emotion_score": result["emotion_score"],
        "intensity": result["intensity"],
        "confidence": result["confidence"],
        "languages_detected": json.loads(result["languages_detected"]),
        "model_version": result["model_version"],
        "explanation": result["explanation"],
        "salient_tokens": result.get("salient_tokens", []),
        "safety": result.get("safety", {"flagged": False, "message": None, "helplines": []})
    }
