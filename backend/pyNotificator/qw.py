import asyncio
import aioredis
import json
from typing import Dict, Set, Optional
import logging
from dataclasses import dataclass
from datetime import datetime
import weakref

from fastapi import WebSocket


@dataclass
class ChannelStats:
    subscribers_count: int
    last_message_at: datetime
    message_count: int


class EnterpriseWebSocketPubSub:
    def __init__(self, redis_url: str = "redis://localhost"):
        self.redis_url = redis_url
        self._channels: Dict[str, Set[WebSocket]] = {}
        self._stats: Dict[str, ChannelStats] = {}
        self._logger = logging.getLogger(__name__)

        # Connection pooling
        self._redis_pool = None
        self._pubsub_connections: Dict[str, aioredis.client.PubSub] = {}

        # Message queue for batching
        self._message_queue: asyncio.Queue = asyncio.Queue()
        self._batch_size = 100
        self._batch_interval = 0.1  # seconds

    async def start(self):
        """Инициализация соединений и воркеров"""
        self._redis_pool = await aioredis.create_redis_pool(
            self.redis_url, minsize=5, maxsize=20
        )

        # Запуск batch обработчика сообщений
        asyncio.create_task(self._batch_message_processor())

    async def _batch_message_processor(self):
        """Пакетная обработка сообщений для Redis"""
        while True:
            batch = []
            try:
                # Собираем батч сообщений
                while len(batch) < self._batch_size:
                    try:
                        message = await asyncio.wait_for(
                            self._message_queue.get(), timeout=self._batch_interval
                        )
                        batch.append(message)
                    except asyncio.TimeoutError:
                        break

                if batch:
                    # Групповая публикация в Redis
                    pipe = self._redis_pool.pipeline()
                    for channel, data in batch:
                        pipe.publish(channel, json.dumps(data))
                    await pipe.execute()

            except Exception as e:
                self._logger.error(f"Batch processing error: {e}")

    async def subscribe(self, channel: str, websocket: WebSocket):
        """Подписка с мониторингом"""
        if channel not in self._channels:
            self._channels[channel] = weakref.WeakSet()
            # Создаем отдельный PubSub клиент для канала
            pubsub = self._redis_pool.pubsub()
            await pubsub.subscribe(channel)
            self._pubsub_connections[channel] = pubsub

            # Запускаем слушатель для канала
            asyncio.create_task(self._channel_listener(channel, pubsub))

            # Инициализируем статистику
            self._stats[channel] = ChannelStats(
                subscribers_count=0, last_message_at=datetime.now(), message_count=0
            )

        self._channels[channel].add(websocket)
        self._stats[channel].subscribers_count += 1

    async def _channel_listener(self, channel: str, pubsub):
        """Изолированный слушатель для каждого канала"""
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    # Обновляем статистику
                    self._stats[channel].last_message_at = datetime.now()
                    self._stats[channel].message_count += 1

                    # Отправляем подписчикам
                    await self._broadcast(channel, message["data"])
        except Exception as e:
            self._logger.error(f"Listener error for {channel}: {e}")

    async def _broadcast(self, channel: str, data: bytes):
        """Безопасная широковещательная рассылка"""
        if channel not in self._channels:
            return

        disconnected = []
        for websocket in self._channels[channel]:
            try:
                await websocket.send_bytes(data)  # Отправляем как bytes для скорости
            except:
                disconnected.append(websocket)

        # Очистка отключенных соединений
        for websocket in disconnected:
            await self._cleanup_websocket(websocket, channel)

    async def publish(self, channel: str, data: dict):
        """Асинхронная публикация через очередь"""
        await self._message_queue.put((channel, data))

    async def get_stats(self) -> Dict:
        """Получение статистики"""
        return {
            channel: {
                "subscribers": stats.subscribers_count,
                "last_message": stats.last_message_at.isoformat(),
                "message_count": stats.message_count,
            }
            for channel, stats in self._stats.items()
        }
