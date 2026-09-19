import os
import json
from pathlib import Path
from typing import List

# Base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BACKEND_DIR / "app" / "data" / "datasets"
MODEL_DIR = BACKEND_DIR / "app" / "model" / "trained_model"

class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS
    _raw_cors = os.getenv("CORS_ORIGINS", '["http://localhost:3000","http://localhost:5173","*"]')
    try:
        CORS_ORIGINS: List[str] = json.loads(_raw_cors)
    except Exception:
        CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "*"]

    # Model & Dataset paths
    MODEL_PATH: str = os.getenv("MODEL_PATH", "")
    DATASET_PATH: str = os.getenv("DATASET_PATH", "")
    
    # External credentials (for future external ML APIs if needed)
    API_KEY: str = os.getenv("API_KEY", "")
    EXTERNAL_API_URL: str = os.getenv("EXTERNAL_API_URL", "")
    
    # Default directories for auto-detection
    AUTO_DATA_DIR: Path = DATA_DIR
    AUTO_MODEL_DIR: Path = MODEL_DIR

settings = Settings()
