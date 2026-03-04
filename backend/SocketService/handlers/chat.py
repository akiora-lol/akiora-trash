from loguru import logger
import uuid
from datetime import datetime

from .base import MessageHandler
from ..schemas.chat import ChatMessage, ChatResponse
from ..schemas.base import MessageType


class ChatMessageHandler(MessageHandler):
    """
    Обработчик сообщений чата.
    Обрабатывает входящие сообщения и возвращает подтверждение.
    """

    async def handle(self) -> dict:
        """
        Обработка сообщения чата.
        
        Логика:
        1. Парсинг сообщения
        2. Валидация данных
        3. Сохранение в БД (через внешний сервис)
        4. Отправка в Redis для других участников
        5. Возврат подтверждения
        """
        logger.info(f"Обработка сообщения чата от пользователя {self.user_id}")

        try:
            # Парсим как ChatMessage
            chat_message: ChatMessage = await self.parse()  # type: ignore
            if chat_message is None:
                # Пробуем распарсить вручную
                import msgspec
                data = msgspec.json.decode(self.message_data)
                chat_message = msgspec.convert(data, ChatMessage)

            logger.debug(
                f"Сообщение чата: room={chat_message.room_id}, "
                f"content_length={len(chat_message.content)}"
            )

            # Генерируем ID сообщения
            message_id = str(uuid.uuid4())

            # Здесь должна быть логика сохранения и отправки
            # Например:
            # - await chat_repository.save(chat_message, user_id=self.user_id)
            # - await redis_broker.publish(f"chat.{chat_message.room_id}", chat_message)

            response = ChatResponse(
                room_id=chat_message.room_id,
                message_id=message_id,
                status="sent",
                content=chat_message.content,
                correlation_id=chat_message.correlation_id,
            )

            logger.info(f"Сообщение чата обработано: message_id={message_id}")

            return msgspec.to_builtins(response)

        except Exception as e:
            logger.exception(f"Ошибка обработки сообщения чата: {e}")
            return {
                "type": MessageType.CHAT_RESPONSE.value,
                "status": "failed",
                "error": str(e),
            }
