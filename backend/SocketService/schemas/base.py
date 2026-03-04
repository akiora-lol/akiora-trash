import msgspec
from enum import Enum
from datetime import datetime, UTC
from typing import Optional


class MessageType(str, Enum):
    CHAT_MESSAGE = "chat.message"
    CHAT_TYPING = "chat.typing"
    INFO_REQUEST = "info.request"
    INFO_RESPONSE = "info.response"
    NOTIFICATION = "notification"
    ERROR = "error"


def time_now():
    return datetime.now(UTC)


class BaseMessage(msgspec.Struct):
    """Базовая структура для всех сообщений"""

    type: MessageType

    correlation_id: str
