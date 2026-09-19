# Trained Model Directory

Drop your trained model file (`.joblib`, `.pkl`, `.pickle`, `.onnx`) into this directory.

When placed here:
- The backend automatically loads the model using `joblib` or `pickle`.
- The prediction service automatically routes inference to `model.predict(features)`.
- The API response flags `is_demo: false` and includes live model inference metadata.
- No frontend changes are required.
