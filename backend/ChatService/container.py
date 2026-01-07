from dishka import Provider, provide, Scope, make_async_container
from typing import AsyncIterable
import logging

from faststream.rabbit import RabbitBroker

from config.settings import Settings, settings
from repos.chat_repo import ChatRepo
from repos.message_repo import MessageRepo
from services.message_producer import MessageProducer
from services.chat_service import ChatService
from services.message_service import MessageService


# Провайдер для конфигурации
class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return settings


class BrokerProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_rabbit_broker(
        self,
        settings: Settings,
    ) -> AsyncIterable[RabbitBroker]:
        broker = RabbitBroker(
            url=settings.rabbitmq_url,
            logger=logging.getLogger("faststream.rabbit"),
        )

        await broker.start()
        yield broker
        await broker.stop()


class ServiceProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_message_producer(
        self,
        broker: RabbitBroker,
        settings: Settings,
    ) -> MessageProducer:
        return MessageProducer(broker=broker, settings=settings)

    @provide(scope=Scope.REQUEST)
    def get_chat_service(
        self,
        chat_repo: ChatRepo,
    ) -> ChatService:
        """Создает сервис для работы с чатами."""
        return ChatService(chat_repo=chat_repo)

    @provide(scope=Scope.REQUEST)
    def get_message_service(
        self,
        message_repo: MessageRepo,
        chat_service: ChatService,
    ) -> MessageService:
        """Создает сервис для работы с сообщениями."""
        return MessageService(message_repo=message_repo, chat_service=chat_service)


class RepositoryProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_chat_repo(self) -> ChatRepo:
        """Создает репозиторий для работы с чатами."""
        return ChatRepo()

    @provide(scope=Scope.REQUEST)
    def get_message_repo(self) -> MessageRepo:
        """Создает репозиторий для работы с сообщениями."""
        return MessageRepo()


def create_providers():
    """Создает список всех провайдеров для Dishka контейнера."""
    return [
        ConfigProvider(),
        BrokerProvider(),
        ServiceProvider(),
        RepositoryProvider(),
    ]


def create_container():
    return make_async_container(*create_providers())
