from typing import Dict, Any
from ..models.schemas import FlightSearchRequest, FarePredictionResponse
from ..ml.preprocessing import extract_features
from .model_service import model_service
from .analytics_service import analytics_service

class PredictionService:
    """
    Main prediction pipeline.
    Orchestrates preprocessing -> model inference -> analytical synthesis -> API response.
    """
    def predict_fare(self, request: FlightSearchRequest) -> FarePredictionResponse:
        req_dict = request.model_dump()
        features = extract_features(req_dict)

        # Execute ML prediction (custom model if loaded, or structured empirical baseline)
        predicted_fare, confidence, is_demo, model_status = model_service.predict(features)

        # Expected uncertainty band
        expected_min = round(predicted_fare * 0.90 / 10) * 10
        expected_max = round(predicted_fare * 1.12 / 10) * 10

        # Price status determination
        days_ahead = features["days_to_departure"]
        if days_ahead < 5:
            price_status = "higher_than_average"
        elif 12 <= days_ahead <= 25:
            price_status = "lower_than_average"
        else:
            price_status = "average"

        # Generate analytics
        trend = analytics_service.generate_fare_trend(predicted_fare, features["departure_date"])
        best_time = analytics_service.calculate_best_time(predicted_fare, trend)
        insights = analytics_service.generate_price_insights(price_status, days_ahead)
        feature_importance = analytics_service.get_feature_importance()
        popular_flights = analytics_service.get_popular_flights(features["origin"], features["destination"], predicted_fare)

        return FarePredictionResponse(
            origin=features["origin"],
            destination=features["destination"],
            departure_date=features["departure_date"],
            predicted_fare=predicted_fare,
            currency="INR",
            expected_min=expected_min,
            expected_max=expected_max,
            confidence=confidence,
            price_status=price_status,
            is_demo=is_demo,
            model_status=model_status,
            best_time_to_book=best_time,
            fare_trend=trend,
            price_insights=insights,
            feature_importance=feature_importance,
            popular_flights=popular_flights
        )

prediction_service = PredictionService()
