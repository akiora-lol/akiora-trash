from redis.asyncio import Redis
from typing import TypeVar
import msgspec
from loguru import logger

T = TypeVar("T", bound=msgspec.Struct)


class RedisService:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.ttl = 30 * 60
        logger.debug("RedisService initialized with TTL={ttl}", ttl=self.ttl)

    async def create(
        self, prefix: str, key: str, value: dict | msgspec.Struct, ttl: int = 0
    ):
        if ttl == 0:
            ttl = self.ttl
        data = msgspec.msgpack.encode(value)
        await self.redis.setex(f"{prefix}{key}", ttl, data)
        logger.debug(
            "Created Redis key={key} with prefix={prefix} and TTL={ttl}",
            key=key,
            prefix=prefix,
            ttl=ttl,
        )

    async def get(
        self, pattern: str, object_type: type[T] | None = None
    ) -> dict | T | None:
        data_raw = await self.redis.get(pattern)
        if data_raw:
            if object_type:
                data = msgspec.msgpack.decode(data_raw, type=object_type)
                logger.debug(
                    "Retrieved Redis key={key} as {type}",
                    key=pattern,
                    type=object_type.__name__,
                )
                return data
            data = msgspec.msgpack.decode(data_raw)
            logger.debug("Retrieved Redis key={key} as dict", key=pattern)
            return data
        logger.debug("Redis key={key} not found", key=pattern)
        return None

    async def delete(self, pattern: str):
        await self.redis.delete(pattern)
        logger.debug("Deleted Redis key={key}", key=pattern)
