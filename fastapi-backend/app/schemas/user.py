from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, ConfigDict
from pydantic.alias_generators import to_camel


class UserInfo(BaseModel):
    """
    Schema representing a user from Keycloak.

    This schema contains user information extracted from
    the Keycloak userinfo endpoint or token claims.
    """
    sub: str  # Keycloak user ID
    email: EmailStr | None = None
    email_verified: bool | None = None
    preferred_username: str | None = None
    name: str | None = None
    given_name: str | None = None
    family_name: str | None = None
    locale: str | None = None
    realm_access: dict[str, list[str]] | None = None  # Roles
    resource_access: dict[str, dict[str, list[str]]] | None = None  # Client roles

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )


class UserCreate(BaseModel):
    """Schema for creating a new user in the application database."""
    id: str  # Keycloak user ID (sub)
    username: str
    email: EmailStr | None = None
    company: str | None = None
    position: str | None = None
    phone: str | None = None
    address: str | None = None
    profile_data: dict[str, Any] | None = None


class UserUpdate(BaseModel):
    """Schema for updating an existing user in the application database."""
    username: str | None = None
    email: EmailStr | None = None
    company: str | None = None
    position: str | None = None
    phone: str | None = None
    address: str | None = None
    profile_data: dict[str, Any] | None = None


class UserVO(BaseModel):
    """Schema representing a user in the application database."""
    id: str
    username: str
    email: str | None = None
    company: str | None = None
    position: str | None = None
    phone: str | None = None
    address: str | None = None
    profile_data: dict[str, Any] | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True
    )


class TokenData(BaseModel):
    """
    Schema for decoded JWT token data.

    This schema is used internally for token validation
    and extracting user information.
    """
    sub: str | None = None
    exp: int | None = None
    iat: int | None = None
    jti: str | None = None
    iss: str | None = None
    aud: list[str] | None = None
    typ: str | None = None
    azp: str | None = None
    scope: str | None = None
    email: str | None = None
    preferred_username: str | None = None
    realm_access: dict[str, list[str]] | None = None
    resource_access: dict[str, dict[str, list[str]]] | None = None

    @property
    def roles(self) -> list[str]:
        """
        Extract all realm roles from the token.

        Returns:
            List of role names.
        """
        if self.realm_access and "roles" in self.realm_access:
            return self.realm_access["roles"]
        return []

    def has_role(self, role: str) -> bool:
        """
        Check if the user has a specific realm role.

        Args:
            role: The role name to check.

        Returns:
            True if the user has the role, False otherwise.
        """
        return role in self.roles

    def has_client_role(self, client_id: str, role: str) -> bool:
        """
        Check if the user has a specific client role.

        Args:
            client_id: The client ID to check roles for.
            role: The role name to check.

        Returns:
            True if the user has the client role, False otherwise.
        """
        if (self.resource_access and
                client_id in self.resource_access and
                "roles" in self.resource_access[client_id]):
            return role in self.resource_access[client_id]["roles"]
        return False
