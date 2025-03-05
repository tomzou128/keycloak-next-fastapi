from app.models.database import Base
from sqlalchemy import Column, Integer, String, Text


class Item(Base):
    """
    SQLAlchemy model for items.

    This is a sample model to demonstrate protected resources.
    """
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(String(255), index=True)  # Keycloak user ID

    def __repr__(self):
        return f"<Item(id={self.id}, title={self.title}, owner_id={self.owner_id})>"
