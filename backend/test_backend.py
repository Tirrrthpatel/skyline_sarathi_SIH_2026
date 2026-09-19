import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

try:
    from app.main import app
    from app.models.schemas import FlightSearchRequest
    from app.services.prediction_service import prediction_service
    from app.services.data_service import data_service

    print("[SUCCESS] FastAPI app and services imported successfully!")

    # Test prediction service
    sample_request = FlightSearchRequest(
        origin="DEL",
        destination="BOM",
        departure_date="2026-10-20",
        trip_type="one_way",
        travellers=1,
        cabin_class="economy"
    )
    result = prediction_service.predict_fare(sample_request)
    print(f"[SUCCESS] Test prediction executed! Predicted fare: {result.predicted_fare} {result.currency}")
    print(f"Confidence: {result.confidence}%, Status: {result.price_status}, Model: {result.model_status}")
    print(f"Fare trend points: {len(result.fare_trend)}, Popular flights: {len(result.popular_flights)}")

    # Test dataset analyzer
    analysis = data_service.analyze_dataset()
    print(f"[SUCCESS] Dataset analysis status: {analysis['validation_status']}")

except Exception as e:
    print(f"[ERROR] Test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
