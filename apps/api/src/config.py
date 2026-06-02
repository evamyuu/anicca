"""
Application configuration loaded from environment variables and .env file.

Module:    src.config
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings resolved from environment variables.

    All fields map to environment variable names of the same casing.
    Sensitive defaults (e.g. ``SECRET_KEY``) MUST be overridden in production.

    Attributes:
        ENVIRONMENT: Deployment environment identifier (``development``, ``staging``,
            ``production``).
        SECRET_KEY: JWT signing secret. Override in production.
        ALLOWED_ORIGINS: List of allowed CORS origins.
        DATABASE_URL: PostgreSQL connection URL with the asyncpg driver.
        REDIS_URL: Redis connection URL used for session and context caching.
        WHATSMIAU_TOKEN: Bearer token for the Whatsmiau Cloud API.
        WHATSMIAU_INSTANCE_ID: WhatsApp instance identifier on Whatsmiau.
        WHATSMIAU_WEBHOOK_SECRET: HMAC-SHA256 secret for webhook signature verification.
        WHATSMIAU_API_BASE: Whatsmiau Cloud API base URL.
        GEMINI_API_KEY: API key for Google Gemini.
        AWS_ACCESS_KEY_ID: AWS IAM access key for S3 and Textract.
        AWS_SECRET_ACCESS_KEY: AWS IAM secret key.
        AWS_REGION: AWS region for all services.
        AWS_S3_BUCKET: S3 bucket name for medical document storage.
        NEO4J_URI: Neo4j Bolt URI for the oncology knowledge graph (Phase 5).
        NEO4J_USERNAME: Neo4j database username.
        NEO4J_PASSWORD: Neo4j database password.
        PSEUDONYMIZATION_SALT: Salt used for LGPD pseudonymization hashing.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8081"]

    DATABASE_URL: str = "postgresql+asyncpg://anicca:anicca@localhost:5432/anicca_dev"
    REDIS_URL: str = "redis://localhost:6379"

    WHATSMIAU_TOKEN: str = ""
    WHATSMIAU_INSTANCE_ID: str = ""
    WHATSMIAU_WEBHOOK_SECRET: str = ""
    WHATSMIAU_API_BASE: str = "https://api.whatsmiau.dev"

    GEMINI_API_KEY: str = ""

    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "sa-east-1"
    AWS_S3_BUCKET: str = "anicca-documents-dev"

    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USERNAME: str = "neo4j"
    NEO4J_PASSWORD: str = ""

    PSEUDONYMIZATION_SALT: str = "change-me-in-production"


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings singleton.

    Returns:
        The :class:`Settings` instance, constructed once and cached.
    """
    return Settings()


settings = get_settings()
