import os
import glob
import logging
from pathlib import Path
from typing import Any, Optional, Dict
from ..config.settings import settings

logger = logging.getLogger("skypredict.model_loader")

class ModelLoader:
    """
    Modular loader for aviation ML prediction models.
    Supports .joblib, .pkl, .pickle, and saved scikit-learn / compatible models.
    """
    def __init__(self):
        self.model: Any = None
        self.model_path: Optional[str] = None
        self.model_format: Optional[str] = None
        self.metadata: Dict[str, Any] = {}
        self.load_model()

    def find_model_file(self) -> Optional[str]:
        # 1. Check explicit environment variable MODEL_PATH
        if settings.MODEL_PATH and os.path.isfile(settings.MODEL_PATH):
            return settings.MODEL_PATH

        # 2. Check trained_model directory for any candidate model file
        search_dir = settings.AUTO_MODEL_DIR
        if search_dir.exists():
            candidates = []
            for ext in ["*.joblib", "*.pkl", "*.pickle", "*.onnx", "*.bin"]:
                candidates.extend(glob.glob(str(search_dir / ext)))
            if candidates:
                return candidates[0]
        return None

    def load_model(self) -> bool:
        path = self.find_model_file()
        if not path:
            logger.info("No custom trained ML model file found. Running in baseline empirical mode.")
            self.model = None
            self.model_path = None
            self.model_format = None
            return False

        try:
            ext = Path(path).suffix.lower()
            if ext in [".joblib", ".pkl", ".pickle"]:
                import joblib
                self.model = joblib.load(path)
                self.model_path = path
                self.model_format = ext
                self.metadata = {
                    "path": path,
                    "format": ext,
                    "type": type(self.model).__name__,
                }
                logger.info(f"Successfully loaded custom ML model from {path} ({type(self.model).__name__})")
                return True
            else:
                logger.warning(f"Unsupported model extension: {ext}")
                return False
        except Exception as e:
            logger.error(f"Failed to load model from {path}: {e}")
            self.model = None
            return False

    @property
    def is_available(self) -> bool:
        return self.model is not None

model_loader = ModelLoader()
