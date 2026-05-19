"""SQLAlchemy declarative base — import all models here for Alembic autogenerate."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Root declarative base for all ORM models."""

    pass


# Import models so Alembic autogenerate detects metadata.
from app.infrastructure.models import Tenant, User  # noqa: F401, E402
