from contextlib import asynccontextmanager
import logging
from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from fastapi.responses import RedirectResponse
from fastapi_sso.sso.discord import DiscordSSO
import uvicorn
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
from models.session_data import SessionData
from helpers.redis import connect_redis, disconnect_redis
from routes import discord_router, yandex_router
from services.user import get_shared_http_client

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_shared_http_client()
    try:
        client = AsyncIOMotorClient(settings.mongodb_url)
        await init_beanie(
            database=client[settings.mongodb_db_name], document_models=[SessionData]
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

    yield

    try:
        await disconnect_redis()
    except Exception as e:
        logger.error(f"Failed to disconnect  Redis: {e}", exc_info=True)
        raise


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


@app.get("/new")
async def qwer(request: Request):
    return "Hello"


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, proxy_headers=True)
