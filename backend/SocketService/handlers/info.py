from loguru import logger
from typing import Any

from .base import MessageHandler
from ..schemas.info import InfoRequest, InfoResponse
from ..schemas.base import MessageType


class InfoMessageHandler(MessageHandler):
    """
    Обработчик информационных запросов.
    Обрабатывает запросы на получение информации (статус, профиль, настройки и т.д.).
    """

    async def handle(self) -> dict:
        """
        Обработка информационного запроса.
        
        Логика:
        1. Парсинг запроса
        2. Определение действия (action)
        3. Выполнение соответствующего обработчика
        4. Возврат результата
        """
        logger.info(f"Обработка info запроса от пользователя {self.user_id}")

        try:
            # Парсим как InfoRequest
            import msgspec
            data = msgspec.json.decode(self.message_data)
            info_request: InfoRequest = msgspec.convert(data, InfoRequest)

            logger.debug(f"Info запрос: action={info_request.action}")

            # Обработка в зависимости от действия
            result = await self._process_action(info_request.action, info_request.payload)

            response = InfoResponse(
                action=info_request.action,
                status="success" if result is not None else "error",
                data=result,
                correlation_id=info_request.correlation_id or "",
            )

            logger.info(f"Info запрос обработан: action={info_request.action}")

            return msgspec.to_builtins(response)

        except Exception as e:
            logger.exception(f"Ошибка обработки info запроса: {e}")
            return {
                "type": MessageType.INFO_RESPONSE.value,
                "action": "unknown",
                "status": "error",
                "error": str(e),
            }

    async def _process_action(self, action: str, payload: dict | None) -> dict[str, Any] | None:
        """
        Обработка конкретного действия.
        
        Args:
            action: Название действия
            payload: Данные запроса
            
        Returns:
            Результат выполнения или None при ошибке
        """
        match action:
            case "status":
                return await self._handle_status()
            case "profile":
                return await self._handle_profile(payload)
            case "settings":
                return await self._handle_settings()
            case "ping":
                return {"pong": True, "timestamp": __import__("datetime").datetime.utcnow().isoformat()}
            case _:
                logger.warning(f"Неизвестное действие: {action}")
                return None

    async def _handle_status(self) -> dict:
        """Обработка запроса статуса"""
        return {
            "status": "online",
            "user_id": self.user_id,
            "server_time": __import__("datetime").datetime.utcnow().isoformat(),
        }

    async def _handle_profile(self, payload: dict | None) -> dict | None:
        """Обработка запроса профиля"""
        # Здесь должен быть вызов сервиса профилей
        # return await profile_service.get_profile(self.user_id)
        logger.debug(f"Запрос профиля для {self.user_id}")
        return {"user_id": self.user_id, "name": "Unknown"}

    async def _handle_settings(self) -> dict:
        """Обработка запроса настроек"""
        # Здесь должен быть вызов сервиса настроек
        return {
            "notifications": True,
            "theme": "dark",
            "language": "ru",
        }
