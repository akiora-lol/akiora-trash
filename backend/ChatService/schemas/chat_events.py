from pydantic import BaseModel, Field
from datetime import datetime, UTC
from typing import Literal, List
from enum import Enum
from uuid import UUID


def utc_now():
    return datetime.now(tz=UTC)


class EventType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    READ = "read"
    DELETE = "delete"


def empty_uuid():
    return str(UUID(int=0))


class CreateChatEvent(BaseModel):
    event_type: Literal[EventType.CREATE] = EventType.CREATE
    creator_id: str = Field(
        default_factory=empty_uuid, description="User ID who creates the chat"
    )
    title: str = Field(..., description="Chat title", min_length=1, max_length=100)
    chat_type: Literal["public", "private"] = Field(
        default="public", description="Chat type"
    )
    allowed_users: List[str] = Field(
        default_factory=list, description="List of allowed user IDs for private chats"
    )
    timestamp: datetime = Field(default_factory=utc_now, description="Event timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "create",
                "creator_id": "550e8400-e29b-41d4-a716-446655440001",
                "title": "Private Discussion",
                "chat_type": "private",
                "allowed_users": [
                    "550e8400-e29b-41d4-a716-446655440002",
                    "550e8400-e29b-41d4-a716-446655440003",
                ],
                "timestamp": "2025-12-31T10:00:00Z",
            }
        }


class ProcessedChatEvent(BaseModel):
    """Событие обработанного чата (output queue)."""

    chat_id: str = Field(..., description="Created chat ID")
    event_type: EventType = Field(..., description="Type of event processed")
    creator_id: str = Field(..., description="User ID who created the chat")
    title: str = Field(..., description="Chat title")
    chat_type: Literal["public", "private"] = Field(..., description="Chat type")
    allowed_users: List[str] = Field(
        default_factory=list, description="List of allowed users"
    )
    original_timestamp: datetime = Field(..., description="Original event timestamp")
    processed_at: datetime = Field(
        default_factory=utc_now, description="Processing timestamp"
    )
    status: str = Field(default="success", description="Processing status")

    class Config:
        json_schema_extra = {
            "example": {
                "chat_id": "550e8400-e29b-41d4-a716-446655440010",
                "event_type": "create",
                "creator_id": "550e8400-e29b-41d4-a716-446655440001",
                "title": "Private Discussion",
                "chat_type": "private",
                "allowed_users": [
                    "550e8400-e29b-41d4-a716-446655440002",
                    "550e8400-e29b-41d4-a716-446655440003",
                ],
                "original_timestamp": "2025-12-31T10:00:00Z",
                "processed_at": "2025-12-31T10:00:01Z",
                "status": "success",
            }
        }
