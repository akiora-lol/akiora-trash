from typing import AsyncIterator

from dishka import Provider, Scope, make_async_container, provide
from redis.asyncio import Redis

from shared.src.services.redis import RedisService
from shared.src.services.redis_manager import RedisManager
from shared.src.settings import Settings

settings = Settings()  # pyright: ignore


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()  # pyright: ignore


class InfraProvider(Provider):
    @provide(scope=Scope.APP)
    def get_redis_manager(self, settings: Settings) -> AsyncIterator[RedisManager]:
        manager = RedisManager(settings)
        async with manager.managed() as m:
            yield m

    @provide(scope=Scope.REQUEST)
    async def get_redis_client(self, rm: RedisManager) -> AsyncIterator[Redis]:
        async with rm.get_client_context() as client:
            yield client

    @provide(scope=Scope.REQUEST)
    def get_redis_service(self, redis_client: Redis, st: Settings) -> RedisService:
        return RedisService(redis_client, st.redis_ttl)


container = make_async_container(ConfigProvider(), InfraProvider())
