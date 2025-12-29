import json
import aio_pika
from typing import Optional
from aio_pika.abc import AbstractRobustConnection, AbstractRobustChannel

from app.schemas import OrderMessage


class RabbitMQProducer:
    def __init__(
        self,
        connection: AbstractRobustConnection,
        exchange_name: str = "orders_exchange",
        queue_name: str = "orders_queue",
    ):
        self.connection = connection
        self.exchange_name = exchange_name
        self.queue_name = queue_name
        self.channel: Optional[AbstractRobustChannel] = None
        self.exchange: Optional[aio_pika.Exchange] = None

    async def connect(self):
        if not self.channel or self.channel.is_closed:
            self.channel = await self.connection.channel()
            self.exchange = await self.channel.declare_exchange(
                self.exchange_name, aio_pika.ExchangeType.DIRECT, durable=True
            )
            queue = await self.channel.declare_queue(self.queue_name, durable=True)
            await queue.bind(self.exchange, self.queue_name)

    async def send_message(self, message: OrderMessage) -> None:
        await self.connect()
        message_body = json.dumps(message.model_dump()).encode()
        await self.exchange.publish(
            aio_pika.Message(
                body=message_body, delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key=self.queue_name,
        )
