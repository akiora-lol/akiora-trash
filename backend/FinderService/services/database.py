from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from loguru import logger

from settings import settings
from models.hot_form import HotForm
from models.cold_form import ColdForm


async def connect_db():
    logger.info("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.mongodb_db_name],
        document_models=[HotForm, ColdForm],
    )
    logger.info("Beanie initialized with HotForm and ColdForm documents")
