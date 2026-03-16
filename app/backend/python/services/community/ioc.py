from typing import AsyncIterator

from dishka import Provider, Scope, make_async_container, provide
from motor.motor_asyncio import AsyncIOMotorDatabase

from shared import MongoManager, MongoCommand, MongoQuery
from shared.settings import Settings
from services.user_command import UserCommandService
from services.user_query import UserQueryService

settings = Settings()  # pyright: ignore


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()  # pyright: ignore


class InfraProvider(Provider):
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


class CollectionProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_user_command(
        self, db: AsyncIOMotorDatabase
    ) -> MongoCommand:
        return MongoCommand(db=db, collection_name="users")

    @provide(scope=Scope.REQUEST)
    def get_user_query(
        self, db: AsyncIOMotorDatabase
    ) -> MongoQuery:
        return MongoQuery(db=db, collection_name="users")


class ServiceProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_user_command_service(
        self, command: MongoCommand
    ) -> UserCommandService:
        return UserCommandService(command)

    @provide(scope=Scope.REQUEST)
    def get_user_query_service(
        self, query: MongoQuery
    ) -> UserQueryService:
        return UserQueryService(query)


container = make_async_container(
    ConfigProvider(), InfraProvider(), CollectionProvider(), ServiceProvider()
)
