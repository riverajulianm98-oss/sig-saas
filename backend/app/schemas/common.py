"""Shared API response models."""

from pydantic import BaseModel, ConfigDict


class APIMessage(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    message: str
