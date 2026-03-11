# services/providers.py

from typing import AsyncIterator
from dishka import Provider, Scope, make_async_container, provide
from services.redis_manager import RedisManager
from redis.asyncio import Redis
from faststream.redis import RedisBroker
from opgg import OPGG
from settings import Settings
from services.opgg_service import OpggService

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.asynchronous.database import AsyncDatabase
from dishka.integrations.fastapi import (
    FastapiProvider,
)

from services.redis import RedisService


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()


class ServiceProvider(Provider):
    scope = Scope.APP

    @provide(scope=Scope.APP)
    async def get_opgg(self) -> OPGG:

        return OPGG()

    @provide(scope=Scope.REQUEST)
    async def get_opgg_service(self, opgg: OPGG) -> OpggService:

        return OpggService(opgg=opgg)

    @provide(scope=Scope.APP)
    async def get_redis_broker(self, settings: Settings) -> RedisBroker:
        broker = RedisBroker(url=settings.redis_url, max_connections=20)
        await broker.connect()
        return broker

    @provide(scope=Scope.APP)
    async def get_mongo_client(self, settings: Settings) -> AsyncIOMotorClient:
        return AsyncIOMotorClient(settings.mongodb_url)

    @provide(scope=Scope.APP)
    async def get_mongo_db(
        self, settings: Settings, client: AsyncIOMotorClient
    ) -> AsyncDatabase:

        return client[settings.mongodb_db_name]

    @provide(scope=Scope.APP)
    def get_redis_manager(self, settings: Settings) -> RedisManager:
        return RedisManager(settings)

    @provide(scope=Scope.REQUEST)
    async def get_redis_client(self, rm: RedisManager) -> AsyncIterator[Redis]:
        async with rm.get_client_context() as client:
            yield client

    @provide(scope=Scope.REQUEST)
    def get_redis_service(self, redis_client: Redis) -> RedisService:
        return RedisService(redis_client)


container = make_async_container(
    ServiceProvider(),
    ConfigProvider(),
    FastapiProvider(),
)
