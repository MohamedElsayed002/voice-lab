from functools import lru_cache
from pathlib import Path
from typing import Optional
from urllib.parse import urlsplit

from pydantic_settings import BaseSettings, SettingsConfigDict

SERVER_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = SERVER_DIR.parent


class Settings(BaseSettings):

    APP_NAME: str = "Voice Lab"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    DATABASE_URL: str
    DATABASE_URL_UNPOOLED: Optional[str] = None
    NEON_BRANCH: Optional[str] = None

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int

    NEON_AUTH_BASE_URL: str
    NEON_AUTH_JWKS_URL: str

    CORS_ORIGINS: str = "http://localhost:3000"
    BUCKET_NAME: str 
    AWS_REGION: str 
    BEDROCK_MODEL_ID: str 

    OPENAI_API_KEY: str

    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None

    IDEMPOTENCY_KEY_TTL_HOURS: float = 0.25

    # Read from .env 
    model_config = SettingsConfigDict(
        env_file=(SERVER_DIR / ".env", PROJECT_ROOT / ".env.local"),
        case_sensitive=True,
    )

    # Computer helpers
    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def neon_auth_issuer(self) -> str:
        auth_origin_parts = urlsplit(self.NEON_AUTH_BASE_URL)
        if not auth_origin_parts.scheme or not auth_origin_parts.netloc:
            raise ValueError("NEON_AUTH_BASE_URL must be an absolute URL")

        return f"{auth_origin_parts.scheme}://{auth_origin_parts.netloc}"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()