from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routes import discord_router, yandex_router
from helpers import api_on_shutdown, api_on_startup, get_rabbit_broker


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):

    await api_on_startup()
    yield
    await api_on_shutdown()


app = FastAPI(root_path="/auth", lifespan=lifespan)


origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(discord_router)
app.include_router(yandex_router)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, proxy_headers=True)
