# Skyline सारथी — AI Airplane Fare Price Prediction Platform

A production-grade aviation fare prediction web application featuring a cinematic 3D scrollytelling landing experience and a fixed single-screen telemetry dashboard.

---

## 📁 Repository Structure

```
Skyline_sarathi/
├── frontend/                     # React 18 + Vite + Tailwind CSS Application
│   ├── src/                      # UI Components, styles, and API clients
│   ├── public/                   # Static assets (camera frames, aircraft images)
│   ├── index.html                # HTML entry point
│   ├── vite.config.js            # Vite config with HMR & /api reverse proxy
│   └── package.json              # Frontend dependencies and scripts
│
├── backend/                      # Python FastAPI + Machine Learning Backend
│   ├── app/                      # Routes, settings, ML model loader & services
│   ├── requirements.txt          # Python dependencies
│   ├── run.py                    # Server startup script (port 8000)
│   └── test_backend.py           # Backend sanity tests
│
├── resources/                    # Raw source video files & frame extraction assets
│   ├── Airplane_floats_in_studio_1080p_20260914185818-ezremove.mp4
│   └── ezgif-8bff5c46bd0c48dd-jpg/
│
├── docs/                         # Knowledge base & system documentation
│   ├── ARCHITECTURE.md           # System design, data flow & dual-mode guide
│   └── TECH_STACK.md             # Complete technology stack reference
│
├── README.md                     # This file
└── package.json                  # Workspace helper scripts
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend (Port 8000)

```powershell
cd d:\UNI\SIH\Galctica\backend
python run.py
```
*API will be live at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

### 2. Start the Frontend (Port 3000)

You can run commands either from the root or inside `frontend/`:

**Option A: From Root**
```powershell
npm run dev
# OR for production preview:
npm run preview
```

**Option B: From `frontend/` Directory**
```powershell
cd d:\UNI\SIH\Galctica\frontend
npm run dev
# OR for production preview:
npm run preview
```
*Frontend will be live at `http://localhost:3000` with automatic `/api` proxying to `http://localhost:8000`.*

### 3. Share via Cloudflare Tunnel (Remote / Mobile Access)

To test the application on mobile or remote devices:

```powershell
& "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --protocol http2 --url http://localhost:3000
```

---

## 📚 Technical Documentation

For in-depth documentation, see:
- [docs/TECH_STACK.md](file:///d:/UNI/SIH/Galctica/docs/TECH_STACK.md) — Detailed technology breakdown (React, Vite, Tailwind, Leaflet, FastAPI, Scikit-Learn).
- [docs/ARCHITECTURE.md](file:///d:/UNI/SIH/Galctica/docs/ARCHITECTURE.md) — System architecture, dual-mode UI flow, and hybrid ML inference pipeline.
