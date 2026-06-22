from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.services.ml_pipeline import get_model_status

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        
    model_info = get_model_status()
    
    return {
        "status": "healthy" if db_status == "healthy" and model_info.get("model_loaded") else "degraded",
        "backend": "online",
        "database": db_status,
        "model": "loaded" if model_info.get("model_loaded") else "not_ready",
        "model_details": model_info
    }

@router.get("/model/status")
def model_status():
    return get_model_status()
