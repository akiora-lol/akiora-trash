import logging


from faststream.rabbit import RabbitBroker


from config import settings


logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


broker: RabbitBroker | None = None


async def connect_broker():
    global broker
    broker = RabbitBroker(url=settings.rabbitmq_url)
    await broker.start()
    await broker.ping(timeout=5)


async def disconnect_broker():
    global broker
    await broker.stop()


def get_rabbit_broker() -> RabbitBroker:
    global broker
    if broker is None:
        raise Exception("Client not initialized")
    return broker
