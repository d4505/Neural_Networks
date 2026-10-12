# 🌐 Antara Platform Hosting & Deployment Guide

This guide details the deployment and hosting options for the **Antara** Multilingual Mental Health Journaling Platform.

---

## 1. 💻 Current Live Local Host (Already Running)

Both servers are currently spun up and running on your local machine:

| Component | URL | Status | Description |
| :--- | :--- | :---: | :--- |
| **Frontend (Next.js)** | [http://localhost:3000](http://localhost:3000) | 🟢 Live | Calming Sage-Green / Beige Calm Computing UI |
| **Backend (FastAPI)** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | 🟢 Live | MuRIL Multitask NLP Emotion & Crisis Engine |
| **Interactive API Docs**| [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | 🟢 Live | Swagger UI for all REST endpoints |
| **Health Check** | [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health) | 🟢 Live | System status & loaded model metrics |

---

## 2. ⚡ Instant Public Demo Link (Free, Zero Configuration)

If you need a public URL to share immediately with colleagues or review committees from your local machine:

### Option A: LocalTunnel (No login required)
Open a new PowerShell terminal:
```bash
# Expose frontend (Port 3000) to a public https:// URL
npx localtunnel --port 3000
```

### Option B: Cloudflare Quick Tunnels
```bash
# Download cloudflared or run:
cloudflared tunnel --url http://localhost:3000
```

---

## 3. ☁️ Permanent Production Cloud Hosting (Free Tier)

Because Antara consists of a **Next.js frontend** and a **FastAPI PyTorch ML backend**, the industry standard free deployment stack is:
- **Frontend**: [Vercel](https://vercel.com) (Optimized for Next.js)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (Python & ML container hosting)

---

### Step 1: Deploy Backend on Render / Railway

1. Sign in to [Render.com](https://render.com) with your GitHub account.
2. Click **New +** → **Web Service**.
3. Connect your repository: `https://github.com/d4505/Neural_Networks`.
4. Configure the settings:
   - **Name**: `antara-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `SECRET_KEY`: `antara_secure_production_secret_key_2026`
   - `DATABASE_URL`: `sqlite:///./journal.db`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
6. Click **Deploy Web Service**.
7. Once deployed, copy your service URL (e.g. `https://antara-api.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel

1. Sign in to [Vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your repository: `d4505/Neural_Networks`.
4. In the Project Configuration:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: `Next.js` (automatically detected).
5. In **Environment Variables**:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://antara-api.onrender.com` (your backend Render URL).
6. Click **Deploy**.
7. Vercel will build and assign you a global production URL (e.g., `https://antara-journal.vercel.app`).

---

## 4. 🐳 Self-Hosted / On-Premises via Docker

If deploying to an AWS EC2, DigitalOcean Droplet, or internal university server:

```bash
# 1. Clone repository
git clone https://github.com/d4505/Neural_Networks.git
cd Neural_Networks

# 2. Build and launch all services with Docker Compose
docker compose up -d --build
```
Both the FastAPI backend (`:8000`) and Next.js frontend (`:3000`) will boot with volume persistence and health checks enabled.
