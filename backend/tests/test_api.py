import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

# Use an in-memory SQLite database for automated tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["backend"] == "online"

def test_model_status():
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "model_loaded" in data

def test_user_signup_and_login():
    # Valid signup with strong password
    signup_res = client.post("/api/auth/signup", json={
        "name": "Test User",
        "email": "test@antara.ai",
        "password": "Password123!",
        "password_confirmation": "Password123!",
        "consent_model_training": True
    })
    assert signup_res.status_code == 201
    user_data = signup_res.json()
    assert user_data["email"] == "test@antara.ai"
    assert user_data["name"] == "Test User"
    assert user_data["consent_model_training"] is True

    # Duplicate signup should fail
    dup_res = client.post("/api/auth/signup", json={
        "name": "Test User 2",
        "email": "test@antara.ai",
        "password": "Password123!",
        "password_confirmation": "Password123!"
    })
    assert dup_res.status_code == 400

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "test@antara.ai",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    return token_data["access_token"]

def test_password_strength_validation():
    # Weak password (no number / special char)
    res = client.post("/api/auth/signup", json={
        "name": "Weak User",
        "email": "weak@antara.ai",
        "password": "password",
        "password_confirmation": "password"
    })
    assert res.status_code == 422

def test_journal_crud_flow():
    token = test_user_signup_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a multilingual journal entry (Tanglish code-mixed)
    create_res = client.post("/api/journal/", headers=headers, json={
        "title": "College Day Reflection",
        "content": "Today college la romba stressful ah irundhuchu but friends kooda pesina apram konjam better feel panninen."
    })
    assert create_res.status_code == 201
    entry = create_res.json()
    assert entry["id"] is not None
    assert "analysis" in entry
    assert entry["analysis"] is not None
    assert entry["analysis"]["primary_emotion"] in ["hopeful", "stress", "calm", "joy", "sadness", "anxiety"]
    assert -1.0 <= entry["analysis"]["emotion_score"] <= 1.0

    entry_id = entry["id"]

    # 2. Get entry by ID
    get_res = client.get(f"/api/journal/{entry_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "College Day Reflection"

    # 3. List entries with search
    list_res = client.get("/api/journal/?search=college", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Get Calendar Data
    cal_res = client.get("/api/calendar/", headers=headers)
    assert cal_res.status_code == 200
    cal_data = cal_res.json()
    assert cal_data["total_entries"] >= 1

    # 5. Get Trajectory Data
    traj_res = client.get("/api/insights/trajectory?days=7", headers=headers)
    assert traj_res.status_code == 200
    traj_data = traj_res.json()
    assert "trajectory" in traj_data
    assert "show_nudge" in traj_data

    # 6. Standalone live analysis
    live_res = client.post("/api/analyze-entry", json={
        "text": "Aaj mood bahut accha hai aur peace feel ho raha hai."
    })
    assert live_res.status_code == 200
    live_data = live_res.json()
    assert "primary_emotion" in live_data
    assert "languages_detected" in live_data

    # 7. Delete entry
    del_res = client.delete(f"/api/journal/{entry_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify deleted
    get_del = client.get(f"/api/journal/{entry_id}", headers=headers)
    assert get_del.status_code == 404
