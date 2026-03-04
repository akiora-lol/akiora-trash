import msgspec
from typing import Optional

from .base import BaseMessage, MessageType


class InfoRequest(BaseMessage, tag="info.request"):
    """Запрос информации от клиента"""

    type: MessageType = MessageType.INFO_REQUEST
    action: str
    payload: Optional[dict] = None


class InfoResponse(BaseMessage, tag="info.response"):
    """Ответ с информацией от сервера"""

    type: MessageType = MessageType.INFO_RESPONSE
    action: str
    status: str  # "success", "error"
    data: Optional[dict] = None
    error: Optional[str] = None
    correlation_id: str
