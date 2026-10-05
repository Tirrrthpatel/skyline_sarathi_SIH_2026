from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from ml.linear_regression import FareObservation, predict_demo_fare, predict_route_fare
from pathlib import Path
import logging
import math
import os
import re
import statistics
from datetime import date, datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ROOT_ENV_FILE = PROJECT_ROOT / ".env"
KRAKEN_ENV_FILE = PROJECT_ROOT.parent / "kraken-scraper" / ".env.local"
if ROOT_ENV_FILE.is_file():
    load_dotenv(ROOT_ENV_FILE, override=False)
if KRAKEN_ENV_FILE.is_file():
    load_dotenv(KRAKEN_ENV_FILE, override=False)


def get_database_url() -> str:
    database_url = (
        os.getenv("NEON_DB_URL")
        or os.getenv("DATABASE_URL")
        or os.getenv("DATABASE_URL_UNPOOLED")
    )
    if not database_url:
        raise HTTPException(
            status_code=503,
            detail="Neon database is not configured; set DATABASE_URL or NEON_DB_URL.",
        )
    if database_url.startswith("postgres://"):
        database_url = "postgresql://" + database_url.removeprefix("postgres://")
    return database_url


def fetch_fares(req: "PredictFareRequest") -> tuple[list[dict], dict | None]:
    departure_date = datetime.strptime(
        req.departure_date.split("T")[0], "%Y-%m-%d"
    ).date()
    cabin_class = req.cabin_class
    airline = req.airline.strip() if req.airline else None

    query = """
        WITH ranked_fares AS (
            SELECT
                airline,
                flight_number,
                fare_class,
                departure_airport,
                departure_airport_code,
                arrival_airport,
                arrival_airport_code,
                stop_counts,
                departure_date,
                departure_time,
                arrival_time,
                flight_duration,
                current_price,
                currency,
                website,
                scrape_timestamp,
                ROW_NUMBER() OVER (
                    PARTITION BY website, flight_number, departure_date, departure_time
                    ORDER BY scrape_timestamp DESC
                ) AS fare_rank
            FROM flight_fares
            WHERE UPPER(departure_airport_code) = UPPER(%s)
                AND UPPER(arrival_airport_code) = UPPER(%s)
                AND current_price > 0
                AND (%s IS NULL OR LOWER(COALESCE(fare_class, '')) = LOWER(%s))
                AND departure_date = %s::date
                AND (%s IS NULL OR LOWER(COALESCE(airline, '')) = LOWER(%s))
        )
        SELECT
            airline,
            flight_number,
            fare_class,
            departure_airport,
            departure_airport_code,
            arrival_airport,
            arrival_airport_code,
            stop_counts,
            departure_date,
            departure_time,
            arrival_time,
            flight_duration,
            current_price,
            currency,
            website,
            scrape_timestamp
        FROM ranked_fares
        WHERE fare_rank = 1
        ORDER BY scrape_timestamp DESC
        LIMIT 100
    """
    parameters = (
        req.origin.upper(),
        req.destination.upper(),
        cabin_class,
        cabin_class,
        departure_date,
        airline,
        airline,
    )
    booking_window_query = """
        WITH ranked_observations AS (
            SELECT
                departure_date - scrape_date AS booking_days,
                current_price,
                ROW_NUMBER() OVER (
                    PARTITION BY
                        scrape_date,
                        website,
                        flight_number,
                        departure_date,
                        departure_time
                    ORDER BY scrape_timestamp DESC
                ) AS observation_rank
            FROM flight_fares
            WHERE UPPER(departure_airport_code) = UPPER(%s)
                AND UPPER(arrival_airport_code) = UPPER(%s)
                AND current_price > 0
                AND (%s IS NULL OR LOWER(COALESCE(fare_class, '')) = LOWER(%s))
                AND departure_date > CURRENT_DATE
                AND scrape_date <= CURRENT_DATE
                AND departure_date - scrape_date BETWEEN 0 AND 90
        )
        SELECT
            booking_days,
            AVG(current_price)::float AS average_fare,
            COUNT(*)::integer AS sample_size
        FROM ranked_observations
        WHERE observation_rank = 1
        GROUP BY booking_days
        HAVING COUNT(*) >= 5
        ORDER BY average_fare ASC, sample_size DESC
        LIMIT 1
    """
    booking_window_parameters = (
        req.origin.upper(),
        req.destination.upper(),
        cabin_class,
        cabin_class,
    )

    try:
        with psycopg2.connect(get_database_url(), connect_timeout=5) as connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, parameters)
                fares = [dict(row) for row in cursor.fetchall()]
                cursor.execute(booking_window_query, booking_window_parameters)
                booking_window = cursor.fetchone()
                return fares, dict(booking_window) if booking_window else None
    except HTTPException:
        raise
    except psycopg2.Error as exc:
        logger.error("Neon fare query failed (%s)", type(exc).__name__)
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve fare data from Neon.",
        ) from exc


