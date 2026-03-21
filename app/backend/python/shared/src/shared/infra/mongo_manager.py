from contextlib import asynccontextmanager
from typing import AsyncIterator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from shared.settings import Settings


class MongoManager:
    def __init__(self, settings: Settings):
        self._settings = settings
        self._client: AsyncIOMotorClient | None = None
        self._db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        self._client = AsyncIOMotorClient(self._settings.mongodb_url)
        self._db = self._client[self._settings.mongodb_db_name]

    async def disconnect(self) -> None:
        if self._client:
            self._client.close()
            self._client = None
            self._db = None

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            raise RuntimeError("MongoDB not connected")
        return self._db

    @asynccontextmanager
    async def managed(self) -> AsyncIterator["MongoManager"]:
        await self.connect()
        try:
            yield self
        finally:
            await self.disconnect()
