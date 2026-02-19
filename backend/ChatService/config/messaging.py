# from config import settings
from faststream.rabbit import RabbitExchange, RabbitQueue, ExchangeType


chat_exchange = RabbitExchange(
    name="chat.events.topic",
    type=ExchangeType.TOPIC,
    durable=True,
)

form_exchange = RabbitExchange(
    name="form.events.topic",
    type=ExchangeType.TOPIC,
    durable=True,
)

user_exchange = RabbitExchange(
    name="user.events.topic",
    type=ExchangeType.TOPIC,
    durable=True,
)


user_queue = RabbitQueue(
    name="chat.user.queue", durable=True, routing_key="user.created.*"
)

form_queue = RabbitQueue(
    name="chat.form.queue", durable=True, routing_key="form.matched.*"
)

