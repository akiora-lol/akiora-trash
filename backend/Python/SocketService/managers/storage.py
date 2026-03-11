import asyncio
from typing import Dict, Set
from fastapi import WebSocket
from loguru import logger


class GlobalStorage:
    """
    APP-scoped хранилище WebSocket соединений.
    Глобальное для всего приложения.
    """

    def __init__(self):
        self._connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()
        logger.info("GlobalStorage инициализирован")

    async def add(self, user_id: str, ws: WebSocket) -> None:
        """
        Добавить WebSocket соединение для пользователя.
        
        Args:
            user_id: Идентификатор пользователя
            ws: WebSocket соединение
        """
        async with self._lock:
            if user_id not in self._connections:
                self._connections[user_id] = set()
            self._connections[user_id].add(ws)
            logger.debug(f"Добавлено соединение для пользователя {user_id}. "
                        f"Всего соединений: {len(self._connections[user_id])}")

    async def remove(self, user_id: str, ws: WebSocket) -> None:
        """
        Удалить WebSocket соединение пользователя.
        
        Args:
            user_id: Идентификатор пользователя
            ws: WebSocket соединение
        """
        async with self._lock:
            if user_id in self._connections:
                self._connections[user_id].discard(ws)
                if not self._connections[user_id]:
                    del self._connections[user_id]
                    logger.debug(f"Пользователь {user_id} отключен (нет активных соединений)")
                else:
                    logger.debug(f"Удалено соединение для {user_id}. "
                                f"Осталось соединений: {len(self._connections[user_id])}")

    async def get(self, user_id: str) -> Set[WebSocket]:
        """
        Получить все WebSocket соединения пользователя.
        
        Args:
            user_id: Идентификатор пользователя
            
        Returns:
            Копия множества WebSocket соединений
        """
        async with self._lock:
            connections = self._connections.get(user_id, set()).copy()
            logger.debug(f"Получено {len(connections)} соединений для пользователя {user_id}")
            return connections

    async def get_all_users(self) -> Set[str]:
        """
        Получить идентификаторы всех подключенных пользователей.
        
        Returns:
            Множество user_id
        """
        async with self._lock:
            users = set(self._connections.keys())
            logger.debug(f"Всего подключенных пользователей: {len(users)}")
            return users

    async def get_all_connections(self) -> Dict[str, Set[WebSocket]]:
        """
        Получить все активные соединения.
        
        Returns:
            Словарь user_id -> Set[WebSocket]
        """
        async with self._lock:
            return {uid: conns.copy() for uid, conns in self._connections.items()}

    @property
    def total_connections(self) -> int:
        """Общее количество подключений"""
        return sum(len(conns) for conns in self._connections.values())
