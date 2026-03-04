import msgspec
from enum import Enum
from datetime import datetime
from typing import Optional


class MessageType(str, Enum):
    CHAT_MESSAGE = "chat.message"
    CHAT_TYPING = "chat.typing"
    INFO_REQUEST = "info.request"
    INFO_RESPONSE = "info.response"
    NOTIFICATION = "notification"
    ERROR = "error"


class BaseMessage(msgspec.Struct, tag_field="type", tag=True):
    """Базовая структура для всех сообщений"""

    type: MessageType
    timestamp: datetime = msgspec.field(default_factory=datetime.utcnow)
    correlation_id: Optional[str] = None
