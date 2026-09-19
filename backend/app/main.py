import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .api.routes import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skyline_sarathi")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting Skyline सारथी Engine on {settings.HOST}:{settings.PORT}")
    yield
    logger.info("Shutting down Skyline सारथी Engine.")

app = FastAPI(
    title="Skyline सारथी - AI Airplane Fare Price Prediction API",
    description="Production-grade AI/ML aviation fare prediction and intelligence backend.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Skyline सारथी API Engine",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }
