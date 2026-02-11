# from config import settings
from faststream.rabbit import RabbitExchange, RabbitQueue, ExchangeType


user_exchange = RabbitExchange(
    name="user.events.topic",
    type=ExchangeType.TOPIC,
    durable=True,
)

auth_exchange = RabbitExchange(
    name="auth.events.topic",
    type=ExchangeType.TOPIC,
    durable=True,
)


session_queue = RabbitQueue(
    name="user.session.queue", durable=True, routing_key="auth.session.*"
)
