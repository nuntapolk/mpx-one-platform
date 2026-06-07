from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """MPX-ONE AI Service configuration."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Service
    APP_NAME: str = "MPX-ONE AI Service"
    APP_VERSION: str = "0.1.0"
    PORT: int = 8000
    ENV: str = "development"

    # Database (read-only role recommended)
    DATABASE_URL: str = "postgresql://mpx:mpxsecret@localhost:5432/mpx_one"

    # NestJS Core API — for writing back results (single source of truth)
    CORE_API_URL: str = "http://localhost:4000"

    # Service-to-service auth (shared secret with NestJS)
    INTERNAL_TOKEN: str = "change-me-in-production"

    # Keycloak (for verifying user JWTs forwarded from frontend, Phase 2)
    KEYCLOAK_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "mpx-one"

    # Embedding model (Phase 2)
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-small"
    EMBEDDING_DIM: int = 384


settings = Settings()
