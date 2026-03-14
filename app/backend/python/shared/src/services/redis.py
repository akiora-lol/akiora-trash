from typing import TypeVar, overload

import msgspec
from redis.asyncio import Redis

from ..errors import RedisError

T = TypeVar("T", bound=msgspec.Struct | dict)


class RedisService:
    def __init__(
        self,
        redis_client: Redis,
        ttl: int = 0,
    ):
        self.redis = redis_client
        self.ttl = ttl if ttl != 0 else 30 * 60

    async def create(
        self,
        key: str,
        value: dict,
        ttl: int = 0,
        encoder: msgspec.msgpack.Encoder | None = None,
    ):
        if ttl == 0:
            ttl = self.ttl

        if not encoder:
            data = msgspec.msgpack.encode(value)
        else:
            data = encoder.encode(value)

        await self.redis.setex(key, ttl, data)

    @overload
    async def get(self, key: str, decoder: msgspec.msgpack.Decoder[T]) -> T: ...

    @overload
    async def get(self, key: str, decoder: None) -> dict: ...

    async def get(
        self,
        key: str,
        decoder: msgspec.msgpack.Decoder[T] | None = None,
    ) -> T:
        data_raw = await self.redis.get(key)
        if not data_raw:
            raise RedisError("Value doesnt exist for this key")

        if not decoder:
            return msgspec.msgpack.decode(data_raw)

        return decoder.decode(data_raw)

    async def delete(self, pattern: str):
        await self.redis.delete(pattern)
