"""Structured logging configuration."""

import logging
import sys

from app.core.config import Settings


def configure_logging(settings: Settings) -> None:
    """Configure root logger once at application startup."""
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    # Reduce noise from third-party libraries in development
    if settings.is_development:
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("sqlalchemy.engine").setLevel(
            logging.INFO if settings.db_echo else logging.WARNING
        )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
