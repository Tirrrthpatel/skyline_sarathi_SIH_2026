# Skyline सारथी - Backend Services (SIH26056)

This directory contains the Python API services powering real-time flight fare telemetry, CPI augmentation matrices, and airport corridor data.

## Directory Structure

```
backend/
├── fastapi/          # High-performance ML inference & telemetry service
│   ├── main.py       # FastAPI application endpoints (/api/predict-fare)
│   └── requirements.txt
└── flask/            # Lightweight corridor & airport data API
    ├── app.py        # Flask application endpoints (/api/airports)
    └── requirements.txt
```

---

## 1. FastAPI Telemetry Service (Port 8000)

Delivers sub-18ms ML inference, conformal prediction bounds, and MoSPI CPI transport weights.

### Setup & Run:
```bash
cd backend/fastapi
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API Documentation: `http://localhost:8000/docs`

---

## 2. Flask Corridor Service (Port 5000)

Provides high-frequency airport metadata, terminal assignments, and fallback routes.

### Setup & Run:
```bash
cd backend/flask
pip install -r requirements.txt
python app.py
```
Endpoint: `http://localhost:5000/api/airports`
