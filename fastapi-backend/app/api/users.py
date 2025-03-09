from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user, has_role
from app.models.database import get_db
from app.schemas.user import UserInfo, UserVO, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserInfo)
async def read_users_me(current_user: UserInfo = Depends(get_current_user)):
    """
    Get information about the currently authenticated user from Keycloak.

    This endpoint requires authentication.
    """
    return current_user


@router.get("/me/profile", response_model=UserVO)
async def read_user_profile(
        db: Session = Depends(get_db),
        current_user: UserInfo = Depends(get_current_user)
):
    """
    Get the user's profile information from the application database.

    This endpoint requires authentication.
    """
    # Synchronize user data from Keycloak
    user = UserService.sync_user(db, current_user)
    return user


@router.put("/me/profile", response_model=UserVO)
async def update_user_profile(
        user_update: UserUpdate,
        db: Session = Depends(get_db),
        current_user: UserInfo = Depends(get_current_user)
):
    """
    Update the user's profile information.

    This endpoint requires authentication.
    """
    # Ensure the user exists in the database
    UserService.sync_user(db, current_user)

    # Update the user profile
    updated_user = UserService.update_user(db, current_user.sub, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")

    return updated_user


@router.get("", response_model=List[UserVO])
async def read_users(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        _: bool = Depends(has_role(["admin"]))
):
    """
    Get all users (admin only).

    This endpoint requires authentication and the admin role.
    """
    users = UserService.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserVO)
async def read_user(
        user_id: str,
        db: Session = Depends(get_db),
        _: bool = Depends(has_role(["admin"]))
):
    """
    Get a specific user by ID (admin only).

    This endpoint requires authentication and the admin role.
    """
    user = UserService.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
