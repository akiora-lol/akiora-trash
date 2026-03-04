import redis.asyncio as redis
from typing import Optional
from contextlib import asynccontextmanager
from settings import Settings
from loguru import logger


class RedisManager:
    def __init__(self, settings: Settings):
        self.pool: Optional[redis.ConnectionPool] = None
        self._max_connections = 20
        self.settings = settings
        logger.debug(
            "RedisManager initialized with max_connections={max_conn}",
            max_conn=self._max_connections,
        )

    async def connect(self):
        logger.info("Connecting to Redis...")
        self.pool = redis.ConnectionPool.from_url(
            self.settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=self._max_connections,
            health_check_interval=30,
            retry_on_timeout=True,
        )

        client = await self.get_client()
        await client.ping()
        await client.close()
        logger.info("Redis connection established successfully")

    async def disconnect(self):
        logger.info("Disconnecting from Redis...")
        if self.pool:
            await self.pool.disconnect()
            logger.info("Redis connection closed")

    async def get_client(self) -> redis.Redis:
        if not self.pool:
            logger.debug("Redis pool not initialized, connecting...")
            await self.connect()
        return redis.Redis(connection_pool=self.pool)

    @asynccontextmanager
    async def get_client_context(self):
        logger.debug("Acquiring Redis client context")
        client = await self.get_client()
        try:
            yield client
        finally:
            await client.close()
            logger.debug("Redis client context released")
