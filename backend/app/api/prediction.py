import logging
from fastapi import APIRouter, HTTPException
from ..models.schemas import FlightSearchRequest, FarePredictionResponse
from ..services.prediction_service import prediction_service

logger = logging.getLogger("skypredict.api.prediction")
router = APIRouter(prefix="/api", tags=["Prediction"])

@router.post("/predict-fare", response_model=FarePredictionResponse)
async def predict_fare(request: FlightSearchRequest):
    """
    Predict flight fare based on route, date, class, and market parameters.
    Connects seamlessly to custom trained ML models or baseline empirical estimation.
    """
    try:
        return prediction_service.predict_fare(request)
    except Exception as e:
        logger.error(f"Prediction pipeline error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="The SkyPredict prediction service encountered an issue processing this route."
        )
