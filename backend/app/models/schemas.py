from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FlightSearchRequest(BaseModel):
    origin: str = Field(..., example="DEL", description="3-letter airport code or city name")
    destination: str = Field(..., example="BOM", description="3-letter airport code or city name")
    departure_date: str = Field(..., example="2026-10-20", description="YYYY-MM-DD")
    return_date: Optional[str] = Field(None, example="2026-10-25")
    trip_type: str = Field("one_way", example="one_way", description="one_way, round_trip, or multi_city")
    travellers: int = Field(1, ge=1, le=9)
    cabin_class: str = Field("economy", example="economy", description="economy, premium_economy, business, first")
    preferred_airline: Optional[str] = Field(None, example="IndiGo")

class FareTrendPoint(BaseModel):
    date: str
    predicted_fare: float
    is_optimal: bool = False

class PriceInsight(BaseModel):
    title: str
    description: str
    type: str = "info"  # positive, warning, info
    impact: Optional[str] = None

class FeatureImportance(BaseModel):
    feature: str
    importance: float
    description: str

class PopularFlight(BaseModel):
    airline: str
    flight_number: str
    departure_time: str
    arrival_time: str
    duration: str
    stops: str
    predicted_fare: float
    currency: str = "INR"

class BestTimeToBook(BaseModel):
    recommended_date: str
    predicted_lowest_fare: float
    potential_difference: float
    advice: str
    confidence_score: int

class FarePredictionResponse(BaseModel):
    origin: str
    destination: str
    departure_date: str
    predicted_fare: float
    currency: str = "INR"
    expected_min: float
    expected_max: float
    confidence: int
    price_status: str  # lower_than_average, average, higher_than_average
    is_demo: bool = True
    model_status: str
    model_format: Optional[str] = None
    best_time_to_book: BestTimeToBook
    fare_trend: List[FareTrendPoint]
    price_insights: List[PriceInsight]
    feature_importance: List[FeatureImportance]
    popular_flights: List[PopularFlight]

class DatasetAnalysisResponse(BaseModel):
    is_loaded: bool
    filename: Optional[str] = None
    total_rows: int = 0
    columns: List[str] = []
    column_types: Dict[str, str] = {}
    missing_values: Dict[str, int] = {}
    detected_features: Dict[str, Optional[str]] = {}
    validation_status: str
    message: str
