from msgspec import Struct
from typing import Optional

from schemas.base import BaseMessage, MessageType


class InfoRequest(Struct):
    """Запрос информации от клиента"""

    action: str
    type: MessageType = MessageType.INFO_REQUEST
    payload: Optional[dict] = None


class InfoResponse(Struct):
    """Ответ с информацией от сервера"""

    action: str
    correlation_id: str
    status: str  # "success", "error"
    type: MessageType = MessageType.INFO_RESPONSE
    data: Optional[dict] = None
    error: Optional[str] = None
