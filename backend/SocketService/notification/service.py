import msgspec
from loguru import logger
from typing import Dict, Set, Any, Optional
from datetime import datetime

from ..managers.connection import ConnectionManager
from ..schemas.base import MessageType


class NotificationMessage(msgspec.Struct):
    """Структура сообщения уведомления из Redis"""

    user_id: str
    notification_type: str
    title: str
    message: str
    data: Optional[dict] = None
    timestamp: datetime = msgspec.field(default_factory=datetime.utcnow)
    correlation_id: Optional[str] = None


class NotificationService:
    """
    Сервис для обработки уведомлений из Redis pub/sub.
    Получает уведомления из канала socket.notifications
    и рассылает их соответствующим пользователям через WebSocket.
    """

    def __init__(self, connection_manager: ConnectionManager):
        self._connection_manager = connection_manager
        logger.info("NotificationService инициализирован")

    async def handle_notification(self, message_data: dict) -> None:
        """
        Обработка входящего уведомления и отправка пользователю.
        
        Args:
            message_data: Данные уведомления из Redis pub/sub
        """
        try:
            notification = msgspec.convert(message_data, NotificationMessage)
            logger.debug(
                f"Получено уведомление для пользователя {notification.user_id}: "
                f"type={notification.notification_type}, title={notification.title}"
            )

            response_message = {
                "type": MessageType.NOTIFICATION.value,
                "notification_type": notification.notification_type,
                "title": notification.title,
                "message": notification.message,
                "data": notification.data,
                "timestamp": notification.timestamp.isoformat(),
                "correlation_id": notification.correlation_id,
            }

            await self._connection_manager.send_to_user(
                notification.user_id, response_message
            )

            logger.info(
                f"Уведомление отправлено пользователю {notification.user_id}"
            )

        except msgspec.ValidationError as e:
            logger.error(f"Ошибка валидации сообщения уведомления: {e}")
        except Exception as e:
            logger.exception(f"Ошибка при обработке уведомления: {e}")

    async def broadcast_notification(
        self, notification_type: str, title: str, message: str, 
        data: Optional[dict] = None, exclude_users: Optional[Set[str]] = None
    ) -> int:
        """
        Рассылка уведомления всем подключенным пользователям.
        
        Args:
            notification_type: Тип уведомления
            title: Заголовок уведомления
            message: Текст уведомления
            data: Дополнительные данные
            exclude_users: Множество user_id для исключения
            
        Returns:
            Количество отправленных уведомлений
        """
        notification = {
            "type": MessageType.NOTIFICATION.value,
            "notification_type": notification_type,
            "title": title,
            "message": message,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        }

        sent_count = await self._connection_manager.broadcast(
            notification, exclude_users=exclude_users
        )

        logger.info(f"Разослано {sent_count} уведомлений")
        return sent_count
