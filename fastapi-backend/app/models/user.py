from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.sql import func

from app.models.database import Base


class User(Base):
    """
    SQLAlchemy model for users.

    This model stores additional business information about users
    that is not stored in Keycloak. This allows us to maintain
    business-specific user data while keeping authentication in Keycloak.
    """
    __tablename__ = "users"

    id = Column(String(255), primary_key=True)  # Keycloak user ID (sub)
    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)

    # Business-specific fields
    company = Column(String(255), nullable=True)
    position = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)

    # Additional profile data (flexible schema)
    profile_data = Column(JSON, nullable=True)

    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"