def fetch_fare_training_data(req: "PredictFareRequest") -> list[FareObservation]:
    query = """
        SELECT
            departure_date,
            scrape_date,
            percentile_cont(0.5) WITHIN GROUP (ORDER BY current_price)::float
                AS median_fare
        FROM flight_fares
        WHERE UPPER(departure_airport_code) = UPPER(%s)
            AND UPPER(arrival_airport_code) = UPPER(%s)
            AND current_price > 0
            AND (%s IS NULL OR LOWER(COALESCE(fare_class, '')) = LOWER(%s))
            AND (%s IS NULL OR LOWER(COALESCE(airline, '')) = LOWER(%s))
            AND UPPER(COALESCE(currency, 'INR')) = 'INR'
            AND scrape_date <= CURRENT_DATE
            AND departure_date >= scrape_date
            AND departure_date - scrape_date BETWEEN 0 AND 90
        GROUP BY departure_date, scrape_date
        ORDER BY scrape_date, departure_date
    """
    cabin_class = req.cabin_class
    airline = req.airline.strip() if req.airline else None
    parameters = (
        req.origin.upper(),
        req.destination.upper(),
        cabin_class,
        cabin_class,
        airline,
        airline,
    )

    try:
        with psycopg2.connect(get_database_url(), connect_timeout=5) as connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, parameters)
                return [dict(row) for row in cursor.fetchall()]
    except HTTPException:
        raise
    except psycopg2.Error as exc:
        logger.error("Neon fare-history query failed (%s)", type(exc).__name__)
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve fare history from Neon for prediction.",
        ) from exc


app = FastAPI(
    title="Skyline Sarathi - Flight Fare API",
    description="Fare predictions and flight listings backed by the Neon flight_fares table",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Airport metadata used by the search route and fare response.
AIRPORTS = [
    {"code": "DEL", "city": "New Delhi", "airport": "Indira Gandhi International Airport", "lat": 28.5562, "lng": 77.1, "terminal": "T3", "state": "Delhi NCR"},
    {"code": "BOM", "city": "Mumbai", "airport": "Chhatrapati Shivaji Maharaj International Airport", "lat": 19.0896, "lng": 72.8656, "terminal": "T2", "state": "Maharashtra"},
    {"code": "BLR", "city": "Bengaluru", "airport": "Kempegowda International Airport", "lat": 13.1986, "lng": 77.7066, "terminal": "T2", "state": "Karnataka"},
    {"code": "MAA", "city": "Chennai", "airport": "Chennai International Airport", "lat": 12.9941, "lng": 80.1709, "terminal": "T1", "state": "Tamil Nadu"},
    {"code": "CCU", "city": "Kolkata", "airport": "Netaji Subhash Chandra Bose International Airport", "lat": 22.6547, "lng": 88.4467, "terminal": "T2", "state": "West Bengal"},
    {"code": "HYD", "city": "Hyderabad", "airport": "Rajiv Gandhi International Airport", "lat": 17.2403, "lng": 78.4294, "terminal": "T1", "state": "Telangana"},
    ]
AIRPORTS_BY_CODE = {airport["code"]: airport for airport in AIRPORTS}
AIRPORT_COORDS = {
    code: {
        "lat": airport["lat"],
        "lng": airport["lng"],
        "city": airport["city"],
        "name": airport["airport"],
    }
    for code, airport in AIRPORTS_BY_CODE.items()
}

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return int(round(R * c))

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    y = math.sin(math.radians(lon2 - lon1)) * math.cos(math.radians(lat2))
    x = math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) - math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(math.radians(lon2 - lon1))
    bearing = math.degrees(math.atan2(y, x))
    return int((bearing + 360) % 360)

class PredictFareRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    cabin_class: Optional[str] = "Economy"
    airline: Optional[str] = None
    trip_type: Optional[str] = "one_way"
    travellers: Optional[int] = Field(default=1, ge=1)


