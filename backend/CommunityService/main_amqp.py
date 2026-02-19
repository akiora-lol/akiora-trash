import logging
from faststream import FastStream
from faststream.rabbit import RabbitBroker
from config import settings
from channels.base import router
from utils import consumer_on_startup, consumer_on_shutdown


logger = logging.getLogger(__name__)
broker = RabbitBroker(url=settings.rabbitmq_url)
broker.include_router(router)
app = FastStream(broker)


@app.on_startup
async def on_startup():
    """Обработчик события запуска приложения."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    await consumer_on_startup()

    logger.info(
        f"Connected to RabbitMQ at {settings.rabbit_settings.host}:{settings.rabbit_settings.port}"
    )


@app.on_shutdown
async def on_shutdown():
    """Обработчик события остановки приложения."""
    logger.info(f"Shutting down {settings.app_name}")
    await consumer_on_shutdown()


if __name__ == "__main__":
    import asyncio

    asyncio.run(app.run())
