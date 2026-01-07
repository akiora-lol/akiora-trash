import logging
from faststream.rabbit import RabbitBroker
from config.settings import Settings
from schemas import ProcessedMessageEvent
import messaging

logger = logging.getLogger(__name__)


class MessageProducer:
    def __init__(self, broker: RabbitBroker, settings: Settings):
        self.broker = broker
        self.settings = settings

        self.exchange = messaging.ws_exchange

    async def publish_processed_message(self, message: ProcessedMessageEvent) -> None:
        try:
            await self.broker.publish(
                message=message,
                exchange=self.exchange,
                routing_key=self.settings.rabbit_settings.output_routing_key,
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
