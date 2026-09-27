# System Requirements & Package Dependencies

**Project**: Skyline सारथी (Smart India Hackathon SIH26056)  
**Team**: Team 21 Jolly Roger (ID: 171809)  
**Theme**: Smart Automation — Real-time Airfare Price Index Platform  

---

## 1. System Prerequisites

| Environment | Minimum Version | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.18.0` | `v20.x` or `v22.x` (LTS) | Frontend runtime environment |
| **npm** | `v9.0.0` | `v10.x` | Package manager for frontend dependencies |
| **Python** | `3.10` | `3.11.x` | Backend runtime for FastAPI & Flask services |
| **pip** | `23.0` | `latest` | Python package installer |

---

## 2. Frontend Packages (`Frontend/package.json`)

### Core Framework & Build Tools
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | `^19.2.8` | Core UI library for component state and DOM lifecycle |
| `react-dom` | `^19.2.8` | React DOM renderer |
| `vite` | `^8.3.1` | Next-generation ultra-fast frontend build tool and dev server |
| `@vitejs/plugin-react` | `^6.0.0` | Vite plugin providing fast HMR and React JSX transformation |
| `typescript` | `~6.0.0` | Static type checker ensuring type safety across aviation metrics |

### Design System & Styling
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `tailwindcss` | `^4.0.0` | Utility-first CSS framework implementing Swiss 0px International Style |
| `@tailwindcss/vite` | `^4.0.0` | Official Vite integration for Tailwind CSS v4 engine |
| `tw-animate-css` | `^1.4.0` | CSS animation primitives for transitions and keyframes |
| `clsx` | `^2.1.1` | Utility for conditionally constructing `className` strings |
| `tailwind-merge` | `^3.7.0` | Merges Tailwind CSS classes without style conflicts |
| `class-variance-authority` | `^0.7.1` | Type-safe UI component variants generator |
| `cn` | `^0.4.0` | Classname merging helper |
| `shadcn` | `^4.21.0` | CLI & registry tooling for modular UI components |

### Animation & 3D WebGL Avionics
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `motion` | `^13.4.3` | Hardware-accelerated animation engine (used for Split-Flap FlipWords) |
| `three` | `^0.186.1` | WebGL 3D graphics rendering library |
| `@types/three` | `^0.186.0` | TypeScript definitions for Three.js |
| `@react-three/fiber` | `^9.8.1` | React declarative renderer for Three.js |
| `@designcodeio/threeui` | `^1.2.0` | 3D performance avionics gauges (`PerformanceGauges`, `PredictiveArcCanvas`) |

### Icons & Typography
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `lucide-react` | `^1.48.0` | Featherweight aviation and UI icons (Planes, Compass, Luggage, etc.) |
| `@phosphor-icons/react` | `^2.1.10` | High-precision technical iconography |
| `@base-ui/react` | `^1.8.0` | Unstyled accessible UI foundation components |
| `@fontsource-variable/jetbrains-mono` | `^5.3.0` | Monospaced technical font for telemetry readouts and coordinates |

---

## 3. Backend Packages (`backend/`)

### A. FastAPI Telemetry Service (`backend/fastapi/requirements.txt`)
*Port: 8000 | Docs: `http://localhost:8000/docs`*

| Package | Version Spec | Purpose |
| :--- | :--- | :--- |
| `fastapi` | `>=0.110.0` | Asynchronous REST microservice delivering sub-18ms telemetry endpoints |
| `uvicorn[standard]` | `>=0.28.0` | Production ASGI web server running FastAPI with event loop optimizations |
| `pydantic` | `>=2.6.0` | Strict data validation and schema serialization for flight search models |
| `python-multipart` | `>=0.0.9` | Form data and multipart payload parser |

### B. Flask Corridor Service (`backend/flask/requirements.txt`)
*Port: 5000 | Endpoint: `http://localhost:5000/api/airports`*

| Package | Version Spec | Purpose |
| :--- | :--- | :--- |
| `flask` | `>=3.0.0` | Lightweight WSGI web framework for airport metadata and route fallback |
| `flask-cors` | `>=4.0.0` | Cross-Origin Resource Sharing (CORS) handler for web browser access |
| `requests` | `>=2.31.0` | HTTP request client for upstream gateway polling |

---

## 4. Machine Learning & Ingestion Pipeline Packages (Full Ingestion Pipeline)

*Referenced in Slide 3 & 4 of the architectural specification:*

| Category | Package | Purpose |
| :--- | :--- | :--- |
| **ML Regressors** | `lightgbm>=4.3.0` | Primary gradient boosting model for dynamic yield prediction (MAPE ~4.2%) |
| **ML Regressors** | `xgboost>=2.0.0` | Gradient boosted decision trees for non-linear lead time modeling |
| **ML Regressors** | `catboost>=1.2.0` | Categorical feature inference for airline & corridor multipliers |
| **Math & Data** | `scikit-learn>=1.4.0` | Train/test splitting, conformal prediction bounds, and StandardScaler |
| **Math & Data** | `pandas>=2.2.0` | High-frequency time-series tabular ingestion from 11+ OTAs |
| **Math & Data** | `numpy>=1.26.0` | Vectorized Haversine distance and azimuth geodesic math |
| **Ethical Scraping** | `selenium>=4.18.0` | Automated headless browser for JavaScript-heavy OTA portals |
| **Ethical Scraping** | `beautifulsoup4>=4.12.0` | HTML DOM parsing for base fare and tax decomposition |
| **Streaming & Cache** | `kafka-python>=2.0.2` | Apache Kafka message producer/consumer for real-time observation streaming |
| **Streaming & Cache** | `redis>=5.0.0` | In-memory cache for hot corridor lookups (<1ms latency) |

---

## 5. External APIs, CDNs & Services

| Service | Integration | Purpose |
| :--- | :--- | :--- |
| **Leaflet Map Engine** | `unpkg.com/leaflet@1.9.4` | Open-source airspace and corridor track visualizer |
| **CartoDB Aviation Tiles** | `basemaps.cartocdn.com` | Aviation vector base map layer (Light & Dark mode) |
| **Esri Satellite Tiles** | `server.arcgisonline.com` | High-resolution satellite imagery map layer |
| **Google Identity Services** | `accounts.google.com/gsi/client` | Google OAuth 2.0 authentication for Analyst Gateway |
| **Google Fonts** | `fonts.googleapis.com` | Inter font family (400-900 weights) |

---

## 6. Environment Variables (`.env`)

Configure the following variables in `Frontend/.env` (and root `.env`):

```ini
# Google OAuth 2.0 Credentials (Set your actual values in .env, never commit them)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Airspace Tile Servers
VITE_TILE_AVIATION_VECTOR=https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
VITE_TILE_SATELLITE=https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
VITE_TILE_OSM=https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## 7. Step-by-Step Installation & Run Guide

### Quick Start (Frontend):
```bash
# From repository root:
npm run dev

# Or directly within Frontend folder:
cd Frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173/`

### Build for Production:
```bash
npm run build
# Compiles via TypeScript and Vite into Frontend/dist/ with 0 errors
```

### Quick Start (FastAPI ML Backend):
```bash
cd backend/fastapi
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Docs: `http://localhost:8000/docs`

### Quick Start (Flask Corridor Backend):
```bash
cd backend/flask
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
Endpoint: `http://localhost:5000/api/airports`
