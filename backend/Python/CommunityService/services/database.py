from beanie import init_beanie
from ioc import container
from pymongo.asynchronous.database import AsyncDatabase
from models.user import User
from loguru import logger


async def connect_db():
    logger.info("Connecting to database...")
    db = await container.get(AsyncDatabase)
    await init_beanie(database=db, document_models=[User])
    logger.info("Database connection established with Beanie initialized")
