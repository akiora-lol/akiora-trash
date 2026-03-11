import msgspec
from abc import ABC, abstractmethod
from typing import Dict, Type, Any, Optional
from loguru import logger

from schemas.base import BaseMessage, MessageType


class MessageHandler(ABC):
    """
    REQUEST-scoped обработчик одного сообщения.
    Базовый класс для всех обработчиков сообщений.
    """

    def __init__(self, user_id: str, message_data: str):
        self._user_id = user_id
        self._message_data = message_data
        self._parsed_message: Optional[BaseMessage] = None

    @property
    def user_id(self) -> str:
        return self._user_id

    @property
    def message_data(self) -> str:
        return self._message_data

    async def parse(self) -> Optional[BaseMessage]:
        """
        Парсинг входящего сообщения.

        Returns:
            Распарсенное сообщение или None при ошибке
        """
        try:
            data = msgspec.json.decode(self._message_data)
            if isinstance(data, dict) and "type" in data:
                msg_type = data["type"]
                self._parsed_message = msgspec.json.decode(
                    self._message_data, type=BaseMessage
                )
                logger.debug(
                    f"Сообщение распарсено: type={msg_type}, user={self._user_id}"
                )
                return self._parsed_message
            else:
                logger.warning(
                    f"Некорректный формат сообщения от {self._user_id}: {data}"
                )
                return None
        except msgspec.ValidationError as e:
            logger.error(f"Ошибка валидации сообщения от {self._user_id}: {e}")
            return None
        except Exception as e:
            logger.exception(f"Ошибка парсинга сообщения от {self._user_id}: {e}")
            return None

    @abstractmethod
    async def handle(self) -> dict:
        """
        Обработка сообщения.

        Returns:
            Результат обработки
        """
        pass

    async def process(self) -> dict:
        """
        Основной метод обработки: парсинг + обработка.

        Returns:
            Результат обработки
        """
        logger.info(f"Начало обработки сообщения от пользователя {self._user_id}")

        parsed = await self.parse()
        if parsed is None:
            return {
                "type": MessageType.ERROR.value,
                "error": "Invalid message format",
                "status": "error",
            }

        try:
            result = await self.handle()
            logger.info(f"Обработка сообщения завершена для {self._user_id}")
            return result
        except Exception as e:
            logger.exception(f"Ошибка при обработке сообщения от {self._user_id}: {e}")
            return {"type": MessageType.ERROR.value, "error": str(e), "status": "error"}


class HandlerRegistry:
    """
    Реестр обработчиков сообщений по типам.
    APP-scoped синглтон.
    """

    def __init__(self):
        self._handlers: Dict[MessageType, Type[MessageHandler]] = {}
        logger.info("HandlerRegistry инициализирован")

    def register(
        self, message_type: MessageType, handler_class: Type[MessageHandler]
    ) -> None:
        """
        Зарегистрировать обработчик для типа сообщения.

        Args:
            message_type: Тип сообщения
            handler_class: Класс обработчика
        """
        self._handlers[message_type] = handler_class
        logger.debug(f"Зарегистрирован обработчик для {message_type.value}")

    def get_handler(self, message_type: MessageType) -> Optional[Type[MessageHandler]]:
        """
        Получить класс обработчика для типа сообщения.

        Args:
            message_type: Тип сообщения

        Returns:
            Класс обработчика или None
        """
        return self._handlers.get(message_type)

    @property
    def registered_types(self) -> list[MessageType]:
        """Список зарегистрированных типов сообщений"""
        return list(self._handlers.keys())
