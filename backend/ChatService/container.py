from dishka.integrations.faststream import (
    FromDishka,
    inject,
    setup_dishka,
    FastStreamProvider,
)
from dishka import make_async_container, Provider, provide, Scope
import aio_pika
from typing import AsyncIterable

from repos.chat_repo import ChatRepo
from services.rabbit_producer import OrderService
from services.rabbit_producer import RabbitMQProducer


class RabbitMQProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_rabbitmq_connection(
        self,
    ) -> AsyncIterable[aio_pika.abc.AbstractRobustConnection]:
        connection = await aio_pika.connect_robust("amqp://guest:guest@localhost:5672/")
        yield connection
        await connection.close()

    @provide(scope=Scope.APP)
    async def get_message_producer(
        self,
        connection: aio_pika.abc.AbstractRobustConnection,
    ) -> RabbitMQProducer:
        return RabbitMQProducer(connection)


class ServiceProvider(Provider):
    @provide(scope=Scope.REQUEST)
    async def get_order_service(
        self,
        message_producer: RabbitMQProducer,
    ) -> OrderService:
        return OrderService(message_producer)


class ChatRepoProvider(Provider):
    @provide(scope=Scope.REQUEST)
    async def get_chat_repo(self) -> ChatRepo:
        return ChatRepo()


def create_providers():
    return [
        RabbitMQProvider(),
        ServiceProvider(),
    ]


container = make_async_container(*create_providers())
