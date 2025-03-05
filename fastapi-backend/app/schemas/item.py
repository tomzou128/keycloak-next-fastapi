from pydantic import BaseModel, Field


class ItemBase(BaseModel):
    """Base schema for item data validation."""

    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None


class ItemCreate(ItemBase):
    """Schema for creating a new item."""

    pass


class ItemUpdate(ItemBase):
    """Schema for updating an existing item."""

    title: str | None = Field(None, min_length=1, max_length=255)


class ItemInDB(ItemBase):
    """Schema representing an item in the database."""

    id: int
    owner_id: str

    class Config:
        from_attributes = True


class Item(ItemInDB):
    """Schema for public item data."""

    pass
