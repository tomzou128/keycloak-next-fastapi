from fastapi import APIRouter

from app.api import users, items

# Create main API router
api_router = APIRouter(prefix="/api")

# Include sub-routers
api_router.include_router(users.router)
api_router.include_router(items.router)
