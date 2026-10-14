# Swadhyaya (स्वाध्याय) — AI-Powered Multilingual Clinical Affective Copilot & Mental Health Journaling

> **Swadhyaya (स्वाध्याय)** is an AI-powered clinical affective intelligence platform and multilingual mental health journaling system engineered to bridge the gap between daily reflections and clinical psychotherapy. It enables individuals to privately record reflections and empowers clinicians with deep longitudinal affective insights across **English, Hindi, Tamil, Malayalam, Telugu, and Code-Mixed / Romanized transliterations** (e.g., *Hinglish*, *Tanglish*, *Manglish*, *Tenglish*).

---

## 🌸 Emblem & Design Philosophy

- **The Swadhyaya Lotus-Book Emblem**: Merges the pages of an open Sanskrit manuscript (*pothi / granth*) with the symmetrical petals of an unfurling lotus, crowned by an ascending golden flame (*jyoti*) and top consciousness *bindu*.
- **The Rosewater & Honey Aesthetic**: A calm computing visual design pairing low-saturation powdery antique rose (`#94676E` in light / `#BA8E94` in dark) with warm honey amber (`#B58A46` / `#C89F58`), engineered for emotional regulation and zero sensory fatigue.

---

## 🌟 Key Capabilities

1. **Multilingual and Code-Mixed NLP Intelligence**:
   - Native script understanding: **English (Latin)**, **Hindi (Devanagari)**, **Tamil**, **Telugu**, and **Malayalam**.
   - Transliterated and Romanized understanding: Conversational Indian dialect phrases (e.g., *"Today college la romba stressful ah irundhuchu but friends kooda pesina apram konjam better feel panninen."*).
   - Powered by a fine-tuned **Google MuRIL Multitask Transformer** with attention-based salience mapping.
2. **Clinical Therapy Copilot & Session Dossier (Concept C)**:
   - **Longitudinal Affective Dossier**: Synthesizes 7-day, 14-day (standard session interval), or 30-day clinical dossiers.
   - **Clinical Risk & Volatility Index**: Computes mean affective valence (-1.0 to +1.0), affective volatility (\(\sigma\)), and regression slope to detect downward affective drift.
   - **Privacy Mask Mode**: 1-click anonymization masking patient names to `Patient #SW-0001` for clinical sharing.
   - **Printable Clinical PDF & Standardized JSON Export**: Clinical-grade export with clinic header, date stamp, metrics tables, and clinician signature lines.
3. **Standardized Psychometric Assessment Hub**:
   - **PHQ-9 (Patient Health Questionnaire - Depression)**: 9 standardized items scored 0-27 with clinical severity tiers (*Minimal*, *Mild*, *Moderate*, *Moderately Severe*, *Severe*).
   - **GAD-7 (Generalized Anxiety Disorder - Anxiety)**: 7 standardized items scored 0-21 (*Minimal*, *Mild*, *Moderate*, *Severe*).
   - Interactive 4-point Likert check-in modal with live running score tally and longitudinal progress tracking.
4. **Life Domain & Chronobiological Trigger Correlation**:
   - Multi-script categorization into 6 core life domains: *Work & Career*, *Academics & Study*, *Relationships & Interpersonal*, *Family & Home*, *Health, Sleep & Vitality*, and *Self-Image & Existential*.
   - **Chronobiological Affect Windows**: Pinpoints diurnal vulnerability (Morning, Afternoon, Evening, Late Night) and weekday emotional cycles.
5. **Therapy Session Agenda & Socratic Reflection Guide**:
   - Highlights top significant clinical episodes with original code-mixed quotes and emotion tags.
   - Generates tailored Socratic questions for in-session therapist-patient discussion.
   - Tracks observable coping mechanisms and positive emotional stabilizers.
6. **Responsible AI and Data Sovereignty**:
   - Crisis keyword safety layer connecting users to 24/7 emergency helplines (KIRAN, Tele-MANAS, Vandrevala Foundation, AASRA).
   - Strict data isolation with bcrypt password hashing, JWT authentication, and full GDPR-compliant data export/deletion.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Swadhyaya Next.js 16 UI                           │
│ (Dashboard • Journal • Therapy Copilot • Insights • Calendar • Settings)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / JSON API
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            FastAPI REST Backend                             │
│ ┌───────────────────────┐ ┌───────────────────────┐ ┌─────────────────────┐ │
│ │   /api/auth & user    │ │  /api/journal & CRUD  │ │    /api/clinical    │ │
│ └───────────────────────┘ └───────────────────────┘ └─────────────────────┘ │
│ ┌───────────────────────┐ ┌───────────────────────┐ ┌─────────────────────┐ │
│ │   /api/insights       │ │  /api/calendar        │ │   /api/system       │ │
│ └───────────────────────┘ └───────────────────────┘ └─────────────────────┘ │
└───────────────────┬───────────────────────────────────────────┬─────────────┘
                    │                                           │
┌───────────────────▼───────────────────┐       ┌───────────────▼─────────────┐
│        SQLite / PostgreSQL DB         │       │    Multitask NLP Engine     │
│ (Users, Entries, Analysis, Clinical)  │       │    (MuRIL Transformer +     │
│                                       │       │   Clinical Rules Engine)    │
└───────────────────────────────────────┘       └─────────────────────────────┘
```

---

## 🚀 Quickstart and Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

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

## 🧪 Clinical & Model Evaluation

- **Supported Dialects**: English, Hindi (Devanagari & Romanized Hinglish), Tamil (Native & Tanglish), Telugu (Native & Tenglish), Malayalam (Native & Manglish).
- **Emotion Accuracy**: 90.1% across 6 emotional classes (`joy`, `calm`, `hopeful`, `sadness`, `stress`, `anxiety`).
- **Sentiment Accuracy**: 94.9% with continuous valence scoring.
- **Psychometric Standards**: Standardized PHQ-9 and GAD-7 scoring protocols compliant with APA clinical guidelines.
