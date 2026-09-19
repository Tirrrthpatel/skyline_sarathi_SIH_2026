# Datasets Directory

Drop your dataset files (`.csv`, `.xlsx`, `.json`, `.parquet`) into this directory.

When a file is placed here:
- The backend automatically detects it.
- Visiting `GET /api/dataset/analyze` will automatically inspect columns, data types, and missing values.
- If features like `origin`, `destination`, `departure_date`, and `price` exist, the system validates the schema for ingestion.
