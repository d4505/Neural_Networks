import io
import csv
import json
from fastapi import APIRouter, Depends, HTTPException, status, Response, Body, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any, Optional, Dict

from app.database import get_db
from app.models.user import User
from app.models.entry import DiaryEntry, EntryAnalysis, DailyEmotionalScore
from app.schemas.user import UserCreate, UserLogin, User as UserSchema, Token, UserConsentUpdate, ThemePreferenceUpdate
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def get_current_user(db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme)) -> User:
    from jose import JWTError, jwt
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        consent_model_training=bool(user.consent_model_training)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    email = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass
    elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing email or password in request"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/consent", response_model=UserSchema)
def update_training_consent(payload: UserConsentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.consent_model_training = payload.consent
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/theme", response_model=UserSchema)
def update_theme_preference(payload: ThemePreferenceUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.theme_preference = payload.theme
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/export")
def export_user_data(format: str = "json", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entries = db.query(DiaryEntry).filter(DiaryEntry.user_id == current_user.id).order_by(DiaryEntry.created_at.desc()).all()
    
    export_list = []
    for e in entries:
        export_list.append({
            "id": e.id,
            "title": e.title,
            "content": e.content,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "sentiment": e.analysis.sentiment if e.analysis else None,
            "sentiment_score": e.analysis.sentiment_score if e.analysis else None,
            "primary_emotion": e.analysis.primary_emotion if e.analysis else None,
            "secondary_emotion": e.analysis.secondary_emotion if e.analysis else None,
            "emotion_score": e.analysis.emotion_score if e.analysis else None,
            "intensity": e.analysis.intensity if e.analysis else None,
            "confidence": e.analysis.confidence if e.analysis else None,
            "languages_detected": json.loads(e.analysis.languages_detected) if e.analysis and e.analysis.languages_detected else ["English"],
            "explanation": e.analysis.explanation if e.analysis else None
        })
        
    if format.lower() == "csv":
        output = io.StringIO()
        fieldnames = ["id", "title", "content", "created_at", "sentiment", "sentiment_score", "primary_emotion", "secondary_emotion", "emotion_score", "intensity", "confidence", "languages_detected", "explanation"]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for row in export_list:
            row_copy = dict(row)
            row_copy["languages_detected"] = ", ".join(row_copy["languages_detected"])
            writer.writerow(row_copy)
            
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=antara_journal_export_{current_user.id}.csv"}
        )
        
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        },
        "total_entries": len(export_list),
        "entries": export_list
    }

@router.delete("/account")
def delete_user_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated reflections permanently deleted"}
