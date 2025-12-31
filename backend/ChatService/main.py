import logging

from faststream import FastStream
from faststream.rabbit import RabbitBroker
from dishka.integrations.faststream import setup_dishka
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from container import create_container
from config.settings import settings
from routes import message_router, chat_router
from models.chat import Chat
from models.message import Message


# Настройка логирования
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Создаем брокер
broker = RabbitBroker(url=settings.rabbitmq_url)

# Подключаем роутеры с обработчиками
broker.include_router(message_router)
broker.include_router(chat_router)

# Создаем приложение FastStream
app = FastStream(broker)

# Настраиваем Dishka контейнер
container = create_container()
setup_dishka(container, app)


@app.on_startup
async def on_startup():
    """Обработчик события запуска приложения."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")

    # Инициализация MongoDB и Beanie
    try:
        client = AsyncIOMotorClient(settings.mongodb_url)
        await init_beanie(
            database=client[settings.mongodb_db_name], document_models=[Chat, Message]
        )
        logger.info(f"Connected to MongoDB at {settings.mongodb_url}")
        logger.info(f"Database: {settings.mongodb_db_name}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}", exc_info=True)
        raise

    logger.info(
        f"Connected to RabbitMQ at {settings.rabbitmq_host}:{settings.rabbitmq_port}"
    )
    logger.info(f"Exchange: {settings.rabbitmq_exchange_name}")
    logger.info(f"Message input queue: {settings.rabbitmq_input_queue}")
    logger.info(f"Chat input queue: {settings.rabbitmq_chat_input_queue}")
    logger.info(f"Output queue: {settings.rabbitmq_output_queue}")
    logger.info(
        "Supported message events: message.create, message.update, message.delete"
    )
    logger.info("Supported chat events: chat.instance.create")


@app.on_shutdown
async def on_shutdown():
    """Обработчик события остановки приложения."""
    logger.info(f"Shutting down {settings.app_name}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(app.run())
