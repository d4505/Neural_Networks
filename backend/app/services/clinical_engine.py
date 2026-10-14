import re
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import numpy as np
from sqlalchemy.orm import Session

from app.models.entry import DiaryEntry, EntryAnalysis
from app.models.clinical import PsychometricAssessment

# Standardized Psychometric Question Definitions
PHQ9_QUESTIONS = [
    {"id": 1, "text": "Little interest or pleasure in doing things"},
    {"id": 2, "text": "Feeling down, depressed, or hopeless"},
    {"id": 3, "text": "Trouble falling or staying asleep, or sleeping too much"},
    {"id": 4, "text": "Feeling tired or having little energy"},
    {"id": 5, "text": "Poor appetite or overeating"},
    {"id": 6, "text": "Feeling bad about yourself — or that you are a failure or have let yourself or your family down"},
    {"id": 7, "text": "Trouble concentrating on things, such as reading the newspaper or watching television"},
    {"id": 8, "text": "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless"},
    {"id": 9, "text": "Thoughts that you would be better off dead or of hurting yourself in some way"}
]

GAD7_QUESTIONS = [
    {"id": 1, "text": "Feeling nervous, anxious, or on edge"},
    {"id": 2, "text": "Not being able to stop or control worrying"},
    {"id": 3, "text": "Worrying too much about different things"},
    {"id": 4, "text": "Trouble relaxing"},
    {"id": 5, "text": "Being so restless that it is hard to sit still"},
    {"id": 6, "text": "Becoming easily annoyed or irritable"},
    {"id": 7, "text": "Feeling afraid, as if something awful might happen"}
]

RESPONSE_OPTIONS = [
    {"value": 0, "label": "Not at all"},
    {"value": 1, "label": "Several days"},
    {"value": 2, "label": "More than half the days"},
    {"value": 3, "label": "Nearly every day"}
]

def calculate_phq9_severity(score: int) -> Dict[str, str]:
    if score <= 4:
        return {"level": "Minimal", "description": "Minimal or no depressive symptoms", "color": "#7E8C78"}
    elif score <= 9:
        return {"level": "Mild", "description": "Mild depressive symptoms", "color": "#B58A46"}
    elif score <= 14:
        return {"level": "Moderate", "description": "Moderate depressive symptoms warranting clinical attention", "color": "#C89F58"}
    elif score <= 19:
        return {"level": "Moderately Severe", "description": "Moderately severe depressive symptoms; clinical intervention recommended", "color": "#94676E"}
    else:
        return {"level": "Severe", "description": "Severe depressive symptoms; active psychiatric/psychological support recommended", "color": "#833842"}

def calculate_gad7_severity(score: int) -> Dict[str, str]:
    if score <= 4:
        return {"level": "Minimal", "description": "Minimal anxiety symptoms", "color": "#7E8C78"}
    elif score <= 9:
        return {"level": "Mild", "description": "Mild generalized anxiety symptoms", "color": "#B58A46"}
    elif score <= 14:
        return {"level": "Moderate", "description": "Moderate anxiety symptoms warranting clinical review", "color": "#94676E"}
    else:
        return {"level": "Severe", "description": "Severe generalized anxiety; clinical treatment indicated", "color": "#833842"}

