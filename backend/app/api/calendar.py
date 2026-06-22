from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from collections import defaultdict
from typing import Dict, Any, List, Optional

from app.database import get_db
from app.models.entry import DiaryEntry, EntryAnalysis
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_calendar_entries(
    year: Optional[int] = Query(None, description="Year to filter (e.g. 2026)"),
    month: Optional[int] = Query(None, description="Month to filter (1-12)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DiaryEntry).filter(DiaryEntry.user_id == current_user.id)
    
    # If year/month provided, filter by month bounds
    if year and month:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        query = query.filter(DiaryEntry.created_at >= start_date, DiaryEntry.created_at < end_date)
        
    entries = query.order_by(DiaryEntry.created_at.asc()).all()
    
    # Group entries strictly by real calendar date (YYYY-MM-DD)
    calendar_map = defaultdict(list)
    for entry in entries:
        date_str = entry.created_at.strftime("%Y-%m-%d")
        calendar_map[date_str].append({
            "id": entry.id,
            "title": entry.title or "Reflection",
            "content": entry.content,
            "created_at": entry.created_at.isoformat(),
            "time": entry.created_at.strftime("%I:%M %p"),
            "sentiment": entry.analysis.sentiment if entry.analysis else "neutral",
            "primary_emotion": entry.analysis.primary_emotion if entry.analysis else "calm",
            "secondary_emotion": entry.analysis.secondary_emotion if entry.analysis else None,
            "emotion_score": entry.analysis.emotion_score if entry.analysis else 0.0,
            "confidence": entry.analysis.confidence if entry.analysis else 0.0,
            "intensity": entry.analysis.intensity if entry.analysis else 0.0
        })
        
    calendar_data = {}
    for date_str, day_entries in calendar_map.items():
        scores = [e["emotion_score"] for e in day_entries]
        emotions = [e["primary_emotion"] for e in day_entries]
        
        calendar_data[date_str] = {
            "date": date_str,
            "entry_count": len(day_entries),
            "emotions": list(set(emotions)),
            "dominant_emotion": max(set(emotions), key=emotions.count) if emotions else "calm",
            "average_score": round(sum(scores) / len(scores), 3) if scores else 0.0,
            "entries": day_entries
        }
        
    return {
        "total_active_days": len(calendar_data),
        "total_entries": len(entries),
        "days": calendar_data
    }
