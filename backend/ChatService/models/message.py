from datetime import datetime, UTC
from typing import Optional
from beanie import Document
from pydantic import Field
from uuid import UUID, uuid4
from enum import Enum


def utc_now():
    return datetime.now(tz=UTC)


class MessageStatus(str, Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"


class Message(Document):
    id: UUID = Field(default_factory=uuid4)
    chat_id: UUID
    creator_id: UUID
    content: str = Field(min_length=1, max_length=500)
    ttl: int | None = Field(default=None, gt=0)  # Time to live in seconds
    status: MessageStatus = Field(default=MessageStatus.SENT)
    timestamp: datetime = Field(default_factory=utc_now)

    class Settings:
        bson_encoders = {UUID: str}
        keep_nulls = False
