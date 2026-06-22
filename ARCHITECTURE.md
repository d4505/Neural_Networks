# Antara Technical Architecture Document

## 1. Overview
Antara is designed as a privacy-first, full-stack multilingual mental health journaling application. It couples real-time natural language processing across Indic and English dialects with longitudinal wellbeing monitoring.

---

## 2. Core Architectural Pillars

### A. Frontend Layer (Next.js 14 App Router)
- **Framework**: Next.js 14 + React 19 + TypeScript.
- **Styling**: Tailwind CSS v4 + `next-themes` (Dark Mode, Light Mode, System Default).
- **State & Data Fetching**: SWR (Stale-While-Revalidate) with custom Axios interceptors for JWT token handling.
- **Visualizations**: Recharts Area & Line Charts with dynamic responsive containers, interactive day drawers, and custom emotion badges.
- **Pages**:
  - `/(auth)/login`: Secure login with show/hide password and token management.
  - `/(auth)/signup`: Registration with 5-point password strength validation, confirmation matching, and model training consent.
  - `/(dashboard)/dashboard`: Live overview, dynamic greetings, 7-day downward trend nudge alert, latest reflection card, and activity statistics.
  - `/(dashboard)/journal`: Distraction-free multilingual journaling editor, live language detection preview, search, emotion/language filtering, editing, and explainability salience tags.
  - `/(dashboard)/calendar`: Real date-mapped calendar grid, emotion dots, and day reflection review drawer.
  - `/(dashboard)/insights`: 7-day / 30-day / 3-month emotional trajectories, emotion distribution, AI weekly reflection narrative, and non-clinical disclaimer.
  - `/(dashboard)/settings`: Profile info, theme switcher, JSON/CSV exports, AI consent toggle, emergency helplines, and GDPR account deletion.

---

### B. Backend REST API Layer (FastAPI)
- **Framework**: FastAPI (Python 3.11).
- **Authentication**: OAuth2 Password Bearer flow with JWT (JSON Web Tokens) encoded via `python-jose` and password hashing via `passlib[bcrypt]`.
- **Database**: SQLite / PostgreSQL with SQLAlchemy ORM.
- **Endpoints Specification**:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `PUT /api/auth/theme`
  - `POST /api/auth/consent`
  - `GET /api/auth/export?format=json|csv`
  - `DELETE /api/auth/account`
  - `GET /api/journal` (supports search, emotion filter, language filter, pagination)
  - `POST /api/journal` (creates entry and triggers real ML inference)
  - `GET /api/journal/{id}`
  - `PUT /api/journal/{id}` (recalculates analysis)
  - `DELETE /api/journal/{id}` (cascade deletion)
  - `GET /api/journal/{id}/analysis`
  - `POST /api/analyze-entry` (live analysis without persistence)
  - `GET /api/insights/weekly`
  - `GET /api/insights/monthly`
  - `GET /api/insights/trajectory` (7d, 30d, 90d with linear regression downward trend detection)
  - `GET /api/calendar` (monthly date mapping)
  - `GET /api/model/status`
  - `GET /api/health`

---

### C. Multilingual & Code-Mixed NLP Pipeline
- **Backbone**: Google MuRIL (Multilingual Representations for Indian Languages) with 768-dim shared transformer embeddings.
- **Multitask Architecture**:
  - Shared transformer representation with self-attention sequence pooling.
  - Sentiment Classification Head (4-class: `positive`, `neutral`, `negative`, `mixed`).
  - Emotion Classification Head (6-class: `joy`, `calm`, `hopeful`, `sadness`, `stress`, `anxiety`).
  - Continuous Valence Regression Head (\(-1.0\) to \(+1.0\)).
- **Transliteration & Code-Mixing**:
  - Direct Unicode script parsing for Devanagari (Hindi), Tamil, Telugu, Malayalam, and Latin (English).
  - Lexical and contextual pattern recognizer for Romanized Hinglish, Tanglish, Manglish, and Tenglish.
- **Explainability**:
  - Self-attention weight attribution per token.
  - Contextual model interpretation generator.
- **Safety Risk Screener**:
  - Pattern-based crisis/self-harm screener returning non-clinical supportive guidance and emergency contact numbers (KIRAN, Tele-MANAS, Vandrevala, AASRA).

---

## 3. Database Schema

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    consent_model_training BOOLEAN DEFAULT FALSE,
    theme_preference VARCHAR(20) DEFAULT 'system',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Journal Entries table
CREATE TABLE journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Entry Analysis table
CREATE TABLE entry_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER UNIQUE NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    sentiment VARCHAR(50) NOT NULL,
    sentiment_score FLOAT NOT NULL,
    primary_emotion VARCHAR(50) NOT NULL,
    secondary_emotion VARCHAR(50),
    emotion_score FLOAT NOT NULL,
    intensity FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    languages_detected TEXT NOT NULL,
    explanation TEXT,
    salient_tokens TEXT,
    model_version VARCHAR(100) NOT NULL,
    is_safety_flagged BOOLEAN DEFAULT FALSE,
    safety_message TEXT
);

-- Daily Emotional Scores table
CREATE TABLE daily_emotional_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(20) NOT NULL,
    average_emotion_score FLOAT NOT NULL,
    entry_count INTEGER NOT NULL,
    dominant_emotion VARCHAR(50),
    trend VARCHAR(50)
);
```
