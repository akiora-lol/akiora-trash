from faststream import FastStream
from faststream.redis import RedisBroker
from settings import settings, setup_logging
from routes import router
from dishka.integrations.faststream import setup_dishka
from services.database import connect_db
from ioc import container
from fast_depends.msgspec import MsgSpecSerializer
from loguru import logger

broker = RedisBroker(url=settings.redis_url, serializer=MsgSpecSerializer())
broker.include_router(router)
app = FastStream(broker)
setup_logging()


@app.on_startup
async def on_startup():
    logger.info("Starting CommunityService application...")
    await connect_db()
    logger.info("Database connection established")


@app.on_shutdown
async def on_shutdown():
    logger.info("Shutting down CommunityService application...")


setup_dishka(container=container, app=app, auto_inject=True)
if __name__ == "__main__":
    import asyncio

    asyncio.run(app.run())