# Multilingual Life Domain Lexicon
LIFE_DOMAINS = {
    "Work & Career": {
        "keywords": [
            "work", "job", "career", "office", "boss", "colleague", "coworker", "deadline", "project", 
            "meeting", "client", "promotion", "salary", "interview", "hire", "naukri", "kaam", "daptar", 
            "vela", "pani", "velai", "udhyogam", "manager", "appraisal"
        ],
        "description": "Professional responsibilities, career progression, and workplace dynamics."
    },
    "Academics & Study": {
        "keywords": [
            "exam", "test", "quiz", "college", "school", "university", "assignment", "homework", 
            "grades", "marks", "professor", "teacher", "lecture", "semester", "padhai", "padikkanum", 
            "pariksha", "cgpa", "degree", "course", "studying", "vazhkai"
        ],
        "description": "Educational milestones, examinations, and learning pressure."
    },
    "Relationships & Interpersonal": {
        "keywords": [
            "partner", "boyfriend", "girlfriend", "husband", "wife", "dating", "breakup", "ex", 
            "friend", "friends", "friendship", "lonely", "alone", "argument", "fight", "misunderstanding", 
            "trust", "love", "dost", "dosti", "pyaar", "rishta", "kadhal", "nanban", "sneham", "priyam"
        ],
        "description": "Romantic relationships, friendships, and interpersonal connections."
    },
    "Family & Home": {
        "keywords": [
            "family", "mom", "mother", "dad", "father", "parents", "brother", "sister", "sibling", 
            "relatives", "home", "house", "ghar", "amma", "appa", "veedu", "kutumb", "anna", "akka", 
            "thambi", "thangachi", "ammay"
        ],
        "description": "Domestic environment, parental dynamics, and familial obligations."
    },
    "Health, Sleep & Vitality": {
        "keywords": [
            "sleep", "insomnia", "tired", "exhausted", "fatigue", "sick", "ill", "pain", "headache", 
            "doctor", "medicine", "pill", "diet", "gym", "workout", "energy", "body", "nind", 
            "thookam", "nidra", "udambu", "health", "breath", "breathing"
        ],
        "description": "Somatic wellbeing, sleep hygiene, physical stamina, and somatic tension."
    },
    "Self-Image & Existential": {
        "keywords": [
            "future", "failure", "impostor", "worthless", "guilt", "shame", "confidence", "purpose", 
            "meaning", "hopeless", "overthinking", "doubt", "fear", "scared", "chinta", "kavalai", 
            "bayam", "darr", "asru", "peace", "clarity", "myself", "identity"
        ],
        "description": "Core self-worth, internal critic, existential meaning, and emotional regulation."
    }
}

