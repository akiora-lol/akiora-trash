# from config import settings
from faststream.rabbit import RabbitExchange, RabbitQueue, ExchangeType


parse_exchange = RabbitExchange(
    name="parse-service-exchange",
    type=ExchangeType.DIRECT,
    durable=True,
)

avq = RabbitQueue(
    name="account-verification-queue",
    durable=True,
    routing_key="verify-lol-account",
    
)

aaq = RabbitQueue(
    name="account-actualization-queue",
    durable=True,
    routing_key="actualize-lol-account",
)
