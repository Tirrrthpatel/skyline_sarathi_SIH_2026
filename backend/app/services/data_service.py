import os
import glob
from pathlib import Path
from typing import Optional, Dict, Any
import pandas as pd
from ..config.settings import settings

class DataService:
    """
    Automated dataset ingestion, validation, schema detection, and analytics service.
    Designed to automatically inspect and validate user-supplied datasets (.csv, .xlsx, .json).
    """
    REQUIRED_FEATURES = ["origin", "destination", "departure_date", "price"]
    OPTIONAL_FEATURES = ["airline", "duration", "stops", "cabin_class", "booking_date"]

    def find_dataset_file(self) -> Optional[str]:
        # 1. Check explicit setting
        if settings.DATASET_PATH and os.path.isfile(settings.DATASET_PATH):
            return settings.DATASET_PATH

        # 2. Check auto datasets directory
        search_dir = settings.AUTO_DATA_DIR
        if search_dir.exists():
            for ext in ["*.csv", "*.xlsx", "*.xls", "*.json", "*.parquet"]:
                files = glob.glob(str(search_dir / ext))
                if files:
                    return files[0]
        return None

    def analyze_dataset(self) -> Dict[str, Any]:
        """
        Inspects available dataset file and returns comprehensive structural analytics.
        """
        filepath = self.find_dataset_file()
        if not filepath:
            return {
                "is_loaded": False,
                "filename": None,
                "total_rows": 0,
                "columns": [],
                "column_types": {},
                "missing_values": {},
                "detected_features": {},
                "validation_status": "PENDING_USER_DATASET",
                "message": (
                    "No dataset file detected in backend/app/data/datasets/. "
                    "Drop your CSV, Excel, or JSON dataset to enable automated schema ingestion."
                )
            }

        try:
            p = Path(filepath)
            ext = p.suffix.lower()
            if ext == ".csv":
                df = pd.read_csv(filepath)
            elif ext in [".xlsx", ".xls"]:
                df = pd.read_excel(filepath)
            elif ext == ".json":
                df = pd.read_json(filepath)
            elif ext == ".parquet":
                df = pd.read_parquet(filepath)
            else:
                return {
                    "is_loaded": False,
                    "filename": p.name,
                    "total_rows": 0,
                    "columns": [],
                    "column_types": {},
                    "missing_values": {},
                    "detected_features": {},
                    "validation_status": "UNSUPPORTED_FORMAT",
                    "message": f"Unsupported file extension: {ext}"
                }

            # Schema inspection
            cols = list(df.columns)
            col_types = {str(c): str(t) for c, t in df.dtypes.items()}
            missing = {str(c): int(df[c].isnull().sum()) for c in df.columns}

            # Fuzzy match required and optional features
            detected_features: Dict[str, Optional[str]] = {}
            lower_cols = {c.lower().replace(" ", "_"): c for c in cols}

            for req in self.REQUIRED_FEATURES + self.OPTIONAL_FEATURES:
                match = None
                for lc, orig in lower_cols.items():
                    if req in lc or lc in req:
                        match = orig
                        break
                detected_features[req] = match

            # Validation check
            missing_reqs = [
                r for r in self.REQUIRED_FEATURES if detected_features.get(r) is None
            ]
            if missing_reqs:
                status = "VALIDATION_WARNING_MISSING_COLUMNS"
                msg = f"Dataset loaded ({len(df)} rows) but missing standard aviation columns: {missing_reqs}"
            else:
                status = "READY_FOR_TRAINING_OR_PIPELINE"
                msg = f"Dataset successfully analyzed: {len(df)} records across {len(cols)} features."

            return {
                "is_loaded": True,
                "filename": p.name,
                "total_rows": len(df),
                "columns": cols,
                "column_types": col_types,
                "missing_values": missing,
                "detected_features": detected_features,
                "validation_status": status,
                "message": msg
            }

        except Exception as e:
            return {
                "is_loaded": False,
                "filename": os.path.basename(filepath),
                "total_rows": 0,
                "columns": [],
                "column_types": {},
                "missing_values": {},
                "detected_features": {},
                "validation_status": "ANALYSIS_ERROR",
                "message": f"Error parsing dataset: {str(e)}"
            }

data_service = DataService()
