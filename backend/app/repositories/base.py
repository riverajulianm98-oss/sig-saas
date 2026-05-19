"""Repository interface base — implementations live in infrastructure."""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

from app.infrastructure.models.base import BaseModel

T = TypeVar("T", bound=BaseModel)


class AbstractRepository(ABC, Generic[T]):
    """Generic repository contract for Clean Architecture."""

    def __init__(self, session: Session) -> None:
        self._session = session

    @abstractmethod
    def get_by_id(self, entity_id: UUID) -> T | None:
        raise NotImplementedError
