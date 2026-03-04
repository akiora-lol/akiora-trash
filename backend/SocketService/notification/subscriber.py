from loguru import logger
from typing import Any, Dict

from ..managers.connection import ConnectionManager
from ..schemas.base import MessageType


class NotificationSubscriber:
    """
    Обработчик подписки на Redis pub/sub канал уведомлений.
    Получает сообщения из канала socket.notifications
    и рассылает их пользователям через WebSocket.
    """

    def __init__(self, connection_manager: ConnectionManager):
        self._connection_manager = connection_manager
        logger.info("NotificationSubscriber инициализирован")

    async def handle(self, message_data: Dict[str, Any]) -> None:
        """
        Обработка сообщения из канала уведомлений.
        
        Ожидается формат:
        {
            "user_id": str,              # ID пользователя (опционально)
            "notification_type": str,    # Тип уведомления
            "title": str,                # Заголовок
            "message": str,              # Текст уведомления
            "data": dict,                # Дополнительные данные (опционально)
            "correlation_id": str,       # ID корреляции (опционально)
        }
        
        Args:
            message_data: Данные сообщения из Redis pub/sub
        """
        try:
            logger.debug(f"Получено сообщение из канала уведомлений: {message_data}")

            user_id = message_data.get("user_id")
            notification_type = message_data.get("notification_type", "general")
            title = message_data.get("title", "Уведомление")
            message = message_data.get("message", "")
            data = message_data.get("data")
            correlation_id = message_data.get("correlation_id")

            response_message = {
                "type": MessageType.NOTIFICATION.value,
                "notification_type": notification_type,
                "title": title,
                "message": message,
                "data": data,
                "correlation_id": correlation_id,
            }

            if user_id:
                # Отправка конкретному пользователю
                sent_count = await self._connection_manager.send_to_user(
                    user_id, response_message
                )
                logger.info(
                    f"Уведомление отправлено пользователю {user_id}: "
                    f"{sent_count} соединений"
                )
            else:
                # Broadcast всем пользователям
                sent_count = await self._connection_manager.broadcast(
                    response_message
                )
                logger.info(
                    f"Уведомление разослано всем: {sent_count} сообщений"
                )

        except Exception as e:
            logger.exception(f"Ошибка обработки уведомления: {e}")
