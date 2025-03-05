import logging
from typing import List, Dict, Any

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.config import settings
from app.schemas.user import UserInfo

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme for extracting the JWT from Authorization header
oauth2_scheme = HTTPBearer(auto_error=True)


def get_token_from_request(
        credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
) -> str:
    """
    Extract the JWT token from the Authorization header.

    Args:
        credentials: The HTTP Authorization credentials.

    Returns:
        The JWT token string.
    """
    return credentials.credentials


async def validate_token(token: str) -> Dict[str, Any]:
    """
    Validate the token by introspection against Keycloak.

    This uses Keycloak's token introspection endpoint to validate
    the token and get its associated metadata.

    Args:
        token: The JWT token to validate.

    Returns:
        The token introspection response.

    Raises:
        HTTPException: If the token is invalid or expired.
    """
    # Prepare the introspection request
    introspection_endpoint = settings.get_keycloak_introspection_endpoint()

    # Client credentials for token introspection
    client_auth = (settings.KEYCLOAK_CLIENT_ID, settings.KEYCLOAK_CLIENT_SECRET)

    # Make the introspection request
    response = requests.post(
        introspection_endpoint,
        data={"token": token, "token_type_hint": "access_token"},
        auth=client_auth
    )

    # Check if the request was successful
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to validate token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Parse the response
    token_data = response.json()

    # Check if the token is active
    if not token_data.get("active", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is inactive or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return token_data


async def get_current_user(
        token: str = Depends(get_token_from_request)
) -> UserInfo:
    """
    Get the current user from the validated token.

    This function validates the token using Keycloak's token
    introspection endpoint and extracts user information.

    Args:
        token: The JWT token from the Authorization header.

    Returns:
        The user information extracted from the token.

    Raises:
        HTTPException: If the token is invalid or the user cannot be authenticated.
    """
    try:
        # Validate the token through introspection
        token_data = await validate_token(token)

        # Extract user information
        user_info = UserInfo(
            sub=token_data.get("sub", ""),
            email=token_data.get("email"),
            email_verified=token_data.get("email_verified"),
            preferred_username=token_data.get("preferred_username"),
            name=token_data.get("name"),
            given_name=token_data.get("given_name"),
            family_name=token_data.get("family_name"),
            locale=token_data.get("locale"),
            realm_access=token_data.get("realm_access"),
            resource_access=token_data.get("resource_access"),
        )

        return user_info

    except (JWTError, HTTPException) as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def has_role(required_roles: List[str], require_all: bool = False):
    """
    Dependency for requiring specific roles.

    This creates a dependency that checks if the current user
    has the specified role(s).

    Args:
        required_roles: The list of roles required for access.
        require_all: If True, the user must have all specified roles.
                    If False, having any one role is sufficient.

    Returns:
        A dependency function that validates the user has the required roles.
    """

    async def _has_role(token: str = Depends(get_token_from_request)) -> bool:
        # Validate the token and get token data
        token_data = await validate_token(token)

        # Extract realm roles
        realm_access = token_data.get("realm_access", {})
        user_roles = realm_access.get("roles", [])

        # Check roles
        if require_all:
            has_required_roles = all(role in user_roles for role in required_roles)
        else:
            has_required_roles = any(role in user_roles for role in required_roles)

        if not has_required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return True

    return _has_role


def has_client_role(client_id: str, required_roles: List[str], require_all: bool = False):
    """
    Dependency for requiring specific client roles.

    This creates a dependency that checks if the current user
    has the specified client role(s).

    Args:
        client_id: The client ID to check roles for.
        required_roles: The list of client roles required for access.
        require_all: If True, the user must have all specified roles.
                    If False, having any one role is sufficient.

    Returns:
        A dependency function that validates the user has the required client roles.
    """

    async def _has_client_role(token: str = Depends(get_token_from_request)) -> bool:
        # Validate the token and get token data
        token_data = await validate_token(token)

        # Extract client roles
        resource_access = token_data.get("resource_access", {})
        client_resource = resource_access.get(client_id, {})
        user_client_roles = client_resource.get("roles", [])

        # Check roles
        if require_all:
            has_required_roles = all(role in user_client_roles for role in required_roles)
        else:
            has_required_roles = any(role in user_client_roles for role in required_roles)

        if not has_required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient client permissions for {client_id}",
            )

        return True

    return _has_client_role
