from pydantic import BaseModel, Field
from datetime import datetime, UTC
from typing import Optional, Literal
from enum import Enum


def utc_now():
    return datetime.now(tz=UTC)


class EventType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    READ = "read"
    DELETE = "delete"


class BaseMessageEvent(BaseModel):
    event_type: EventType
    user_id: str = Field(..., description="User ID who triggered the event")
    chat_id: str = Field(..., description="Chat ID where event occurred")
    timestamp: datetime = Field(default_factory=utc_now, description="Event timestamp")


class CreateMessageEvent(BaseMessageEvent):
    event_type: Literal[EventType.CREATE] = EventType.CREATE
    message_body: str = Field(..., description="Message content", min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "create",
                "user_id": "user_123",
                "chat_id": "chat_456",
                "message_body": "Hello, world!",
                "timestamp": "2025-12-31T10:30:00Z",
            }
        }


class UpdateMessageEvent(BaseMessageEvent):
    event_type: Literal[EventType.UPDATE] = EventType.UPDATE
    message_id: str = Field(..., description="ID of the message to update")
    new_message_body: str = Field(..., description="New message content", min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "update",
                "user_id": "user_123",
                "chat_id": "chat_456",
                "message_id": "msg_789",
                "new_message_body": "Updated message text",
                "timestamp": "2025-12-31T10:35:00Z",
            }
        }


class DeleteMessageEvent(BaseMessageEvent):
    event_type: Literal[EventType.DELETE] = EventType.DELETE
    message_id: str = Field(..., description="ID of the message to delete")

    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "delete",
                "user_id": "user_123",
                "chat_id": "chat_456",
                "message_id": "msg_789",
                "timestamp": "2025-12-31T10:40:00Z",
            }
        }


class ProcessedMessageEvent(BaseModel):
    message_id: str = Field(..., description="Unique message ID")
    event_type: EventType = Field(..., description="Type of event processed")
    user_id: str = Field(..., description="User ID who triggered the event")
    chat_id: str = Field(..., description="Chat ID where event occurred")
    message_body: Optional[str] = Field(
        None, description="Message content (for create/update)"
    )
    original_timestamp: datetime = Field(..., description="Original event timestamp")
    processed_at: datetime = Field(
        default_factory=utc_now, description="Processing timestamp"
    )
    status: str = Field(default="success", description="Processing status")

    class Config:
        json_schema_extra = {
            "example": {
                "message_id": "msg_789",
                "event_type": "create",
                "user_id": "user_123",
                "chat_id": "chat_456",
                "message_body": "Hello, world!",
                "original_timestamp": "2025-12-31T10:30:00Z",
                "processed_at": "2025-12-31T10:30:01Z",
                "status": "success",
            }
        }
