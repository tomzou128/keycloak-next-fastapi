from typing import List

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserInfo


class UserService:
    """Service for managing users."""

    @staticmethod
    def get_user(db: Session, user_id: str) -> User | None:
        """
        Get a user by ID.

        Args:
            db: Database session.
            user_id: The user ID (Keycloak sub).

        Returns:
            The user if found, None otherwise.
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> User | None:
        """
        Get a user by username.

        Args:
            db: Database session.
            username: The username.

        Returns:
            The user if found, None otherwise.
        """
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        """
        Get a user by email.

        Args:
            db: Database session.
            email: The email address.

        Returns:
            The user if found, None otherwise.
        """
        if not email:
            return None
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Get all users.

        Args:
            db: Database session.
            skip: Number of records to skip.
            limit: Maximum number of records to return.

        Returns:
            List of users.
        """
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        """
        Create a new user.

        Args:
            db: Database session.
            user: The user data.

        Returns:
            The created user.
        """
        db_user = User(
            id=user.id,
            username=user.username,
            email=user.email,
            company=user.company,
            position=user.position,
            phone=user.phone,
            address=user.address,
            profile_data=user.profile_data,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def update_user(db: Session, user_id: str, user_update: UserUpdate) -> User | None:
        """
        Update a user.

        Args:
            db: Database session.
            user_id: The user ID (Keycloak sub).
            user_update: The updated user data.

        Returns:
            The updated user if found, None otherwise.
        """
        db_user = UserService.get_user(db, user_id)

        if db_user is None:
            return None

        # Update fields if provided
        update_data = user_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def sync_user(db: Session, keycloak_user_info: UserInfo) -> User:
        """
        Synchronize a user from Keycloak.

        This creates or updates a user based on Keycloak information.
        It ensures that the application database is in sync with Keycloak.

        Args:
            db: Database session.
            keycloak_user_info: User information from Keycloak.

        Returns:
            The synchronized user.
        """
        # Check if user exists
        db_user = UserService.get_user(db, keycloak_user_info.sub)

        if db_user:
            # Update existing user with Keycloak data
            update_data = UserUpdate(
                username=keycloak_user_info.preferred_username,
                email=keycloak_user_info.email,
            )
            return UserService.update_user(db, keycloak_user_info.sub, update_data)
        else:
            # Create new user from Keycloak data
            user_data = UserCreate(
                id=keycloak_user_info.sub,
                username=keycloak_user_info.preferred_username or "unknown",
                email=keycloak_user_info.email,
            )
            return UserService.create_user(db, user_data)
