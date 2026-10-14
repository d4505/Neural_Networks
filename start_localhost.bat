@echo off
title Antara - Localhost Launcher
echo ===================================================
echo           Starting Antara Local Servers
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend (Port 8000)...
start "Antara Backend" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Next.js Frontend (Port 3000)...
start "Antara Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Both servers are launching!
echo Frontend: http://localhost:3000
echo Backend API: http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo ===================================================
echo.
pause
