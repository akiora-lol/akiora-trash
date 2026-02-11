from pydantic import BaseModel, Field
from datetime import datetime, UTC
from typing import Literal
from uuid import UUID


def utc_now():
    return datetime.now(tz=UTC)


class CreateMessage(BaseModel):
    body: str = Field(...)
    receiver_id: UUID = Field(...)
    receiver_type: Literal["user", "chat"]
    ttl: int | None = None
    spoiler: bool = Field(default=False)


class UpdateMessage(BaseModel):
    msg_id: UUID = Field(...)
    body: str = Field(...)
