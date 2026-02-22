# services/providers.py


from dishka import Provider, Scope, make_async_container, provide


from faststream.redis import RedisBroker

from settings import Settings
from services.chat import ChatService
from repos.chat_repo import ChatRepo
from services.message import MessageService
from repos.message_repo import MessageRepo
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.asynchronous.database import AsyncDatabase
from dishka.integrations.fastapi import (
    FastapiProvider,
)
from services.session import SessionService


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()


class ServiceProvider(Provider):
    scope = Scope.APP

    @provide(scope=Scope.APP)
    async def get_redis_broker(self, settings: Settings) -> RedisBroker:
        broker = RedisBroker(
            url=settings.redis_url,
            max_connections=20,
        )
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

    @provide(scope=Scope.REQUEST)
    def get_session_service(self, redis_broker: RedisBroker) -> SessionService:
        return SessionService(redis_broker)

    @provide(scope=Scope.REQUEST)
    def get_chat_repo(self) -> ChatRepo:
        return ChatRepo()

    @provide(scope=Scope.REQUEST)
    def get_message_repo(self) -> MessageRepo:
        return MessageRepo()

    @provide(scope=Scope.REQUEST)
    def get_chat_service(self, cr: ChatRepo) -> ChatService:
        return ChatService(cr)

    @provide(scope=Scope.REQUEST)
    def get_message_service(self, cs: ChatService, mr: MessageRepo) -> MessageService:
        return MessageService(chat_service=cs, message_repo=mr)


container = make_async_container(
    ServiceProvider(),
    ConfigProvider(),
    FastapiProvider(),
)