def detect_domains(text: str) -> List[str]:
    text_lower = text.lower()
    matched = []
    for domain, config in LIFE_DOMAINS.items():
        for kw in config["keywords"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                matched.append(domain)
                break
    return matched if matched else ["Self-Image & Existential"]

def build_clinical_dossier(db: Session, user_id: int, days: int = 14) -> Dict[str, Any]:
    """
    Synthesizes a longitudinal clinical dossier for therapy sessions.
    """
    cutoff = datetime.utcnow() - timedelta(days=days) if days > 0 else datetime.min
    
    entries = db.query(DiaryEntry).filter(
        DiaryEntry.user_id == user_id,
        DiaryEntry.created_at >= cutoff
    ).order_by(DiaryEntry.created_at.asc()).all()

    total_reflections = len(entries)
    
    # Empty state handling
    if total_reflections == 0:
        return {
            "time_horizon_days": days,
            "total_entries": 0,
            "mean_valence": 0.0,
            "affective_volatility": "Insufficient Data",
            "clinical_risk_tier": "Minimal",
            "slope_angle": 0.0,
            "emotional_polarity": {"positive": 0, "neutral": 0, "negative": 0},
            "chronobiology": {"time_of_day": {}, "day_of_week": {}},
            "life_domains": [],
            "key_clinical_episodes": [],
            "therapeutic_agenda": [
                "Establish baseline journaling over the coming week.",
                "Complete an initial PHQ-9 or GAD-7 assessment."
            ],
            "observable_stabilizers": [],
            "psychometrics_recent": {}
        }

    # Extract valence and metrics
    valences = []
    emotions = []
    scripts_detected = set()
    dates = []
    episodes = []

    # Chronobiology buckets
    time_of_day_counts = {"Morning (6am-12pm)": [], "Afternoon (12pm-5pm)": [], "Evening (5pm-9pm)": [], "Late Night (9pm-6am)": []}
    day_of_week_counts = {0: ("Monday", []), 1: ("Tuesday", []), 2: ("Wednesday", []), 3: ("Thursday", []), 4: ("Friday", []), 5: ("Saturday", []), 6: ("Sunday", [])}
    domain_records = {domain: [] for domain in LIFE_DOMAINS}

    for entry in entries:
        analysis = entry.analysis
        v = analysis.sentiment_score if analysis else 0.0
        valences.append(v)
        dates.append(entry.created_at)

        primary_emo = analysis.primary_emotion if analysis else "calm"
        emotions.append(primary_emo)

        if analysis and analysis.languages_detected:
            try:
                langs = json.loads(analysis.languages_detected)
                for l in langs:
                    scripts_detected.add(l)
            except:
                pass

        # Time of day
        hour = entry.created_at.hour
        if 6 <= hour < 12:
            time_of_day_counts["Morning (6am-12pm)"].append(v)
        elif 12 <= hour < 17:
            time_of_day_counts["Afternoon (12pm-5pm)"].append(v)
        elif 17 <= hour < 21:
            time_of_day_counts["Evening (5pm-9pm)"].append(v)
        else:
            time_of_day_counts["Late Night (9pm-6am)"].append(v)

        # Day of week
        dow = entry.created_at.weekday()
        day_of_week_counts[dow][1].append(v)

        # Life Domains
        matched_domains = detect_domains(entry.content)
        for dom in matched_domains:
            if dom in domain_records:
                domain_records[dom].append(v)

        # Track significant clinical episodes (lowest valence or high anxiety/stress)
        episodes.append({
            "id": entry.id,
            "date": entry.created_at.strftime("%b %d, %Y (%I:%M %p)"),
            "valence": round(v, 2),
            "primary_emotion": primary_emo,
            "secondary_emotion": analysis.secondary_emotion if analysis else None,
            "is_safety_flagged": analysis.is_safety_flagged if analysis else False,
            "excerpt": entry.content[:160] + ("..." if len(entry.content) > 160 else ""),
            "detected_domains": matched_domains
        })

    # Mathematical calculations
    mean_valence = float(np.mean(valences))
    std_valence = float(np.std(valences)) if len(valences) > 1 else 0.0

    # Linear slope
    if len(valences) >= 2:
        x = np.arange(len(valences))
        slope, _ = np.polyfit(x, valences, 1)
        slope = float(slope)
    else:
        slope = 0.0

    # Affective Volatility Tier
    if std_valence < 0.2:
        volatility_label = "High Stability (Minimal Swings)"
    elif std_valence < 0.4:
        volatility_label = "Moderate Affective Variability"
    else:
        volatility_label = "Elevated Affective Swings (High Volatility)"

    # Clinical Risk Tier
    if any(e.get("is_safety_flagged") for e in episodes) or mean_valence < -0.45:
        risk_tier = "High"
        risk_description = "Acute distress markers detected. Prioritize safety and immediate grounding support."
    elif slope < -0.05 or mean_valence < -0.2:
        risk_tier = "Elevated"
        risk_description = "Sustained downward affective slope observed across the session interval."
    elif std_valence > 0.45 or slope < -0.02:
        risk_tier = "Guarded"
        risk_description = "Mild downward drift or notable emotional volatility requiring therapeutic monitoring."
    else:
        risk_tier = "Minimal"
        risk_description = "Emotional state appears stable and regulated within healthy normative parameters."

    # Polarity percentages
    pos_count = sum(1 for v in valences if v > 0.15)
    neg_count = sum(1 for v in valences if v < -0.15)
    neu_count = total_reflections - pos_count - neg_count
    polarity = {
        "positive": round((pos_count / total_reflections) * 100, 1),
        "neutral": round((neu_count / total_reflections) * 100, 1),
        "negative": round((neg_count / total_reflections) * 100, 1)
    }

    # Chronobiology aggregation
    chronobiology_tod = []
    for tod_name, tod_scores in time_of_day_counts.items():
        if tod_scores:
            chronobiology_tod.append({
                "period": tod_name,
                "count": len(tod_scores),
                "avg_valence": round(float(np.mean(tod_scores)), 2)
            })
        else:
            chronobiology_tod.append({
                "period": tod_name,
                "count": 0,
                "avg_valence": 0.0
            })

    chronobiology_dow = []
    for dow_idx in range(7):
        day_name, day_scores = day_of_week_counts[dow_idx]
        chronobiology_dow.append({
            "day": day_name,
            "count": len(day_scores),
            "avg_valence": round(float(np.mean(day_scores)), 2) if day_scores else 0.0
        })

    # Domain summary
    life_domains_summary = []
    for dom_name, scores in domain_records.items():
        if scores:
            life_domains_summary.append({
                "domain": dom_name,
                "count": len(scores),
                "avg_valence": round(float(np.mean(scores)), 2),
                "status": "Resilient" if np.mean(scores) > 0.15 else ("Vulnerable" if np.mean(scores) < -0.15 else "Neutral")
            })
    life_domains_summary.sort(key=lambda x: x["count"], reverse=True)

    # Top 3 Critical Episodes (Sort by lowest valence and safety flag)
    sorted_episodes = sorted(episodes, key=lambda e: (not e["is_safety_flagged"], e["valence"]))
    top_critical_episodes = sorted_episodes[:3]

    # Positive Stabilizers (valence > 0.25)
    positive_stabilizers = [e for e in episodes if e["valence"] >= 0.25]

    # Generate Tailored Therapeutic Agenda Questions
    therapeutic_agenda = []
    if top_critical_episodes:
        worst = top_critical_episodes[0]
        primary_domain = worst["detected_domains"][0] if worst["detected_domains"] else "life circumstances"
        therapeutic_agenda.append(f"Examine the core emotional trigger behind the {worst['primary_emotion']} episode on {worst['date']} related to {primary_domain}.")

    if std_valence > 0.35:
        therapeutic_agenda.append("Explore coping mechanisms during high volatility shifts between afternoon and late evening reflections.")

    if life_domains_summary:
        most_vulnerable = next((d for d in life_domains_summary if d["status"] == "Vulnerable"), None)
        if most_vulnerable:
            therapeutic_agenda.append(f"Investigate cognitive distortions (e.g. catastrophizing or mind reading) impacting {most_vulnerable['domain']}.")

    if not therapeutic_agenda:
        therapeutic_agenda.append("Review strategies that helped maintain healthy affective stability across this period.")
        therapeutic_agenda.append("Identify 1 proactive boundary to protect personal energy over the next 14 days.")

    # Recent Psychometric Check-ins
    latest_phq9 = db.query(PsychometricAssessment).filter(
        PsychometricAssessment.user_id == user_id,
        PsychometricAssessment.assessment_type == "PHQ-9"
    ).order_by(PsychometricAssessment.created_at.desc()).first()

    latest_gad7 = db.query(PsychometricAssessment).filter(
        PsychometricAssessment.user_id == user_id,
        PsychometricAssessment.assessment_type == "GAD-7"
    ).order_by(PsychometricAssessment.created_at.desc()).first()

    psychometrics_recent = {
        "phq9": {
            "score": latest_phq9.total_score,
            "severity": latest_phq9.severity,
            "date": latest_phq9.created_at.strftime("%b %d, %Y")
        } if latest_phq9 else None,
        "gad7": {
            "score": latest_gad7.total_score,
            "severity": latest_gad7.severity,
            "date": latest_gad7.created_at.strftime("%b %d, %Y")
        } if latest_gad7 else None
    }

    return {
        "time_horizon_days": days,
        "total_entries": total_reflections,
        "mean_valence": round(mean_valence, 2),
        "affective_volatility": volatility_label,
        "volatility_score": round(std_valence, 2),
        "clinical_risk_tier": risk_tier,
        "clinical_risk_description": risk_description,
        "slope_angle": round(slope, 3),
        "emotional_polarity": polarity,
        "scripts_detected": list(scripts_detected),
        "chronobiology": {
            "time_of_day": chronobiology_tod,
            "day_of_week": chronobiology_dow
        },
        "life_domains": life_domains_summary,
        "key_clinical_episodes": top_critical_episodes,
        "therapeutic_agenda": therapeutic_agenda,
        "observable_stabilizers": [
            {
                "date": s["date"],
                "valence": s["valence"],
                "emotion": s["primary_emotion"],
                "excerpt": s["excerpt"]
            } for s in positive_stabilizers[:3]
        ],
        "psychometrics_recent": psychometrics_recent
    }
