from typing import AsyncIterator

from dishka import Provider, Scope, make_async_container, provide
from infra.services.user import UserCommandService, UserQueryService, UserRepo
from motor.motor_asyncio import AsyncIOMotorDatabase
from redis.asyncio import Redis
from shared.settings import Settings

from shared import MongoCommand, MongoManager, MongoQuery, RedisManager, RedisService

from .use_cases.user import UserUC

settings = Settings()  # pyright: ignore


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()  # pyright: ignore


class InfraProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_redis_manager(
        self, settings: Settings
    ) -> AsyncIterator[RedisManager]:
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

    @provide(scope=Scope.APP)
    async def get_mongo_manager(
        self, settings: Settings
    ) -> AsyncIterator[MongoManager]:
        manager = MongoManager(settings)
        async with manager.managed() as m:
            yield m

    @provide(scope=Scope.REQUEST)
    def get_mongo_db(self, manager: MongoManager) -> AsyncIOMotorDatabase:
        return manager.db

    @provide(scope=Scope.REQUEST)
    def get_user_repo(self, db: AsyncIOMotorDatabase, rs: RedisService) -> UserRepo:

        command = MongoCommand(db=db, collection_name="users")
        query = MongoQuery(db=db, collection_name="users")
        ucs = UserCommandService(command=command)
        uqs = UserQueryService(query=query)

        return UserRepo(cs=ucs, qs=uqs, rs=rs)


class ServiceProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_user_use_case(self, ur: UserRepo) -> UserUC:
        return UserUC(user_repo=ur)


container = make_async_container(ConfigProvider(), InfraProvider(), ServiceProvider())
