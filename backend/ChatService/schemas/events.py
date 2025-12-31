from pydantic import BaseModel, Field
from datetime import datetime, UTC
from typing import Optional, Literal, List
from enum import Enum
from uuid import UUID


def utc_now():
    return datetime.now(tz=UTC)


class MessageEventType(str, Enum):
    """Типы событий для сообщений."""

    CREATE = "message.create"
    UPDATE = "message.update"
    DELETE = "message.delete"


class ChatEventType(str, Enum):
    """Типы событий для чатов."""

    CREATE = "chat.instance.create"


class BaseMessageEvent(BaseModel):
    """Базовое событие для сообщений."""

    event_type: MessageEventType
    user_id: str = Field(..., description="User ID who triggered the event")
    chat_id: str = Field(..., description="Chat ID where event occurred")
    timestamp: datetime = Field(default_factory=utc_now, description="Event timestamp")


class CreateMessageEvent(BaseMessageEvent):
    """Событие создания нового сообщения."""

    event_type: Literal[MessageEventType.CREATE] = MessageEventType.CREATE
    message_body: str = Field(..., description="Message content", min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "message.create",
                "user_id": "user_123",
                "chat_id": "chat_456",
                "message_body": "Hello, world!",
                "timestamp": "2025-12-31T10:30:00Z",
            }
        }


class UpdateMessageEvent(BaseMessageEvent):
    """Событие обновления существующего сообщения."""

    event_type: Literal[MessageEventType.UPDATE] = MessageEventType.UPDATE
    message_id: str = Field(..., description="ID of the message to update")
    new_message_body: str = Field(..., description="New message content", min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "message.update",
                "user_id": "user_123",
                "chat_id": "chat_456",
                "message_id": "msg_789",
                "new_message_body": "Updated message text",
                "timestamp": "2025-12-31T10:35:00Z",
            }
        }


class DeleteMessageEvent(BaseMessageEvent):
    """Событие удаления сообщения."""

    event_type: Literal[MessageEventType.DELETE] = MessageEventType.DELETE
    message_id: str = Field(..., description="ID of the message to delete")

    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "message.delete",
                "user_id": "user_123",
                "chat_id": "chat_456",
                "message_id": "msg_789",
                "timestamp": "2025-12-31T10:40:00Z",
            }
        }


class ProcessedMessageEvent(BaseModel):
    """Событие обработанного сообщения (output queue)."""

    message_id: str = Field(..., description="Unique message ID")
    event_type: MessageEventType = Field(..., description="Type of event processed")
    user_id: str = Field(..., description="User ID who triggered the event")
    chat_id: str = Field(..., description="Chat ID where event occurred")
    message_body: Optional[str] = Field(
        None, description="Message content (for create/update)"
    )
    original_timestamp: datetime = Field(..., description="Original event timestamp")
    processed_at: datetime = Field(
        default_factory=datetime.utcnow, description="Processing timestamp"
    )
    status: str = Field(default="success", description="Processing status")

    class Config:
        json_schema_extra = {
            "example": {
                "message_id": "msg_789",
                "event_type": "message.create",
                "user_id": "user_123",
                "chat_id": "chat_456",
                "message_body": "Hello, world!",
                "original_timestamp": "2025-12-31T10:30:00Z",
                "processed_at": "2025-12-31T10:30:01Z",
                "status": "success",
            }
        }


# ============================================
# Chat Events
# ============================================


def empty_uuid():
    return str(UUID(int=0))


class CreateChatEvent(BaseModel):
    """Событие создания нового чата."""

    event_type: Literal[ChatEventType.CREATE] = ChatEventType.CREATE
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
                "event_type": "chat.instance.create",
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
    event_type: ChatEventType = Field(..., description="Type of event processed")
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
                "event_type": "chat.instance.create",
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
