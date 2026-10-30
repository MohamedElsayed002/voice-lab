from sqlalchemy.engine import URL, make_url
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import settings


def build_async_database_url(database_url: str) -> tuple[URL, dict[str, str]]:
    url = make_url(database_url)
    if url.drivername in {"postgres", "postgresql"}:
        url = url.set(drivername="postgresql+asyncpg")
    elif url.drivername != "postgresql+asyncpg":
        raise ValueError("DATABASE_URL must use PostgreSQL with asyncpg")

    query = dict(url.query)
    sslmode = query.pop("sslmode", "require")
    query.pop("channel_binding", None)
    if sslmode not in {"require", "verify-ca", "verify-full"}:
        raise ValueError("DATABASE_URL must require TLS")

    return url.set(query=query), {"ssl": sslmode}


database_url, connect_args = build_async_database_url(settings.DATABASE_URL)
engine = create_async_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)
session_factory = async_sessionmaker(engine, expire_on_commit=False)
