import msgspec
from datetime import datetime
from typing import Optional

from .base import BaseMessage, MessageType


class ChatMessage(BaseMessage, tag="chat.message"):
    """Сообщение чата от клиента"""

    type: MessageType = MessageType.CHAT_MESSAGE
    room_id: str
    content: str
    metadata: Optional[dict] = None


class ChatResponse(BaseMessage, tag="chat.response"):
    """Ответ сервера на сообщение чата"""

    type: MessageType = MessageType.CHAT_RESPONSE
    room_id: str
    message_id: str
    status: str  # "sent", "delivered", "failed"
    content: Optional[str] = None
    error: Optional[str] = None


class ChatTyping(BaseMessage, tag="chat.typing"):
    """Индикатор набора текста"""

    type: MessageType = MessageType.CHAT_TYPING
    room_id: str
    is_typing: bool
