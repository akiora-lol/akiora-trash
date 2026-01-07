from config import settings
from faststream.rabbit import RabbitExchange, RabbitQueue, ExchangeType


chat_exchange = RabbitExchange(
    name=settings.rabbit_settings.exchange_name,
    type=ExchangeType(settings.rabbit_settings.exchange_type),
    durable=settings.rabbit_settings.exchange_durable,
)

chat_queue = RabbitQueue(
    name=settings.rabbit_settings.chat_input_queue,
    durable=settings.rabbit_settings.chat_input_queue_durable,
    routing_key=settings.rabbit_settings.chat_input_routing_key,
)

message_queue = RabbitQueue(
    name=settings.rabbit_settings.message_input_queue,
    durable=settings.rabbit_settings.message_input_queue_durable,
    routing_key=settings.rabbit_settings.message_input_routing_key,
)

ws_exchange = RabbitExchange(
    name=settings.rabbit_settings.output_exchange_name,
    type=ExchangeType(settings.rabbit_settings.output_exchange_type),
    durable=settings.rabbit_settings.output_exchange_durable,
)
