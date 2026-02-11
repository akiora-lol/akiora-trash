from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import Chat, Message
import logging
from config import settings
from .redis import connect_redis, disconnect_redis
from .broker import connect_broker, disconnect_broker

logger = logging.getLogger(__name__)


async def api_on_startup():
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

    try:
        await connect_broker()
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}", exc_info=True)
        raise

    try:
        await connect_redis()
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}", exc_info=True)
        raise


async def api_on_shutdown():
    try:
        await disconnect_redis()
    except Exception as e:
        logger.error(f"Failed to disconnect  Redis: {e}", exc_info=True)
        raise

    try:
        await disconnect_broker()
    except Exception as e:
        logger.error(f"Failed to disconnect  Redis: {e}", exc_info=True)
        raise


async def consumer_on_startup():
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

    try:
        await connect_redis()
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}", exc_info=True)
        raise


async def consumer_on_shutdown():
    try:
        await disconnect_redis()
    except Exception as e:
        logger.error(f"Failed to disconnect  Redis: {e}", exc_info=True)
        raise
