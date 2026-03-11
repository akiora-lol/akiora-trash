from pydantic import BaseModel, Field
from datetime import datetime, UTC
from typing import Literal
from uuid import UUID


def utc_now():
    return datetime.now(tz=UTC)


class CreateChat(BaseModel):
    owner_id: UUID
    owner_type: Literal["system", "club", "tournament"]
    type: Literal["private", "public"] | None = None
    status: Literal["active", "frozen"] | None = None
    allowed_users: list[UUID] | None = None


class UpdateChat(BaseModel):
    msg_id: UUID = Field(...)
    body: str = Field(...)
    timestamp: datetime = Field(default_factory=utc_now)
