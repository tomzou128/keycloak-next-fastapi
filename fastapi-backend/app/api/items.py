from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, has_role
from app.models.database import get_db
from app.schemas.item import Item, ItemCreate, ItemUpdate
from app.schemas.user import UserInfo
from app.services.item_service import ItemService

router = APIRouter()


@router.get("", response_model=List[Item])
async def read_items(
        skip: int = 0,
        limit: int = 100,
        all_items: bool = False,
        db: Session = Depends(get_db),
        current_user: UserInfo = Depends(get_current_user)
):
    """
    Get items based on user permissions.

    If all_items=True and the user has the admin role, returns all items.
    Otherwise, returns only the current user's items.

    This endpoint requires authentication.
    """
    # Check if the user wants to see all items and has admin role
    if all_items:
        # Check for admin role in realm_access
        realm_roles = current_user.realm_access.get("roles", []) if current_user.realm_access else []
        if "admin" in realm_roles:
            # User is an admin, return all items
            items = ItemService.get_items(db, skip=skip, limit=limit)
            return items

    # Return only the user's items (default)
    items = ItemService.get_user_items(db, user_id=current_user.sub, skip=skip, limit=limit)
    return items


@router.get("/me", response_model=List[Item])
async def read_user_items(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_user: UserInfo = Depends(get_current_user)
):
    """
    Get all items owned by the current user.

    This endpoint requires authentication.
    """
    items = ItemService.get_user_items(db, user_id=current_user.sub, skip=skip, limit=limit)
    return items


@router.get("/{item_id}", response_model=Item)
async def read_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: UserInfo = Depends(get_current_user)
):
    """
    Get a specific item by ID.

    This endpoint requires authentication.
    """
    item = ItemService.get_item(db, item_id=item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(
        item: ItemCreate,
        db: Session = Depends(get_db),
        current_user: UserInfo = Depends(get_current_user)
):
    """
    Create a new item.

    This endpoint requires authentication.
    """
    return ItemService.create_item(db=db, item=item, owner_id=current_user.sub)


@router.put("/{item_id}", response_model=Item)
async def update_item(
        item_id: int,
        item: ItemUpdate,
        db: Session = Depends(get_db),
        current_user: UserInfo = Depends(get_current_user)
):
    """
    Update an item.

    This endpoint requires authentication and the current user must be the owner.
    """
    updated_item = ItemService.update_item(db=db, item_id=item_id, item_update=item, current_user=current_user)
    if updated_item is None:
        raise HTTPException(status_code=404, detail="Item not found or you don't have permission to update it")
    return updated_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: UserInfo = Depends(get_current_user)
):
    """
    Delete an item.

    This endpoint requires authentication and the current user must be the owner.
    """
    success = ItemService.delete_item(db=db, item_id=item_id, current_user=current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found or you don't have permission to delete it")
    return None


@router.get("/admin/all", response_model=List[Item])
async def read_all_items_admin(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        _: bool = Depends(has_role(["admin"]))
):
    """
    Get all items (admin only).

    This endpoint requires authentication and the admin role.
    """
    items = ItemService.get_items(db, skip=skip, limit=limit)
    return items
