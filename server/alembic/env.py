import asyncio
from logging.config import fileConfig
from urllib.parse import urlsplit

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.models import AuditLog, AuthAccount, AuthSession, Generation, User, Voice, OAuthExchangeCode

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = User.metadata


# python -m alembic upgrade head

def get_migration_url() -> tuple[str, dict[str, str]]:
    raw_url = settings.DATABASE_URL_UNPOOLED or settings.DATABASE_URL
    url = make_url(raw_url)
    if url.drivername in {"postgres", "postgresql"}:
        url = url.set(drivername="postgresql+asyncpg")
    elif url.drivername != "postgresql+asyncpg":
        raise ValueError("Alembic requires a PostgreSQL connection URL")

    hostname = urlsplit(str(url)).hostname or ""
    if "-pooler" in hostname:
        raise ValueError(
            "Alembic migrations require a direct connection; "
            "set DATABASE_URL_UNPOOLED"
        )

    query = dict(url.query)
    sslmode = query.pop("sslmode", "require")
    query.pop("channel_binding", None)
    if sslmode not in {"require", "verify-ca", "verify-full"}:
        raise ValueError("The migration database URL must require TLS")

    url = url.set(query=query)
    return url.render_as_string(hide_password=False), {"ssl": sslmode}


def run_migrations_offline() -> None:
    url, _ = get_migration_url()
    config.set_main_option("sqlalchemy.url", url.replace("%", "%%"))
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    url, connect_args = get_migration_url()
    config.set_main_option("sqlalchemy.url", url.replace("%", "%%"))

    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
