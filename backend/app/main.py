from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import auth, entries, insights, calendar, system

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Antara API — AI-Powered Multilingual Mental Health Journaling",
    description="Multilingual NLP mental health journaling backend supporting English, Hindi, Tamil, Malayalam, and Telugu code-mixed reflections.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core /api/ specification routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(entries.router, prefix="/api/journal", tags=["Journaling"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights & Trajectory"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(system.router, prefix="/api", tags=["System & Model Status"])

# Standalone /api/analyze-entry route alias
@app.post("/api/analyze-entry", tags=["Analysis"])
def analyze_entry_direct(payload: entries.TextAnalysisRequest):
    return entries.live_analyze_entry(payload)

# Backward-compatibility aliases
app.include_router(auth.router, prefix="/auth", tags=["Auth Legacy"])
app.include_router(entries.router, prefix="/entries", tags=["Entries Legacy"])
app.include_router(insights.router, prefix="/insights", tags=["Insights Legacy"])
app.include_router(calendar.router, prefix="/calendar", tags=["Calendar Legacy"])

@app.get("/")
def read_root():
    return {
        "app": "Antara",
        "description": "AI-Powered Multilingual Mental Health Journaling System",
        "status": "online",
        "docs": "/docs"
    }
