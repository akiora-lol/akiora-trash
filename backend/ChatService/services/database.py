from beanie import init_beanie
from ioc import container
from pymongo.asynchronous.database import AsyncDatabase
from models import Chat, Message


async def connect_db():
    db = await container.get(AsyncDatabase)
    await init_beanie(database=db, document_models=[Chat, Message])
