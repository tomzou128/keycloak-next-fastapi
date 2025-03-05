import json
import os

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings.

    All settings are read from environment variables.
    If not provided, default values are used.
    """
    # Base
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "FastAPI Keycloak Integration"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str

    # Keycloak
    KEYCLOAK_SERVER_URL: str
    KEYCLOAK_REALM: str
    KEYCLOAK_CLIENT_ID: str
    KEYCLOAK_CLIENT_SECRET: str

    # Token introspection endpoint
    KEYCLOAK_INTROSPECTION_ENDPOINT: str = "{server_url}/realms/{realm}/protocol/openid-connect/token/introspect"

    # Userinfo endpoint
    KEYCLOAK_USERINFO_ENDPOINT: str = "{server_url}/realms/{realm}/protocol/openid-connect/userinfo"

    # Keycloak admin API endpoints
    KEYCLOAK_ADMIN_URL: str = "{server_url}/admin/realms/{realm}"

    # Token settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    @field_validator("CORS_ORIGINS", mode='before')
    def parse_json(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    model_config = SettingsConfigDict(
        env_file=f".env.{os.getenv('ENVIRONMENT', 'development')}",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    def get_keycloak_introspection_endpoint(self) -> str:
        """Returns the full token introspection endpoint URL."""
        return self.KEYCLOAK_INTROSPECTION_ENDPOINT.format(
            server_url=self.KEYCLOAK_SERVER_URL,
            realm=self.KEYCLOAK_REALM
        )

    def get_keycloak_userinfo_endpoint(self) -> str:
        """Returns the full userinfo endpoint URL."""
        return self.KEYCLOAK_USERINFO_ENDPOINT.format(
            server_url=self.KEYCLOAK_SERVER_URL,
            realm=self.KEYCLOAK_REALM
        )

    def get_keycloak_admin_url(self) -> str:
        """Returns the base admin API URL."""
        return self.KEYCLOAK_ADMIN_URL.format(
            server_url=self.KEYCLOAK_SERVER_URL,
            realm=self.KEYCLOAK_REALM
        )


settings = Settings()
