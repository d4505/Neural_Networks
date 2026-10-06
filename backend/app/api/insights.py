from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import Counter
from typing import Dict, Any, List, Optional
import numpy as np

from app.database import get_db
from app.models.entry import DiaryEntry, EntryAnalysis, DailyEmotionalScore
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()

def detect_sustained_downward_trend(scores: List[float]) -> bool:
    """
    Detects if there is a sustained downward pattern over 7+ consecutive data points or days.
    Uses linear regression slope and consecutive decline threshold.
    """
    if len(scores) < 7:
        return False
        
    recent_7 = scores[-7:]
    
    # 1. Linear regression slope
    x = np.arange(len(recent_7))
    slope, _ = np.polyfit(x, recent_7, 1)
    
    # 2. Check if slope is negative and recent average is distinctly low
    avg_recent = sum(recent_7) / len(recent_7)
    
    # Downward slope (slope < -0.05) or consistently negative average (< -0.3)
    if slope < -0.05 or (avg_recent < -0.3 and slope <= 0):
        return True
        
    # 3. Check for consecutive decline over at least 5 of 6 intervals
    declines = sum(1 for i in range(len(recent_7) - 1) if recent_7[i+1] < recent_7[i])
    if declines >= 5 and avg_recent < 0:
        return True
        
    return False

def compute_observed_pattern(trajectory: List[Dict[str, Any]]) -> str:
    if not trajectory or len(trajectory) < 2:
        return "Not enough data yet"
        
    scores = [t["score"] for t in trajectory]
    x = np.arange(len(scores))
    slope, _ = np.polyfit(x, scores, 1)
    std_dev = float(np.std(scores))
    
    if std_dev > 0.4:
        return "Highly Variable"
    elif slope > 0.05:
        return "Gradually Improving"
    elif slope < -0.05:
        return "Sustained Low"
    else:
        return "Stable & Steady"

def generate_weekly_narrative(entries: List[DiaryEntry], emotion_distribution: Dict[str, float], avg_score: float) -> str:
    if not entries:
        return "No journal entries recorded for this period yet. Write your thoughts to start generating insights."
        
    total_entries = len(entries)
    dominant_emotion = max(emotion_distribution, key=emotion_distribution.get) if emotion_distribution else "calm"
    
    if avg_score > 0.3:
        tone_str = "an uplifting and positive rhythm"
    elif avg_score > 0.0:
        tone_str = "a grounded and constructive state of mind"
    elif avg_score > -0.3:
        tone_str = "some gentle ups and downs"
    else:
        tone_str = "emotional weight and challenge"
        
    return (
        f"Across your {total_entries} reflection{'s' if total_entries > 1 else ''} this week, "
        f"your writing reflects {tone_str}, with '{dominant_emotion}' being your most prominent emotional theme ({emotion_distribution.get(dominant_emotion, 0)}%). "
        f"Remember that all emotions are valid chapters of your journey."
    )

