from typing import Dict, Set, Optional, Any
from fastapi import WebSocket
from loguru import logger

from managers.storage import GlobalStorage


class ConnectionManager:
    """
    SESSION-scoped менеджер для работы с WebSocket соединениями.
    Управляет подключениями конкретного пользователя.
    """

    def __init__(self, storage: GlobalStorage, user_id: str):
        self._storage = storage
        self._user_id = user_id
        logger.info(f"ConnectionManager создан для пользователя {user_id}")

    @property
    def user_id(self) -> str:
        return self._user_id

    async def connect(self, websocket: WebSocket) -> None:
        """
        Принять WebSocket соединение и зарегистрировать его.

        Args:
            websocket: WebSocket соединение
        """
        await websocket.accept()
        await self._storage.add(self._user_id, websocket)
        logger.info(f"Пользователь {self._user_id} подключен к WebSocket")

    async def disconnect(self, websocket: WebSocket) -> None:
        """
        Закрыть WebSocket соединение и удалить его из хранилища.

        Args:
            websocket: WebSocket соединение
        """
        await self._storage.remove(self._user_id, websocket)
        logger.info(f"Пользователь {self._user_id} отключен от WebSocket")

    async def send(self, message: dict) -> int:
        """
        Отправить сообщение всем активным соединениям пользователя.

        Args:
            message: Сообщение для отправки

        Returns:
            Количество успешно отправленных сообщений
        """
        connections = await self._storage.get(self._user_id)
        if not connections:
            logger.warning(f"Нет активных соединений для пользователя {self._user_id}")
            return 0

        dead_connections: Set[WebSocket] = set()
        sent_count = 0

        for ws in connections:
            try:
                await ws.send_json(message)
                sent_count += 1
            except Exception as e:
                logger.warning(f"Ошибка отправки сообщения для {self._user_id}: {e}")
                dead_connections.add(ws)

        if dead_connections:
            for ws in dead_connections:
                await self._storage.remove(self._user_id, ws)
            logger.warning(
                f"Удалено {len(dead_connections)} неактивных соединений "
                f"для пользователя {self._user_id}"
            )

        logger.debug(f"Отправлено {sent_count} сообщений пользователю {self._user_id}")
        return sent_count

    async def send_to_user(self, user_id: str, message: dict) -> int:
        """
        Отправить сообщение конкретному пользователю.

        Args:
            user_id: Идентификатор пользователя
            message: Сообщение для отправки

        Returns:
            Количество успешно отправленных сообщений
        """
        connections = await self._storage.get(user_id)
        if not connections:
            logger.debug(f"Нет активных соединений для пользователя {user_id}")
            return 0

        dead_connections: Set[WebSocket] = set()
        sent_count = 0

        for ws in connections:
            try:
                await ws.send_json(message)
                sent_count += 1
            except Exception as e:
                logger.warning(f"Ошибка отправки сообщения для {user_id}: {e}")
                dead_connections.add(ws)

        if dead_connections:
            for ws in dead_connections:
                await self._storage.remove(user_id, ws)

        return sent_count

    async def broadcast(
        self, message: dict, exclude_users: Optional[Set[str]] = None
    ) -> int:
        """
        Рассылить сообщение всем подключенным пользователям.

        Args:
            message: Сообщение для отправки
            exclude_users: Множество user_id для исключения

        Returns:
            Количество успешно отправленных сообщений
        """
        exclude_users = exclude_users or set()
        all_users = await self._storage.get_all_users()
        target_users = all_users - exclude_users

        total_sent = 0
        for user_id in target_users:
            sent = await self.send_to_user(user_id, message)
            total_sent += sent

        logger.info(
            f"Broadcast отправлено {total_sent} сообщений {len(target_users)} пользователям"
        )
        return total_sent

    async def get_active_connections(self) -> int:
        """
        Получить количество активных соединений пользователя.

        Returns:
            Количество соединений
        """
        connections = await self._storage.get(self._user_id)
        return len(connections)
