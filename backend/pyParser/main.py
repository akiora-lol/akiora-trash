import asyncio
from faststream import FastStream
from faststream.rabbit import RabbitBroker
from config import settings
from routes import lol_route
from helpers.caching import connect_redis, disconnect_redis

broker = RabbitBroker(url=settings.rabbitmq_url)

broker.include_router(lol_route)


app = FastStream(broker)


@app.on_startup
async def init():
    print("init")

    await connect_redis()


@app.on_shutdown
async def shtdwn():
    await disconnect_redis()


if __name__ == "__main__":
    asyncio.run(app.run())
