from sqlalchemy.orm import Session

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate
from app.schemas.user import UserInfo


class ItemService:
    """Service for managing items."""

    @staticmethod
    def get_items(db: Session, skip: int = 0, limit: int = 100) -> list[Item] | None:
        """
        Get all items.

        Args:
            db: Database session.
            skip: Number of records to skip.
            limit: Maximum number of records to return.

        Returns:
            List of items.
        """
        return db.query(Item).offset(skip).limit(limit).all()

    @staticmethod
    def get_item(db: Session, item_id: int) -> Item | None:
        """
        Get a specific item by ID.

        Args:
            db: Database session.
            item_id: The ID of the item to retrieve.

        Returns:
            The item if found, None otherwise.
        """
        return db.query(Item).filter(Item.id == item_id).first()

    @staticmethod
    def get_user_items(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[Item] | None:
        """
        Get all items owned by a specific user.

        Args:
            db: Database session.
            user_id: The user ID (Keycloak sub) of the owner.
            skip: Number of records to skip.
            limit: Maximum number of records to return.

        Returns:
            List of items owned by the user.
        """
        return db.query(Item).filter(Item.owner_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def create_item(db: Session, item: ItemCreate, owner_id: str) -> Item:
        """
        Create a new item.

        Args:
            db: Database session.
            item: The item data.
            owner_id: The user ID (Keycloak sub) of the owner.

        Returns:
            The created item.
        """
        db_item = Item(title=item.title, description=item.description, owner_id=owner_id)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def update_item(
            db: Session,
            item_id: int,
            item_update: ItemUpdate,
            current_user: UserInfo
    ) -> Item | None:
        """
        Update an item if the current user is the owner.

        Args:
            db: Database session.
            item_id: The ID of the item to update.
            item_update: The updated item data.
            current_user: The current authenticated user.

        Returns:
            The updated item if successful, None otherwise.
        """
        db_item = ItemService.get_item(db, item_id)

        if db_item is None:
            return None

        # Check if the current user is the owner
        if db_item.owner_id != current_user.sub:
            return None

        # Update the item
        if item_update.title is not None:
            db_item.title = item_update.title
        if item_update.description is not None:
            db_item.description = item_update.description

        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def delete_item(db: Session, item_id: int, current_user: UserInfo) -> bool:
        """
        Delete an item if the current user is the owner.

        Args:
            db: Database session.
            item_id: The ID of the item to delete.
            current_user: The current authenticated user.

        Returns:
            True if the item was deleted, False otherwise.
        """
        db_item = ItemService.get_item(db, item_id)

        if db_item is None:
            return False

        # Check if the current user is the owner
        if db_item.owner_id != current_user.sub:
            return False

        # Delete the item
        db.delete(db_item)
        db.commit()
        return True
