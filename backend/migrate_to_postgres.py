import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.user import User
from app.models.entry import DiaryEntry, EntryAnalysis, DailyEmotionalScore
from app.database import Base

def migrate(sqlite_uri="sqlite:///./journal.db", target_postgres_uri=None):
    if not target_postgres_uri:
        target_postgres_uri = os.getenv("DATABASE_URL")
        
    if not target_postgres_uri or target_postgres_uri.startswith("sqlite"):
        print("Error: Please provide a target PostgreSQL URI (e.g. postgresql://user:pass@host:5432/dbname)")
        print("Usage: python migrate_to_postgres.py <postgres_connection_string>")
        return

    # Normalize uri
    if target_postgres_uri.startswith("postgres://"):
        target_postgres_uri = target_postgres_uri.replace("postgres://", "postgresql://", 1)

    print(f"Source SQLite: {sqlite_uri}")
    print(f"Target PostgreSQL: {target_postgres_uri.split('@')[-1] if '@' in target_postgres_uri else 'configured'}")

    # Connect to SQLite
    sqlite_engine = create_engine(sqlite_uri, connect_args={"check_same_thread": False})
    SqliteSession = sessionmaker(bind=sqlite_engine)
    src_db = SqliteSession()

    # Connect to PostgreSQL and create schema
    pg_engine = create_engine(target_postgres_uri, pool_pre_ping=True)
    print("Creating tables in PostgreSQL...")
    Base.metadata.create_all(bind=pg_engine)
    PgSession = sessionmaker(bind=pg_engine)
    dst_db = PgSession()

    try:
        # 1. Migrate Users
        users = src_db.query(User).all()
        print(f"Migrating {len(users)} users...")
        for u in users:
            existing = dst_db.query(User).filter(User.email == u.email).first()
            if not existing:
                new_u = User(
                    id=u.id,
                    name=u.name,
                    email=u.email,
                    password_hash=u.password_hash,
                    consent_model_training=u.consent_model_training,
                    theme_preference=u.theme_preference,
                    created_at=u.created_at
                )
                dst_db.add(new_u)
        dst_db.commit()

        # 2. Migrate Diary Entries
        entries = src_db.query(DiaryEntry).all()
        print(f"Migrating {len(entries)} diary entries...")
        for e in entries:
            existing = dst_db.query(DiaryEntry).filter(DiaryEntry.id == e.id).first()
            if not existing:
                new_e = DiaryEntry(
                    id=e.id,
                    user_id=e.user_id,
                    title=e.title,
                    content=e.content,
                    created_at=e.created_at,
                    updated_at=e.updated_at
                )
                dst_db.add(new_e)
        dst_db.commit()

        # 3. Migrate Entry Analysis
        analyses = src_db.query(EntryAnalysis).all()
        print(f"Migrating {len(analyses)} emotion analyses...")
        for a in analyses:
            existing = dst_db.query(EntryAnalysis).filter(EntryAnalysis.id == a.id).first()
            if not existing:
                new_a = EntryAnalysis(
                    id=a.id,
                    entry_id=a.entry_id,
                    sentiment=a.sentiment,
                    sentiment_score=a.sentiment_score,
                    primary_emotion=a.primary_emotion,
                    secondary_emotion=a.secondary_emotion,
                    emotion_score=a.emotion_score,
                    intensity=a.intensity,
                    confidence=a.confidence,
                    languages_detected=a.languages_detected,
                    explanation=a.explanation,
                    salient_tokens=a.salient_tokens,
                    model_version=a.model_version,
                    is_safety_flagged=a.is_safety_flagged,
                    safety_message=a.safety_message
                )
                dst_db.add(new_a)
        dst_db.commit()

        # 4. Migrate Daily Scores
        scores = src_db.query(DailyEmotionalScore).all()
        print(f"Migrating {len(scores)} daily emotional score summaries...")
        for s in scores:
            existing = dst_db.query(DailyEmotionalScore).filter(DailyEmotionalScore.id == s.id).first()
            if not existing:
                new_s = DailyEmotionalScore(
                    id=s.id,
                    user_id=s.user_id,
                    date=s.date,
                    average_emotion_score=s.average_emotion_score,
                    entry_count=s.entry_count,
                    dominant_emotion=s.dominant_emotion,
                    trend=s.trend
                )
                dst_db.add(new_s)
        dst_db.commit()

        print("Successfully migrated all data to PostgreSQL!")

    except Exception as exc:
        dst_db.rollback()
        print(f"Migration failed: {exc}")
        raise
    finally:
        src_db.close()
        dst_db.close()

if __name__ == "__main__":
    pg_url = sys.argv[1] if len(sys.argv) > 1 else None
    migrate(target_postgres_uri=pg_url)
