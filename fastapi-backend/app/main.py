import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.config import settings
from app.models.database import Base, engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
logger.info(settings)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title=settings.PROJECT_NAME, debug=settings.DEBUG)

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)


@app.get("/")
async def root():
    """
    Root endpoint.

    Returns basic API information.
    """
    return {
        "message": "Welcome to FastAPI Keycloak Integration API",
        "docs_url": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Used for monitoring and health checks.
    """
    return {"status": "healthy"}
