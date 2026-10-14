import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.clinical import PsychometricAssessment
from app.api.auth import get_current_user
from app.services.clinical_engine import (
    PHQ9_QUESTIONS,
    GAD7_QUESTIONS,
    RESPONSE_OPTIONS,
    calculate_phq9_severity,
    calculate_gad7_severity,
    build_clinical_dossier
)

router = APIRouter()

class AssessmentSubmitRequest(BaseModel):
    assessment_type: str = Field(..., description="'PHQ-9' or 'GAD-7'")
    answers: List[int] = Field(..., description="Array of item scores (0-3)")
    notes: Optional[str] = Field(None, description="Optional patient reflections or contextual notes")

class AssessmentResponse(BaseModel):
    id: int
    assessment_type: str
    total_score: int
    severity: str
    severity_description: str
    severity_color: str
    answers: List[int]
    notes: Optional[str]
    created_at: str

@router.get("/assessment-questions", response_model=Dict[str, Any])
def get_assessment_questions():
    """
    Returns authentic clinical assessment item definitions for PHQ-9 and GAD-7.
    """
    return {
        "phq9": {
            "title": "Patient Health Questionnaire (PHQ-9)",
            "description": "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
            "max_score": 27,
            "questions": PHQ9_QUESTIONS
        },
        "gad7": {
            "title": "Generalized Anxiety Disorder (GAD-7)",
            "description": "Over the last 2 weeks, how often have you been bothered by the following problems?",
            "max_score": 21,
            "questions": GAD7_QUESTIONS
        },
        "response_options": RESPONSE_OPTIONS
    }

@router.post("/assessments", response_model=AssessmentResponse)
def submit_assessment(
    payload: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits a completed PHQ-9 or GAD-7 psychometric assessment and calculates standardized severity.
    """
    atype = payload.assessment_type.strip().upper()
    if atype not in ["PHQ-9", "GAD-7"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assessment_type. Must be 'PHQ-9' or 'GAD-7'."
        )

    expected_len = 9 if atype == "PHQ-9" else 7
    if len(payload.answers) != expected_len:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{atype} requires exactly {expected_len} responses, received {len(payload.answers)}."
        )

    for val in payload.answers:
        if val not in [0, 1, 2, 3]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Each answer value must be an integer between 0 and 3. Invalid value: {val}"
            )

    total_score = sum(payload.answers)

    if atype == "PHQ-9":
        severity_info = calculate_phq9_severity(total_score)
    else:
        severity_info = calculate_gad7_severity(total_score)

    db_item = PsychometricAssessment(
        user_id=current_user.id,
        assessment_type=atype,
        total_score=total_score,
        severity=severity_info["level"],
        answers=json.dumps(payload.answers),
        notes=payload.notes.strip() if payload.notes else None,
        created_at=datetime.utcnow()
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return AssessmentResponse(
        id=db_item.id,
        assessment_type=db_item.assessment_type,
        total_score=db_item.total_score,
        severity=db_item.severity,
        severity_description=severity_info["description"],
        severity_color=severity_info["color"],
        answers=payload.answers,
        notes=db_item.notes,
        created_at=db_item.created_at.strftime("%b %d, %Y (%I:%M %p)")
    )

@router.get("/assessments", response_model=List[AssessmentResponse])
def get_user_assessments(
    assessment_type: Optional[str] = Query(None, description="Filter by 'PHQ-9' or 'GAD-7'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves longitudinal history of psychometric assessments for the current user.
    """
    query = db.query(PsychometricAssessment).filter(PsychometricAssessment.user_id == current_user.id)
    if assessment_type:
        query = query.filter(PsychometricAssessment.assessment_type == assessment_type.strip().upper())
    
    items = query.order_by(PsychometricAssessment.created_at.desc()).all()

    results = []
    for it in items:
        if it.assessment_type == "PHQ-9":
            sev = calculate_phq9_severity(it.total_score)
        else:
            sev = calculate_gad7_severity(it.total_score)

        try:
            ans = json.loads(it.answers)
        except:
            ans = []

        results.append(AssessmentResponse(
            id=it.id,
            assessment_type=it.assessment_type,
            total_score=it.total_score,
            severity=it.severity,
            severity_description=sev["description"],
            severity_color=sev["color"],
            answers=ans,
            notes=it.notes,
            created_at=it.created_at.strftime("%b %d, %Y (%I:%M %p)")
        ))

    return results

@router.get("/dossier")
def get_clinical_dossier(
    days: int = Query(14, ge=1, le=180, description="Session interval in days (default 14)"),
    anonymize: bool = Query(False, description="Whether to mask patient name for clinical export"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a full longitudinal clinical session dossier for therapy appointments.
    """
    dossier = build_clinical_dossier(db, current_user.id, days=days)

    patient_name = f"Patient #{current_user.id:04d}" if anonymize else current_user.name
    patient_email = "REDACTED@clinical.privacy" if anonymize else current_user.email

    dossier["patient"] = {
        "id": f"SW-{current_user.id:04d}",
        "name": patient_name,
        "email": patient_email,
        "is_anonymized": anonymize,
        "report_generated_at": datetime.utcnow().strftime("%B %d, %Y at %I:%M %p UTC")
    }

    return dossier
