# from config import settings
from faststream.rabbit import RabbitExchange, RabbitQueue, ExchangeType


auth_exchange = RabbitExchange(
    name="auth.events.topic",
    type=ExchangeType.TOPIC,
    durable=True,
)

# =======================================
user_exchange = RabbitExchange(
    name="user.events.topic",
    type=ExchangeType.TOPIC,
    durable=True,
)


auth_user_info_queue = RabbitQueue(
    name="auth.user.queue",
    durable=True,
    routing_key="user.info.*",
)
