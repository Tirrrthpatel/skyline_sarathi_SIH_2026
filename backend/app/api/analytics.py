from fastapi import APIRouter
from ..models.schemas import DatasetAnalysisResponse
from ..services.data_service import data_service
from ..ml.model_loader import model_loader

router = APIRouter(prefix="/api", tags=["Analytics & System"])

@router.get("/dataset/analyze", response_model=DatasetAnalysisResponse)
async def analyze_dataset():
    """
    Auto-inspects available dataset in backend/app/data/datasets/ and returns schema analysis.
    """
    return data_service.analyze_dataset()

@router.get("/model/status")
async def model_status():
    """
    Returns current ML model status and loaded metadata.
    """
    return {
        "is_model_loaded": model_loader.is_available,
        "model_path": model_loader.model_path,
        "model_format": model_loader.model_format,
        "metadata": model_loader.metadata,
        "message": (
            "Custom ML model is active and serving live inferences."
            if model_loader.is_available
            else "Awaiting custom ML model (.joblib/.pkl in backend/app/model/trained_model/). Operating in development baseline mode."
        )
    }
