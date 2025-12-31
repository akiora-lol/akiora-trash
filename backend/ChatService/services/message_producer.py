import logging
from faststream.rabbit import RabbitBroker, RabbitExchange, RabbitQueue, ExchangeType

from config.settings import Settings
from schemas.events import ProcessedMessageEvent, ProcessedChatEvent


logger = logging.getLogger(__name__)


class MessageProducer:
    """Продюсер для публикации обработанных сообщений в RabbitMQ."""

    def __init__(self, broker: RabbitBroker, settings: Settings):
        self.broker = broker
        self.settings = settings

        self.exchange = RabbitExchange(
            name=settings.rabbitmq_exchange_name,
            type=ExchangeType.DIRECT,
            durable=settings.rabbitmq_exchange_durable,
        )

    async def publish_processed_message(self, message: ProcessedMessageEvent) -> None:
        """Публикует обработанное сообщение."""
        try:
            await self.broker.publish(
                message=message,
                exchange=self.exchange,
                routing_key=self.settings.rabbitmq_output_routing_key,
            )

            logger.info(
                f"Published processed message {message.message_id} "
                f"to exchange {self.settings.rabbitmq_exchange_name} "
                f"with routing key {self.settings.rabbitmq_output_routing_key}"
            )

        except Exception as e:
            logger.error(
                f"Failed to publish message {message.message_id}: {str(e)}",
                exc_info=True,
            )
            raise

    async def publish_processed_chat(self, chat: ProcessedChatEvent) -> None:
        """Публикует обработанное событие чата."""
        try:
            await self.broker.publish(
                message=chat,
                exchange=self.exchange,
                routing_key=self.settings.rabbitmq_output_routing_key,
            )

            logger.info(
                f"Published processed chat {chat.chat_id} "
                f"to exchange {self.settings.rabbitmq_exchange_name} "
                f"with routing key {self.settings.rabbitmq_output_routing_key}"
            )

        except Exception as e:
            logger.error(
                f"Failed to publish chat {chat.chat_id}: {str(e)}",
                exc_info=True,
            )
            raise
