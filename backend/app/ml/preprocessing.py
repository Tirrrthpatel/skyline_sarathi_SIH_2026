from datetime import datetime, date
from typing import Dict, Any
import numpy as np
import pandas as pd

# Route distance approximations (km) for major Indian aviation corridors
ROUTE_DISTANCES: Dict[str, int] = {
    "DEL-BOM": 1148, "BOM-DEL": 1148,
    "DEL-BLR": 1740, "BLR-DEL": 1740,
    "DEL-CCU": 1305, "CCU-DEL": 1305,
    "DEL-HYD": 1253, "HYD-DEL": 1253,
    "DEL-AMD": 775,  "AMD-DEL": 775,
    "BOM-BLR": 842,  "BLR-BOM": 842,
    "BOM-GOI": 435,  "GOI-BOM": 435,
    "BOM-AMD": 441,  "AMD-BOM": 441,
    "BLR-HYD": 500,  "HYD-BLR": 500,
    "BLR-MAA": 290,  "MAA-BLR": 290,
}

CABIN_WEIGHTS = {
    "economy": 1.0,
    "premium_economy": 1.45,
    "business": 2.8,
    "first": 4.5
}

def extract_features(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts structured numerical and categorical features from raw flight search request.
    Ready to be formatted for ML inference or empirical baseline estimation.
    """
    origin = request_data.get("origin", "DEL").upper().strip()
    dest = request_data.get("destination", "BOM").upper().strip()
    dep_str = request_data.get("departure_date", "")
    cabin = request_data.get("cabin_class", "economy").lower().strip()
    trip_type = request_data.get("trip_type", "one_way").lower()
    travellers = int(request_data.get("travellers", 1))

    # Parse dates
    today = date.today()
    try:
        dep_date = datetime.strptime(dep_str, "%Y-%m-%d").date()
    except Exception:
        dep_date = today

    days_to_dep = max(0, (dep_date - today).days)
    day_of_week = dep_date.weekday()  # 0 = Monday, 6 = Sunday
    is_weekend = 1 if day_of_week in [4, 5, 6] else 0
    month = dep_date.month

    # Route distance
    pair = f"{origin}-{dest}"
    distance = ROUTE_DISTANCES.get(pair, 1000)

    cabin_multiplier = CABIN_WEIGHTS.get(cabin, 1.0)
    trip_multiplier = 1.9 if trip_type == "round_trip" else 1.0

    return {
        "origin": origin,
        "destination": dest,
        "pair": pair,
        "departure_date": str(dep_date),
        "days_to_departure": days_to_dep,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "month": month,
        "estimated_distance_km": distance,
        "cabin_class": cabin,
        "cabin_multiplier": cabin_multiplier,
        "trip_multiplier": trip_multiplier,
        "travellers": travellers,
    }

def prepare_feature_dataframe(features: Dict[str, Any]) -> pd.DataFrame:
    """Creates a 1-row Pandas DataFrame matching typical flight ML feature vectors."""
    return pd.DataFrame([features])
