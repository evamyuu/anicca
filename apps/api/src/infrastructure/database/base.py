"""
SQLAlchemy declarative base and metadata for all ORM models.

Module:    src.infrastructure.database.base
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

from sqlalchemy.orm import DeclarativeBase, MappedColumn
from sqlalchemy import MetaData

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Declarative base for all Anicca SQLAlchemy ORM models.

    All models MUST inherit from this class. The naming convention ensures
    deterministic constraint names across Alembic migration revisions.
    """

    metadata = MetaData(naming_convention=NAMING_CONVENTION)