class DemoLinearRegressionRequest(BaseModel):
    distance_km: float = Field(gt=0, le=20000)
    booking_window_days: int = Field(ge=0, le=365)
    stops: int = Field(ge=0, le=5)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "fastapi_fare_api",
        "dataSource": "Neon flight_fares",
        "databaseConfigured": any(
            os.getenv(key)
            for key in ("NEON_DB_URL", "DATABASE_URL", "DATABASE_URL_UNPOOLED")
        ),
    }


@app.get("/api/airports")
def get_airports():
    return AIRPORTS


@app.post("/api/demo/ml/linear-regression")
def demo_linear_regression(req: DemoLinearRegressionRequest):
    return predict_demo_fare(
        distance_km=req.distance_km,
        booking_window_days=req.booking_window_days,
        stops=req.stops,
    )


@app.post("/api/predict-fare")
def predict_fare(req: PredictFareRequest):
    try:
        departure_date = datetime.strptime(
            req.departure_date.split("T")[0], "%Y-%m-%d"
        ).date()
    except ValueError as exc:
        raise HTTPException(
            status_code=422, detail="departure_date must use YYYY-MM-DD format."
        ) from exc

    origin = req.origin.upper()
    destination = req.destination.upper()
    orig = AIRPORT_COORDS.get(origin)
    dest = AIRPORT_COORDS.get(destination)
    if not orig or not dest:
        raise HTTPException(
            status_code=422,
            detail="Origin and destination must be supported airport codes.",
        )

    fares, booking_window = fetch_fares(req)
    if not fares:
        training_data = fetch_fare_training_data(req)
        prediction = predict_route_fare(
            training_data, departure_date, date.today()
        )
        if prediction is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"No fare records found for {origin}-{destination} "
                    f"on {departure_date.isoformat()}, and there is not enough "
                    "route history to train the fallback model."
                ),
            )

        passenger_count = req.travellers or 1
        trip_multiplier = 1.9 if req.trip_type == "round_trip" else 1.0
        predicted_fare = int(
            round(prediction["predictedFare"] * passenger_count * trip_multiplier)
        )
        model_test_mae = prediction["testMae"] * passenger_count * trip_multiplier
        booking_window_days = max(0, (departure_date - date.today()).days)
        recommended_purchase_date = None
        if booking_window:
            recommended_purchase_date = max(
                date.today(),
                departure_date - timedelta(days=booking_window["booking_days"]),
            )
        distance_km = haversine(orig["lat"], orig["lng"], dest["lat"], dest["lng"])
        bearing = calculate_bearing(orig["lat"], orig["lng"], dest["lat"], dest["lng"])

        return {
            "params": req.model_dump(),
            "originAirport": {
                "code": origin,
                "city": orig["city"],
                "airport": orig["name"],
                "lat": orig["lat"],
                "lng": orig["lng"],
            },
            "destinationAirport": {
                "code": destination,
                "city": dest["city"],
                "airport": dest["name"],
                "lat": dest["lat"],
                "lng": dest["lng"],
            },
            "details": {
                "predictedFare": predicted_fare,
                "confidence": None,
                "variance": round(
                    min(100.0, model_test_mae / predicted_fare * 100)
                    if predicted_fare
                    else 0.0,
                    1,
                ),
                "bookingWindowDays": booking_window_days,
                "historicalAvg": predicted_fare,
                "distanceKm": distance_km,
                "flightDurationMinutes": None,
                "sampleSize": 0,
                "currency": "INR",
                "predictionSource": "linear_regression",
                "modelTrainingSamples": prediction["trainingSamples"],
                "modelTestMae": round(model_test_mae),
                "modelTestR2": prediction["testR2"],
                "bestBookingWindowDays": (
                    booking_window["booking_days"] if booking_window else None
                ),
                "recommendedPurchaseDate": (
                    recommended_purchase_date.isoformat()
                    if recommended_purchase_date
                    else None
                ),
                "bookingWindowSampleSize": (
                    booking_window["sample_size"] if booking_window else 0
                ),
                "bestWindowAverageFare": (
                    round(booking_window["average_fare"])
                    if booking_window
                    else None
                ),
            },
            "airlines": [],
            "funnelStages": [],
            "forecastCurve": [],
            "bearing": bearing,
        }

    prices = [float(fare["current_price"]) for fare in fares]
    average_price = statistics.mean(prices)
    median_price = statistics.median(prices)
    passenger_count = req.travellers or 1
    trip_multiplier = 1.9 if req.trip_type == "round_trip" else 1.0
    predicted_fare = int(round(median_price * passenger_count * trip_multiplier))
    historical_avg = int(round(average_price * passenger_count * trip_multiplier))

    distance_km = haversine(orig["lat"], orig["lng"], dest["lat"], dest["lng"])
    bearing = calculate_bearing(orig["lat"], orig["lng"], dest["lat"], dest["lng"])
    booking_window_days = max(0, (departure_date - datetime.now().date()).days)
    recommended_purchase_date = None
    if booking_window:
        recommended_purchase_date = (
            departure_date - timedelta(days=booking_window["booking_days"])
        )
        if recommended_purchase_date < date.today():
            recommended_purchase_date = date.today()
    durations = []
    for fare in fares:
        match = re.fullmatch(
            r"(?:(\d+)h\s*)?(?:(\d+)m)?",
            (fare["flight_duration"] or "").strip(),
        )
        if match:
            hours, minutes = match.groups()
            durations.append(int(hours or 0) * 60 + int(minutes or 0))
    flight_duration_min = int(round(statistics.median(durations))) if durations else None

    variance_pct = round(
        min(25.0, statistics.pstdev(prices) / average_price * 100)
        if average_price
        else 0.0,
        1,
    )

    airlines = []
    for fare in fares:
        flight_price = int(round(float(fare["current_price"]) * passenger_count * trip_multiplier))
        flight_number = fare["flight_number"]
        airline_code = flight_number.split("-", maxsplit=1)[0]
        stop_count = fare["stop_counts"] or 0
        airlines.append({
            "code": airline_code,
            "name": fare["airline"] or airline_code,
            "multiplier": round(flight_price / predicted_fare, 2) if predicted_fare else 1.0,
            "category": fare["fare_class"] or "",
            "flightNumberPrefix": flight_number,
            "calculatedFare": flight_price,
            "currentPrice": float(fare["current_price"]),
            "currency": fare["currency"] or "INR",
            "baggage": "",
            "departureTime": fare["departure_time"].strftime("%I:%M %p"),
            "arrivalTime": (
                fare["arrival_time"].strftime("%I:%M %p")
                if fare["arrival_time"]
                else ""
            ),
            "stops": "Non-stop" if stop_count == 0 else f"{stop_count} stop(s)",
            "departureAirport": fare["departure_airport"],
            "departureAirportCode": fare["departure_airport_code"],
            "arrivalAirport": fare["arrival_airport"],
            "arrivalAirportCode": fare["arrival_airport_code"],
            "departureDate": fare["departure_date"].isoformat(),
            "flightDuration": fare["flight_duration"],
            "website": fare["website"],
            "scrapeTimestamp": (
                fare["scrape_timestamp"].isoformat()
                if fare["scrape_timestamp"]
                else None
            ),
            "highlights": f"{fare['website']} fare · {fare['departure_date'].isoformat()}",
        })

    return {
        "params": req.model_dump(),
        "originAirport": {
            "code": origin,
            "city": orig["city"],
            "airport": fares[0]["departure_airport"] or orig["name"],
            "lat": orig["lat"],
            "lng": orig["lng"],
        },
        "destinationAirport": {
            "code": destination,
            "city": dest["city"],
            "airport": fares[0]["arrival_airport"] or dest["name"],
            "lat": dest["lat"],
            "lng": dest["lng"],
        },
        "details": {
            "predictedFare": predicted_fare,
            "confidence": None,
            "variance": variance_pct,
            "bookingWindowDays": booking_window_days,
            "historicalAvg": historical_avg,
            "distanceKm": distance_km,
            "flightDurationMinutes": flight_duration_min,
            "sampleSize": len(fares),
            "currency": fares[0]["currency"] or "INR",
            "predictionSource": "database",
            "modelTrainingSamples": None,
            "modelTestMae": None,
            "modelTestR2": None,
            "bestBookingWindowDays": (
                booking_window["booking_days"] if booking_window else None
            ),
            "recommendedPurchaseDate": (
                recommended_purchase_date.isoformat()
                if recommended_purchase_date
                else None
            ),
            "bookingWindowSampleSize": (
                booking_window["sample_size"] if booking_window else 0
            ),
            "bestWindowAverageFare": (
                round(booking_window["average_fare"])
                if booking_window
                else None
            ),
        },
        "airlines": airlines,
        "funnelStages": [],
        "forecastCurve": [],
        "bearing": bearing
    }
