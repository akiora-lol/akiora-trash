from contextlib import asynccontextmanager
from typing import AsyncIterator, Optional

import redis.asyncio as redis

from ..settings import Settings


class RedisManager:
    def __init__(self, settings: Settings):
        self.pool: Optional[redis.ConnectionPool] = None
        self._max_connections = 50
        self.settings = settings

    async def connect(self):

        self.pool = redis.ConnectionPool.from_url(
            self.settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=self._max_connections,
            health_check_interval=30,
            retry_on_timeout=True,
        )

        client = await self.get_client()

        await client.close()

    async def disconnect(self):

        if self.pool:
            await self.pool.disconnect()

    async def get_client(self) -> redis.Redis:

        if not self.pool:
            await self.connect()
        return redis.Redis(connection_pool=self.pool)

    @asynccontextmanager
    async def get_client_context(self):

        client = await self.get_client()
        try:
            yield client
        finally:
            await client.close()

    @asynccontextmanager
    async def managed(self) -> AsyncIterator["RedisManager"]:

        try:
            await self.connect()
            yield self
        finally:
            await self.disconnect()
