from functools import lru_cache
from pathlib import Path
from typing import Optional
from urllib.parse import urlsplit

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AliasChoices, Field


SERVER_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = SERVER_DIR.parent


class Settings(BaseSettings):

    APP_NAME: str = "Voice Lab"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    tts_provider: str = Field(
        default="mock",
        validation_alias=AliasChoices("TTS_PROVIDER", "tts_provider"),
    )
    llm_provider: str = "mock"

    huggingface_token: str | None = Field(
        default=None, validation_alias=AliasChoices("HUGGINGFACE_TOKEN","HF_TOKEN")
    )

    huggingface_tts_model: str = "k2-fsa/OmniVoice"
    huggingface_device: str = "auto" # auto | cpu | cuda

    openai_tts_model: str = Field(
        default="gpt-4o-mini-tts",
        validation_alias=AliasChoices("OPENAI_TTS_MODEL", "openai_tts_model"),
    )
    openai_tts_voice: str = Field(
        default="coral",
        validation_alias=AliasChoices("OPENAI_TTS_VOICE", "openai_tts_voice"),
    )

    storage_dir: Path = Path("storage_data")

    # SQLite by default so the project runs with zero external services.
    # Point this at a Postgres URL later without touching any service code,
    # since all DB access goes through SQLAlchemy sessions.
    fake_database_url: str = "sqlite:///./voice_studio.db"

    voices_dir: Path = Path("voices_data")


    DATABASE_URL: str
    DATABASE_URL_UNPOOLED: Optional[str] = None
    NEON_BRANCH: Optional[str] = None

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int
    JWT_ISSUER: str
    JWT_AUDIENCE: str

    # NEON_AUTH_BASE_URL: str
    # NEON_AUTH_JWKS_URL: str

    CORS_ORIGINS: str = "http://localhost:3000"
    BUCKET_NAME: str 
    AWS_REGION: str 
    S3_ENDPOINT_URL: Optional[str] = None
    BEDROCK_MODEL_ID: str 

    OPENAI_API_KEY: str


    SESSION_SECRET_KEY: str
    FRONTEND_URL: str = "http://localhost:3000"
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None 
    GOOGLE_REDIRECT_URI: str = (
    "http://localhost:8000/auth/oauth/google/callback"
    )   

    GITHUB_CLIENT_ID: str | None = None
    GITHUB_CLIENT_SECRET: str | None = None 
    GITHUB_REDIRECT_URI: str = (
    "http://localhost:8000/auth/oauth/github/callback"
    )
    OAUTH_EXCHANGE_CODE_EXPIRE_SECONDS: int = 60

    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None

    IDEMPOTENCY_KEY_TTL_HOURS: float = 0.25

    # Read from .env 
    model_config = SettingsConfigDict(
        env_file=(SERVER_DIR / ".env", PROJECT_ROOT / ".env.local"),
        case_sensitive=True,
        extra="ignore",
        env_file_encoding="utf-8"
    )

    # Computer helpers
    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    # @property
    # def neon_auth_issuer(self) -> str:
    #     auth_origin_parts = urlsplit(self.NEON_AUTH_BASE_URL)
    #     if not auth_origin_parts.scheme or not auth_origin_parts.netloc:
    #         raise ValueError("NEON_AUTH_BASE_URL must be an absolute URL")

    #     return f"{auth_origin_parts.scheme}://{auth_origin_parts.netloc}"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