@router.get("/trajectory")
def get_emotional_trajectory(
    days: int = Query(7, ge=1, le=180, description="Number of days (e.g. 7, 30, 90 for 3 months)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    entries = db.query(DiaryEntry).filter(
        DiaryEntry.user_id == current_user.id,
        DiaryEntry.created_at >= cutoff_date
    ).order_by(DiaryEntry.created_at.asc()).all()
    
    # Also fetch daily aggregated scores
    daily_scores = db.query(DailyEmotionalScore).filter(
        DailyEmotionalScore.user_id == current_user.id,
        DailyEmotionalScore.date >= cutoff_date.strftime("%Y-%m-%d")
    ).order_by(DailyEmotionalScore.date.asc()).all()
    
    trajectory = []
    emotions = []
    raw_scores = []
    
    for entry in entries:
        if entry.analysis:
            trajectory.append({
                "id": entry.id,
                "date": entry.created_at.strftime("%Y-%m-%d"),
                "time": entry.created_at.strftime("%H:%M"),
                "datetime": entry.created_at.isoformat(),
                "title": entry.title or "Reflection",
                "score": entry.analysis.emotion_score,
                "sentiment": entry.analysis.sentiment,
                "primary_emotion": entry.analysis.primary_emotion,
                "confidence": entry.analysis.confidence
            })
            emotions.append(entry.analysis.primary_emotion)
            raw_scores.append(entry.analysis.emotion_score)
            
    # Trend Detection for Gentle Wellbeing Nudge (Section 17)
    show_nudge = detect_sustained_downward_trend(raw_scores)
    pattern = compute_observed_pattern(trajectory)
    
    emotion_counts = Counter(emotions)
    total_emotions = sum(emotion_counts.values())
    emotion_distribution = {}
    if total_emotions > 0:
        emotion_distribution = {k: round((v / total_emotions) * 100, 1) for k, v in emotion_counts.items()}
        
    avg_score = round(sum(raw_scores) / len(raw_scores), 3) if raw_scores else 0.0
    
    return {
        "timeframe_days": days,
        "total_entries": len(entries),
        "average_score": avg_score,
        "trajectory": trajectory,
        "daily_aggregates": [
            {
                "date": d.date,
                "average_score": d.average_emotion_score,
                "entry_count": d.entry_count,
                "dominant_emotion": d.dominant_emotion,
                "trend": d.trend
            }
            for d in daily_scores
        ],
        "emotion_distribution": emotion_distribution,
        "observed_pattern": pattern,
        "show_nudge": show_nudge,
        "nudge_message": (
            "We noticed your reflections have felt progressively heavier over the past week. "
            "Be kind to yourself today — consider taking a short restorative break, talking to a trusted friend, or seeking human support."
            if show_nudge else None
        ),
        "disclaimer": "Observed emotional patterns are derived from self-reflections and are not a clinical diagnosis or medical assessment."
    }

@router.get("/weekly")
def get_weekly_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cutoff_date = datetime.utcnow() - timedelta(days=7)
    entries = db.query(DiaryEntry).filter(
        DiaryEntry.user_id == current_user.id,
        DiaryEntry.created_at >= cutoff_date
    ).order_by(DiaryEntry.created_at.asc()).all()
    
    trajectory = []
    emotions = []
    scores = []
    
    for entry in entries:
        if entry.analysis:
            trajectory.append({
                "id": entry.id,
                "date": entry.created_at.strftime("%Y-%m-%d"),
                "time": entry.created_at.strftime("%H:%M"),
                "datetime": entry.created_at.isoformat(),
                "title": entry.title or "Reflection",
                "score": entry.analysis.emotion_score,
                "sentiment": entry.analysis.sentiment,
                "primary_emotion": entry.analysis.primary_emotion,
                "confidence": entry.analysis.confidence
            })
            emotions.append(entry.analysis.primary_emotion)
            scores.append(entry.analysis.emotion_score)
            
    emotion_counts = Counter(emotions)
    total = sum(emotion_counts.values())
    dist = {k: round((v / total) * 100, 1) for k, v in emotion_counts.items()} if total > 0 else {}
    avg_score = round(sum(scores) / len(scores), 3) if scores else 0.0
    
    show_nudge = detect_sustained_downward_trend(scores)
    pattern = compute_observed_pattern(trajectory)
    summary = generate_weekly_narrative(entries, dist, avg_score)
    
    return {
        "period": "7_days",
        "total_entries": len(entries),
        "average_score": avg_score,
        "trajectory": trajectory,
        "emotion_distribution": dist,
        "observed_pattern": pattern,
        "show_nudge": show_nudge,
        "nudge_message": (
            "We noticed your reflections have felt progressively heavier over the past week. "
            "Be kind to yourself today — consider taking a short restorative break or reaching out to someone you care about."
            if show_nudge else None
        ),
        "weekly_summary": summary
    }

@router.get("/monthly")
def get_monthly_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cutoff_date = datetime.utcnow() - timedelta(days=30)
    entries = db.query(DiaryEntry).filter(
        DiaryEntry.user_id == current_user.id,
        DiaryEntry.created_at >= cutoff_date
    ).order_by(DiaryEntry.created_at.asc()).all()
    
    trajectory = []
    emotions = []
    scores = []
    
    for entry in entries:
        if entry.analysis:
            trajectory.append({
                "id": entry.id,
                "date": entry.created_at.strftime("%Y-%m-%d"),
                "time": entry.created_at.strftime("%H:%M"),
                "datetime": entry.created_at.isoformat(),
                "title": entry.title or "Reflection",
                "score": entry.analysis.emotion_score,
                "sentiment": entry.analysis.sentiment,
                "primary_emotion": entry.analysis.primary_emotion,
                "confidence": entry.analysis.confidence
            })
            emotions.append(entry.analysis.primary_emotion)
            scores.append(entry.analysis.emotion_score)
            
    emotion_counts = Counter(emotions)
    total = sum(emotion_counts.values())
    dist = {k: round((v / total) * 100, 1) for k, v in emotion_counts.items()} if total > 0 else {}
    avg_score = round(sum(scores) / len(scores), 3) if scores else 0.0
    
    return {
        "period": "30_days",
        "total_entries": len(entries),
        "average_score": avg_score,
        "trajectory": trajectory,
        "emotion_distribution": dist,
        "observed_pattern": compute_observed_pattern(trajectory),
        "show_nudge": detect_sustained_downward_trend(scores)
    }

@router.get("/streaks")
def get_streak_and_rewards(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Calculates user's consecutive day streaks, habit matrix, and unlockable rewards/milestones.
    """
    import json
    entries = db.query(DiaryEntry).filter(
        DiaryEntry.user_id == current_user.id
    ).order_by(DiaryEntry.created_at.asc()).all()
    
    total_entries = len(entries)
    if total_entries == 0:
        today = datetime.utcnow().date()
        habit_days = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            habit_days.append({
                "date": d.strftime("%Y-%m-%d"),
                "day_name": d.strftime("%a"),
                "has_entry": False,
                "count": 0,
                "is_today": i == 0
            })
            
        all_badges = [
            {"id": "first_entry", "title": "First Spark", "description": "Write your first reflection", "icon": "🌱", "unlocked": False, "progress": 0, "max_progress": 1, "category": "milestone"},
            {"id": "streak_3", "title": "3-Day Flow", "description": "Maintain a 3-day journaling streak", "icon": "🔥", "unlocked": False, "progress": 0, "max_progress": 3, "category": "streak"},
            {"id": "streak_7", "title": "7-Day Clarity", "description": "Maintain a 7-day mindful habit", "icon": "✨", "unlocked": False, "progress": 0, "max_progress": 7, "category": "streak"},
            {"id": "streak_14", "title": "14-Day Fortitude", "description": "Maintain a 14-day streak", "icon": "🌿", "unlocked": False, "progress": 0, "max_progress": 14, "category": "streak"},
            {"id": "streak_30", "title": "30-Day Zen Master", "description": "Complete a full month of awareness", "icon": "👑", "unlocked": False, "progress": 0, "max_progress": 30, "category": "streak"},
            {"id": "polyglot", "title": "Polyglot Reflector", "description": "Reflect across multiple languages", "icon": "🌐", "unlocked": False, "progress": 0, "max_progress": 2, "category": "expression"},
            {"id": "deep_diver", "title": "Deep Explorer", "description": "Write a detailed reflection (200+ words)", "icon": "📖", "unlocked": False, "progress": 0, "max_progress": 1, "category": "expression"},
            {"id": "night_calm", "title": "Night Calm", "description": "Reflect during peaceful evening hours (after 9 PM)", "icon": "🌙", "unlocked": False, "progress": 0, "max_progress": 1, "category": "mindfulness"},
            {"id": "morning_sun", "title": "Morning Sun", "description": "Start your day with morning awareness (before 10 AM)", "icon": "🌅", "unlocked": False, "progress": 0, "max_progress": 1, "category": "mindfulness"},
            {"id": "milestone_10", "title": "10 Reflections", "description": "Complete 10 journal reflections", "icon": "💎", "unlocked": False, "progress": 0, "max_progress": 10, "category": "milestone"}
        ]
        
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "total_entries": 0,
            "streak_active_today": False,
            "grace_period_active": False,
            "habit_matrix": habit_days,
            "badges": all_badges,
            "unlocked_count": 0,
            "total_badges": len(all_badges),
            "level": 1,
            "xp": 0,
            "next_level_xp": 150
        }

    # Extract dates & entry metadata
    entry_dates = set()
    all_languages = set()
    has_night_entry = False
    has_morning_entry = False
    max_word_count = 0
    date_to_entries = {}

    for e in entries:
        dt = e.created_at
        d_str = dt.strftime("%Y-%m-%d")
        entry_dates.add(d_str)
        
        if d_str not in date_to_entries:
            date_to_entries[d_str] = []
        date_to_entries[d_str].append(e)

        words = len((e.content or "").split())
        if words > max_word_count:
            max_word_count = words
            
        if dt.hour >= 21 or dt.hour < 4:
            has_night_entry = True
        elif 5 <= dt.hour < 10:
            has_morning_entry = True

        if e.analysis and e.analysis.languages_detected:
            try:
                langs = json.loads(e.analysis.languages_detected)
                for l in langs:
                    all_languages.add(l)
            except Exception:
                pass

    # Streak Calculation
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    today_str = today.strftime("%Y-%m-%d")
    yesterday_str = yesterday.strftime("%Y-%m-%d")
    
    streak_active_today = today_str in entry_dates
    grace_period_active = (not streak_active_today) and (yesterday_str in entry_dates)
    
    current_streak = 0
    check_date = today if streak_active_today else yesterday
    
    while check_date.strftime("%Y-%m-%d") in entry_dates:
        current_streak += 1
        check_date -= timedelta(days=1)
        
    if not streak_active_today and not grace_period_active:
        current_streak = 0

    sorted_unique_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in entry_dates])
    longest_streak = 0
    temp_streak = 0
    prev_d = None
    
    for d in sorted_unique_dates:
        if prev_d is None:
            temp_streak = 1
        elif (d - prev_d).days == 1:
            temp_streak += 1
        elif (d - prev_d).days > 1:
            temp_streak = 1
        prev_d = d
        if temp_streak > longest_streak:
            longest_streak = temp_streak
            
    longest_streak = max(longest_streak, current_streak)

    habit_days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        day_entries = date_to_entries.get(d_str, [])
        habit_days.append({
            "date": d_str,
            "day_name": d.strftime("%a"),
            "has_entry": len(day_entries) > 0,
            "count": len(day_entries),
            "is_today": i == 0
        })

    badges = [
        {
            "id": "first_entry",
            "title": "First Spark",
            "description": "Write your first reflection",
            "icon": "🌱",
            "unlocked": total_entries >= 1,
            "progress": min(total_entries, 1),
            "max_progress": 1,
            "category": "milestone"
        },
        {
            "id": "streak_3",
            "title": "3-Day Flow",
            "description": "Maintain a 3-day journaling streak",
            "icon": "🔥",
            "unlocked": longest_streak >= 3,
            "progress": min(longest_streak, 3),
            "max_progress": 3,
            "category": "streak"
        },
        {
            "id": "streak_7",
            "title": "7-Day Clarity",
            "description": "Maintain a 7-day mindful habit",
            "icon": "✨",
            "unlocked": longest_streak >= 7,
            "progress": min(longest_streak, 7),
            "max_progress": 7,
            "category": "streak"
        },
        {
            "id": "streak_14",
            "title": "14-Day Fortitude",
            "description": "Maintain a 14-day streak",
            "icon": "🌿",
            "unlocked": longest_streak >= 14,
            "progress": min(longest_streak, 14),
            "max_progress": 14,
            "category": "streak"
        },
        {
            "id": "streak_30",
            "title": "30-Day Zen Master",
            "description": "Complete a full month of awareness",
            "icon": "👑",
            "unlocked": longest_streak >= 30,
            "progress": min(longest_streak, 30),
            "max_progress": 30,
            "category": "streak"
        },
        {
            "id": "polyglot",
            "title": "Polyglot Reflector",
            "description": "Reflect across multiple languages",
            "icon": "🌐",
            "unlocked": len(all_languages) >= 2,
            "progress": min(len(all_languages), 2),
            "max_progress": 2,
            "category": "expression"
        },
        {
            "id": "deep_diver",
            "title": "Deep Explorer",
            "description": "Write a detailed reflection (200+ words)",
            "icon": "📖",
            "unlocked": max_word_count >= 200,
            "progress": 1 if max_word_count >= 200 else 0,
            "max_progress": 1,
            "category": "expression"
        },
        {
            "id": "night_calm",
            "title": "Night Calm",
            "description": "Reflect during peaceful evening hours (after 9 PM)",
            "icon": "🌙",
            "unlocked": has_night_entry,
            "progress": 1 if has_night_entry else 0,
            "max_progress": 1,
            "category": "mindfulness"
        },
        {
            "id": "morning_sun",
            "title": "Morning Sun",
            "description": "Start your day with morning awareness (before 10 AM)",
            "icon": "🌅",
            "unlocked": has_morning_entry,
            "progress": 1 if has_morning_entry else 0,
            "max_progress": 1,
            "category": "mindfulness"
        },
        {
            "id": "milestone_10",
            "title": "10 Reflections",
            "description": "Complete 10 journal reflections",
            "icon": "💎",
            "unlocked": total_entries >= 10,
            "progress": min(total_entries, 10),
            "max_progress": 10,
            "category": "milestone"
        }
    ]

    unlocked_count = sum(1 for b in badges if b["unlocked"])
    total_xp = (total_entries * 25) + (current_streak * 50) + (unlocked_count * 100)
    level = (total_xp // 150) + 1
    current_level_xp = total_xp % 150
    next_level_xp = 150

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_entries": total_entries,
        "streak_active_today": streak_active_today,
        "grace_period_active": grace_period_active,
        "habit_matrix": habit_days,
        "badges": badges,
        "unlocked_count": unlocked_count,
        "total_badges": len(badges),
        "level": level,
        "xp": current_level_xp,
        "total_xp": total_xp,
        "next_level_xp": next_level_xp,
        "max_word_count": max_word_count,
        "languages_used": list(all_languages)
    }
