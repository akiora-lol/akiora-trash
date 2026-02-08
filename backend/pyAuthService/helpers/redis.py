from config.settings import settings
from typing import Optional


import redis.asyncio as redis
from redis.asyncio.client import Redis


redis_client: Optional[Redis] = None


async def connect_redis():
    global redis_client
    redis_client = redis.from_url(
        settings.redis_url, encoding="utf-8", decode_responses=True
    )

    await redis_client.ping()


async def disconnect_redis():
    global redis_client
    if redis_client:
        await redis_client.close()


def get_redis_client() -> Redis:
    global redis_client
    if redis_client is None:
        raise Exception("Redis client not initialized")
    return redis_client
