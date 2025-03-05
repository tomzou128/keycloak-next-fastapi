from fastapi import APIRouter

from app.api import users, items

# Create main API router
api_router = APIRouter(prefix="/api")

# Include sub-routers
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
