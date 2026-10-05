# Skyline सारथी - FastAPI Backend (SIH26056)

FastAPI serves the frontend APIs, including airport metadata and fare predictions backed by Neon.

## Directory Structure

```
backend/
└── fastapi/          # Frontend API and Neon-backed fare service
    ├── main.py       # FastAPI application endpoints
    └── requirements.txt
```

---

## FastAPI Service (Port 8000)

Serves fare predictions using live records from the Neon `flight_fares` table. For an exact
route, cabin, and departure-date match, it uses the median matching fare and returns those
flight listings. If no exact-date fare exists but enough same-route history is available, an
experimental scikit-learn linear regression estimates the fare from historical booking lead
time and departure-date features. That fallback is labeled as an estimate and returns no
invented flight listings. Airport metadata is available from `GET /api/airports`.

### Setup & Run:
```bash
cd backend/fastapi
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API Documentation: `http://localhost:8000/docs`

### Demo linear-regression model

`POST /api/demo/ml/linear-regression` runs a small scikit-learn linear
regression model using **synthetic demo training data**. It accepts distance,
booking window, and number of stops, and returns a sample fare estimate,
feature coefficients, and held-out test metrics. This endpoint is for
demonstrating the ML integration only; its synthetic estimates and metrics are
not trained on Neon data and are not real fare forecasts.

```powershell
$body = @{
    distance_km = 1148
    booking_window_days = 30
    stops = 0
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/demo/ml/linear-regression `
    -Method Post -ContentType "application/json" -Body $body
```

### Verify locally (Windows PowerShell)

With the server running in one terminal, use another PowerShell terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
Invoke-RestMethod http://127.0.0.1:8000/api/airports
```

To verify the Neon-backed fare query as well, send a request with a future
departure date:

```powershell
$body = @{
    origin = "DEL"
    destination = "BOM"
    departure_date = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    cabin_class = "Economy"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/predict-fare `
    -Method Post -ContentType "application/json" -Body $body
```

The health endpoint confirms the API is running and reports whether a database
URL is configured; it does not test the database connection. A fare response
confirms the Neon query worked. `404` means the query succeeded but found no
matching fares; `503` means Neon is not configured or could not be reached.

FastAPI connects directly to Neon PostgreSQL using `psycopg2`; the Neon Data API and
JWKS endpoint are not used for database queries. For local development, set
`DATABASE_URL` in the repository-root `.env` file or in the process environment.
The backend also accepts `DATABASE_URL_UNPOOLED` or `NEON_DB_URL`, and falls back to
the sibling `kraken-scraper/.env.local` file. Use the PostgreSQL connection string
from the Neon console (with SSL enabled), not the `/auth/.well-known/jwks.json`
URL; that JWKS URL is for verifying authentication tokens.

For deployments, configure one of those database variables in the service
environment; do not commit credentials. Fare requests return `404` when the
database has no matching route, cabin, and exact departure date, and `503`
when Neon is unavailable or not configured. When the exact-date query has no rows, the API
trains an experimental regression on grouped same-route/same-cabin INR fare history. The
response marks `details.predictionSource` as `linear_regression`, includes the number of
training observations and held-out test MAE/R², and returns an empty `airlines` array because
the estimate is not a bookable flight. At least eight grouped observations across five
departure dates are required; otherwise the endpoint returns `404`. These test metrics are
for demonstration only and are not a guarantee of forecast accuracy.
