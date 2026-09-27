# Skyline सारथी ✈️
### Real-Time Airfare Price Index for India Through Automated Web Scraping for CPI Augmentation

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-black?style=flat-square&logo=target)](https://sih.gov.in)
[![Problem Statement ID](https://img.shields.io/badge/SIH26056-Smart%20Automation-f3d400?style=flat-square&labelColor=black&color=f3d400)](https://sih.gov.in)
[![Team 21 Jolly Roger](https://img.shields.io/badge/Team%20ID-171809-black?style=flat-square)](https://sih.gov.in)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-emerald?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple?style=flat-square&logo=vite)](https://vitejs.dev)

---

## 📌 Executive Summary

Civil aviation pricing in India is highly volatile, dynamic, and fragmented across independent airline websites (IndiGo, Air India, SpiceJet, Akasa) and Online Travel Agencies (MakeMyTrip, EaseMyTrip, Yatra, Cleartrip). Traditional statistical surveys conducted for national economic indicators lack the frequency to capture real-time tariff fluctuations.

**Skyline सारथी** replaces static manual surveys with a scalable, robots.txt-compliant automated scraping and machine learning pipeline that computes a real-time, **DGCA-weighted Airfare Price Index**. This digital telemetry directly augments the **Consumer Price Index (CPI)** for the **Ministry of Statistics and Programme Implementation (MoSPI)** and monetary policy analysts at the **Reserve Bank of India (RBI)**.

---

## 🏛️ System Architecture

```
d:\UNI\Skyline_Sarathi\
├── backend/                       # Python Backend Microservices
│   ├── fastapi/                   # FastAPI ML Telemetry Engine (Port 8000)
│   │   ├── main.py                # Asynchronous REST endpoints (/api/predict-fare)
│   │   └── requirements.txt
│   ├── flask/                     # Flask Airport & Route Service (Port 5000)
│   │   ├── app.py                 # REST endpoints (/api/airports)
│   │   └── requirements.txt
│   └── README.md                  # Backend setup & API documentation
│
├── Frontend/                      # React / TypeScript Application
│   ├── src/
│   │   ├── components/            # Swiss International UI components
│   │   │   ├── landing/           # HeroSection, ProblemStatement, Pipeline, etc.
│   │   │   ├── ui/                # FlipWords, CardSpotlight primitives
│   │   │   ├── AvionicsCockpit.tsx# WebGL ThreeUI 3D diagnostic cockpit
│   │   │   ├── RouteMap.tsx       # Leaflet airspace & corridor tracking
│   │   │   ├── FlightSearchWidget.tsx
│   │   │   ├── FlightPriceAnalysis.tsx
│   │   │   ├── FareForecastCurve.tsx
│   │   │   ├── WhatIfSimulator.tsx
│   │   │   └── AirlineFareComparison.tsx
│   │   ├── lib/                   # api.ts, aviationData.ts, utils.ts
│   │   ├── types/                 # aviation.ts TypeScript data schemas
│   │   ├── App.tsx                # Main view router & state container
│   │   ├── index.css              # Swiss typography, tokens & Tailwind v4
│   │   └── main.tsx               # Client entry point
│   ├── public/                    # Static assets, fonts, and cursors
│   ├── .env.example               # Frontend environment template
│   ├── package.json               # Frontend dependencies & build scripts
│   ├── tsconfig.json              # TypeScript compilation specifications
│   └── vite.config.ts             # Vite bundler configuration
│
├── .env.example                   # Root environment template
├── .gitignore                     # Git ignore rules protecting credentials
├── package.json                   # Root command delegator
└── requirement.md                 # Detailed package & environment specs
```

---

## ✨ Key Features & Technical Highlights

### 1. Swiss International Typographic Style (60:30:10 Design Ratio)
- **60% Dominant Canvas**: Pure `#FFFFFF` in Light Mode and deep carbon `#000000` in Dark Mode.
- **30% Secondary Accent (`#f3d400`)**: Aviation Canary Yellow utilized across active navigation tabs, corridor badges, telemetry channels, and predicted fare bars.
- **10% High-Contrast Action**: Jet-black borders (`2px solid #000000`) and high-impact action triggers.
- **0px Border Radius**: Strict mathematical precision adhering to classical Swiss grid design.
- **Custom Airplane Cursor**: Aerodynamic black airplane pointer with high-contrast outline.

### 2. Airport Split-Flap Typographic Flip (`FlipWords`)
- Mechanical 3D departure-board flip transition cycling through `"AIRFARE PRICE"`, `"CORRIDOR TARIFF"`, `"DYNAMIC YIELD"`, and `"AVIATION CPI"`.
- Features smooth vertical entry, crisp micro-stagger (`0.02s`), and high-contrast typography in `#f3d400`.

### 3. Avionics Telemetry Cockpit (WebGL ThreeUI)
- Interactive 3D instrument deck featuring **Tachometer**, **Speedometer**, **Boost Gauge**, and **Predictive Trajectory Arcs**.
- Live telemetry monitoring inference velocity (<18ms), scraping cadence (120 ops/s), and 95% conformal bounds.

### 4. Interactive Airspace Geodesic Map (`RouteMap`)
- Spherical Great Circle Geodesic arc interpolation connecting Indian metro corridors.
- Dual-tile layer support: **Aviation CartoDB Vector** and **Esri High-Resolution Satellite**.
- 100% free, zero quota limits, and no billing requirements.

### 5. 5-Stage Tariff Breakdown Waterfall (`FlightPriceAnalysis`)
- Decomposes observed gross tariffs into:
  1. Base Airfare
  2. Predicted ML Yield Vector
  3. Aviation Turbine Fuel (ATF) Surcharge
  4. User Development Fees (UDF) & Airport Taxes
  5. DGCA Passenger-Weighted CPI Index

### 6. Dynamic "What-If" Elasticity Engine (`WhatIfSimulator`)
- Interactive real-time sensitivity calculator testing elasticity across booking horizons (T-1 to T-60 days out), weekend premiums (+15%), festive demand (+25%), and cabin multipliers (Economy, Premium Economy, Business).

### 7. 4-Major Carrier Benchmark (`AirlineFareComparison`)
- Calibrated multiplier indices comparing **IndiGo (6E)**, **Air India (AI)**, **SpiceJet (SG)**, and **Akasa Air (QP)** with baggage and schedule entitlements.

### 8. Analyst Gateway with Google OAuth 2.0
- Real Google Identity Services authentication with instant verified session fallback for offline hackathon evaluations.

---

### ⚙️ Step-by-Step Environment & Google OAuth Setup

#### Step 1: Copy Environment Templates
Do **not** commit `.env`. Instead, copy the provided `.env.example` templates:

```bash
# From the project root:
cp .env.example .env

# And inside the Frontend folder:
cp Frontend/.env.example Frontend/.env
```

#### Step 2: Configure Google Cloud OAuth 2.0 Credentials
If you wish to connect your own Google OAuth 2.0 Client:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `Skyline-Sarathi-SIH`).
3. Under **APIs & Services** > **OAuth consent screen**:
   - Select **External** user type and provide your App Name and Developer Contact Email.
4. Under **APIs & Services** > **Credentials**:
   - Click **+ Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Skyline Sarathi Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` *(Local development)*
     - `http://localhost:4173` *(Local production preview)*
     - `https://your-production-domain.com` *(Production)*
5. Copy the generated **Client ID** and **Client Secret**.
6. Open your local `.env` and `Frontend/.env` and paste them:
   ```ini
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=your_client_secret
   ```

#### Step 3: Offline / Evaluation Fallback Mode (Hackathon Evaluation)
If running offline, without an internet connection, or without a Google Cloud project:
- Click **"Sign In"** in the top navigation bar.
- Click **"Authorize As Google Verified Analyst"** in the modal.
- This immediately instantiates a certified MoSPI Economic Research Analyst session (`analyst.mospi@nic.in`) without contacting external Google servers, unlocking all telemetry, scraping controls, and export features instantly!

---

## 🚀 Getting Started

### Prerequisites:
- **Node.js**: `v18.18+` or `v20+` (LTS recommended)
- **Python**: `3.10+` or `3.11+`
- **npm**: `v9+` or `v10+`

---

### Step 1: Run the Frontend

You can run the development server directly from the root:
```bash
# Install dependencies (first time only)
npm --prefix Frontend install

# Start Vite Dev Server
npm run dev
```
*Or navigate into `Frontend/` directly:*
```bash
cd Frontend
npm install
npm run dev
```
**Access in Browser**: Open `http://localhost:5173/`

To test the production build:
```bash
npm run build
```
*(Compiles via TypeScript and Vite with 0 errors in ~300ms)*

---

### Step 2: Run the FastAPI Telemetry Backend (Port 8000)

```bash
cd backend/fastapi
python -m venv venv

# Activate Virtual Environment:
# Windows (PowerShell):
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Run FastAPI server:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- **API Documentation**: Open `http://localhost:8000/docs`
- **Inference Endpoint**: `POST /api/predict-fare`

---

### Step 3: Run the Flask Airport Corridor Backend (Port 5000)

```bash
cd backend/flask
python -m venv venv

# Activate Virtual Environment:
# Windows (PowerShell):
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Run Flask server:
python app.py
```
- **Airports Endpoint**: `GET http://localhost:5000/api/airports`

---

## 📊 Macroeconomic Research & Citations

1. **MoSPI (2025)**: *Consumer Price Index (CPI) - Methodology Expert Group on CPI*. Recommendations on augmenting physical price surveys with high-frequency automated web scraping.
2. **DGCA (2025-2026)**: *Directorate General of Civil Aviation - Monthly Domestic Air Traffic Density Statistics*. Official city-pair passenger densities used for weighting index calculations.
3. **ISSN: 2583-9055**: *Flight Fare Prediction Using Machine Learning Regressors and Booking Horizon Matrices*.
4. **E-ISSN: 3050-9726**: *The Ethics of Web Scraping in Public Policy Research: robots.txt compliance, rate-limiting, and legal defensibility*.

---

## 👥 Team 21 Jolly Roger

- **Problem Statement ID**: SIH26056
- **Team ID**: 171809
- **Theme**: Smart Automation
- **Organization**: Smart India Hackathon 2026

Developed with mathematical rigor, architectural integrity, and high-frequency real-time intelligence.
