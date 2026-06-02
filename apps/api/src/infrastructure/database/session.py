"""
Async SQLAlchemy session factory and dependency provider.

Module:    src.infrastructure.database.session
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.config import settings

_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

_AsyncSessionFactory = async_sessionmaker(
    bind=_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session for use as a FastAPI dependency.

    The session is committed on success and rolled back on any exception.
    It is always closed at the end of the request lifecycle.

    Yields:
        An :class:`~sqlalchemy.ext.asyncio.AsyncSession` bound to the
        connection pool.

    Raises:
        Exception: Re-raises any exception after rolling back the session.

    Example:
        >>> @router.get("/example")
        ... async def handler(db: AsyncSession = Depends(get_db_session)):
        ...     ...
    """
    async with _AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
