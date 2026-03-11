from msgspec import Struct
from datetime import datetime
from typing import Optional

from schemas.base import BaseMessage, MessageType


class ChatMessage(Struct):
    """Сообщение чата от клиента"""

    room_id: str
    content: str
    type: MessageType = MessageType.CHAT_MESSAGE
    metadata: Optional[dict] = None


class ChatResponse(Struct):
    """Ответ сервера на сообщение чата"""

    room_id: str
    message_id: str
    status: str  # "sent", "delivered", "failed"
    type: MessageType = MessageType.CHAT_TYPING
    content: Optional[str] = None
    error: Optional[str] = None


class ChatTyping(Struct):
    """Индикатор набора текста"""

    room_id: str
    is_typing: bool
    type: MessageType = MessageType.CHAT_TYPING
