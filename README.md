<<<<<<< HEAD
# Neural_Networks
=======
# Antara — AI-Powered Multilingual Mental Health Journaling

> **Antara** is an AI-powered mental health journaling web application engineered to enable users to privately record reflections and gain deep longitudinal emotional insights across **English, Hindi, Tamil, Malayalam, Telugu, and Code-Mixed / Romanized transliterations** (e.g., *Hinglish*, *Tanglish*, *Manglish*, *Tenglish*).

---

## 🌟 Key Capabilities

1. **Multilingual & Code-Mixed NLP Intelligence**:
   - Native script understanding: **English (Latin)**, **Hindi (Devanagari)**, **Tamil**, **Telugu**, and **Malayalam**.
   - Transliterated & Romanized understanding: Conversational Indian dialect phrases (e.g., *"Today college la romba stressful ah irundhuchu but friends kooda pesina apram konjam better feel panninen."*).
   - Powered by a fine-tuned **Google MuRIL Multitask Transformer** with attention-based salience mapping.
2. **Comprehensive Emotional Profiling**:
   - Primary & secondary emotion classification (`joy`, `calm`, `hopeful`, `sadness`, `stress`, `anxiety`).
   - Continuous emotional valence scoring (\(-1.0\) strongly negative to \(+1.0\) strongly positive).
   - Calibrated confidence percentages and emotional intensity indices.
   - Explainability: Salient token importance and model-based contextual reflections.
3. **Longitudinal Trends & Wellbeing Monitoring**:
   - Real-time interactive trajectories across **7 Days**, **30 Days**, and **3 Months**.
   - Continuous 7+ Day downward trend detection using linear regression slope analysis.
   - Gentle, non-alarming wellbeing nudges without making medical diagnoses.
4. **Interactive Calendar & Reflection Archive**:
   - True date-associated monthly calendar with multi-entry day dots and emotional color badges.
   - Full-text search, emotion filters, and language filters.
5. **Responsible AI & Data Privacy**:
   - Dedicated crisis keyword safety layer connecting users to 24/7 human helplines (KIRAN, Tele-MANAS, Vandrevala Foundation, AASRA).
   - Strict user data isolation with password hashing (bcrypt) and JWT tokens.
   - Data sovereignty: Instant JSON and CSV journal export and GDPR-compliant account deletion.
   - AI training consent toggle.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Antara Next.js 14 UI                     │
│    (Dashboard • My Journal • Calendar • Insights • Settings)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI REST Backend                     │
│ ┌───────────────────────┐         ┌───────────────────────┐ │
│ │   /api/auth & user    │         │  /api/journal & CRUD  │ │
│ └───────────────────────┘         └───────────────────────┘ │
│ ┌───────────────────────┐         ┌───────────────────────┐ │
│ │   /api/insights       │         │  /api/calendar        │ │
│ └───────────────────────┘         └───────────────────────┘ │
└──────────────┬───────────────────────────────────┬──────────┘
               │                                   │
┌──────────────▼──────────────┐     ┌──────────────▼──────────┐
│   SQLite / PostgreSQL DB    │     │  Multitask NLP Engine   │
│  (Users, Entries, Analysis) │     │ (MuRIL Transformer +    │
│                             │     │  Attention Salience)    │
└─────────────────────────────┘     └─────────────────────────┘
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- (Optional) Docker & Docker Compose

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

To launch the complete application stack (Backend + Frontend + ML Engine) with a single command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/api/health`

---

## 🧪 Model Evaluation & Experimental Methodology

- **Split Methodology**: 70% Training, 15% Validation, 15% Test with stratified class distribution.
- **Supplementary Test Set**: Dedicated cross-lingual evaluation dataset covering all 5 target languages and code-mixed combinations.
- **Evaluation Command**:
  ```bash
  python -m ml.evaluation.eval
  ```
- **Automated Tests**:
  ```bash
  pytest backend/tests/test_api.py -v
  ```
>>>>>>> 81a3fe6 (feat: Antara AI-Powered Multilingual Mental Health Journaling Platform)
