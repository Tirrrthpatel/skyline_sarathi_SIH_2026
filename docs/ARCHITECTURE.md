# Skyline सारथी — System Architecture

This document describes the architectural design, directory organization, data flows, and inference pipelines of the Skyline सारथी platform.

---

## 1. Directory Structure

```
Skyline_sarathi/
├── frontend/                     # React 18 + Vite + Tailwind Client
│   ├── src/
│   │   ├── components/           # UI Components (HeroScrollytelling, Dashboard, GoogleRouteMap, etc.)
│   │   ├── services/             # API client services (api.js)
│   │   ├── styles/               # Global styles (index.css)
│   │   ├── App.jsx               # Top-level view mode orchestrator (Tour vs Dashboard)
│   │   └── main.jsx              # DOM root mount
│   ├── public/                   # Static assets (optimized frames, aircraft images, clouds)
│   ├── index.html                # Single-page HTML entry point
│   ├── vite.config.js            # Vite config with HMR & reverse proxy to backend
│   └── package.json              # Frontend dependencies and npm scripts
│
├── backend/                      # Python FastAPI + Machine Learning Backend
│   ├── app/
│   │   ├── api/                  # REST API routes (/api/predict, /api/analytics, /api/health)
│   │   ├── config/               # Settings & environment variables (settings.py)
│   │   ├── ml/                   # Model loader, preprocessing & feature engineering
│   │   ├── models/               # Pydantic schemas & ML candidate weights
│   │   ├── services/             # Business logic & fare estimation
│   │   └── main.py               # FastAPI application entry & CORS middleware
│   ├── requirements.txt          # Python dependencies
│   ├── run.py                    # Startup script for Uvicorn server (port 8000)
│   └── test_backend.py           # Verification and sanity test suite
│
├── resources/                    # Raw media, video source files & frame extracts
│   ├── Airplane_floats_in_studio_1080p_20260914185818-ezremove.mp4
│   ├── ezgif-8bff5c46bd0c48dd-jpg/
│   └── test_blended.jpg
│
├── docs/                         # Technical documentation & knowledge base
│   ├── ARCHITECTURE.md           # System architecture & data flow
│   └── TECH_STACK.md             # Complete technology stack reference
│
├── README.md                     # Root project guide & startup instructions
└── package.json                  # Root convenience scripts for workspace management
```

---

## 2. User Experience Flow: Dual-Mode Architecture

The application provides two complementary user experiences coordinated by [App.jsx](file:///d:/UNI/SIH/Galctica/frontend/src/App.jsx):

```mermaid
graph TD
    A[Visitor Opens Web App] --> B[AssetPreloader: 6 Key Frames Preloaded]
    B --> C{Mode Selector}
    C -->|Default: Landing Mode| D[Cinematic Scrollytelling Tour]
    C -->|Authenticated / Guest Entry| E[Single-Screen Dashboard]

    D --> D1[0% - 10%: Initial Hook & 'Begin Journey' CTA]
    D --> D2[10% - 30%: Interactive Flight Search Scene]
    D --> D3[30% - 50%: ML Prediction & Historical Curve]
    D --> D4[50% - 70%: 5-Day Date Value Matrix]
    D --> D5[70% - 85%: 8 Multivariate Feature Signals]
    D --> D6[85% - 95%: ML Pipeline Architecture Visualizer]
    D --> D7[95%+: Final Cloudscape Transition to Dashboard]

    E --> E1[Search Parameter Controls: Origin, Dest, Class, Date]
    E --> E2[Interactive Leaflet Live Route Map with Great-Circle Flight Path]
    E --> E3[Aircraft Model Carousel & Avionics Blueprint Fallback]
    E --> E4[30-Day Fare Trend Chart with Dynamic Point Highlights]
```

---

## 3. Hybrid Machine Learning Pipeline

The backend implements a fault-tolerant hybrid inference design:

```mermaid
graph LR
    Req[Flight Query Request] --> Validate[Pydantic Schema Validation]
    Validate --> Loader{Custom Model Available?}
    Loader -->|Yes: .joblib / .pkl found| ML[Scikit-Learn Model Inference]
    Loader -->|No: Model not uploaded yet| Empirical[Domain Empirical Engine]
    
    Empirical --> Base[Distance-Based Base Rate]
    Base --> Multipliers[Cabin, Advance Date & Demand Multipliers]
    Multipliers --> Output[Predicted Fare + Expected Range + Confidence]
    ML --> Output
```

1. **Auto-Detection**: `ModelLoader` scans for `.joblib`, `.pkl`, or `.onnx` files in `backend/app/models/`.
2. **Graceful Fallback**: If no trained weights are uploaded, the empirical calculation estimates realistic airfares based on geodesic distance, cabin multipliers, advance booking windows, and seasonal demand factors.
3. **Zero Downtime**: The frontend functions reliably whether a custom dataset has been trained or not.
