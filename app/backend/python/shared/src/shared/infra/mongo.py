from typing import Any, AsyncIterator, Generic, Type, TypeVar

import msgspec
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase
from msgspec.structs import Struct

from ..errors import LibError

T = TypeVar("T")
TT=TypeVar("TT")

class Mongo:
    def __init__(self, db: AsyncIOMotorDatabase, collection_name: str):
        self._collection: AsyncIOMotorCollection = db[collection_name]


class MongoQuery(Mongo):
    async def get_all(
        self,
        convert_to: Type[T],
        limit: int = 1000,
        offset: int = 0,
    ) -> AsyncIterator[T]:
        cursor = self._collection.find({}).limit(limit).skip(offset)
        async for bson_data in cursor:
            data = msgspec.convert(bson_data, type=convert_to)
            yield data

    async def get_all_as_list(
        self,
        convert_to: Type[T],
        limit: int = 1000,
        offset: int = 0,
    ) -> list[T]:
        return [doc async for doc in self.get_all(convert_to, limit, offset)]

    async def get_by_id(
        self,
        convert_to: Type[T],
        id: str,
    ) -> T:
        bson_data = await self._collection.find_one({"_id": id})
        if bson_data is None:
            raise LibError("Not found")
        return msgspec.convert(bson_data, type=convert_to)

    async def get_by_field(
        self,
        convert_to: Type[T],
        field: str,
        value: Any,
    ) -> AsyncIterator[T]:
        cursor = self._collection.find({field: value})
        async for bson_data in cursor:
            data = msgspec.convert(bson_data, type=convert_to)
            yield data

    async def get_by_field_as_list(
        self,
        convert_to: Type[T],
        field: str,
        value: Any,
    ) -> list[T]:
        return [doc async for doc in self.get_by_field(convert_to, field, value)]

    async def count(self, filter: dict[str, Any] | None = None) -> int:
        return await self._collection.count_documents(filter or {})

    async def exists(self, id: str) -> bool:
        return await self._collection.count_documents({"_id": id}) > 0


class MongoCommand(Mongo):
    async def create_one(self, data: T) -> str:
        result = await self._collection.insert_one(msgspec.to_builtins(data))
        return str(result.inserted_id)

    async def update_one(self, id: str, data: dict[str, Any]) -> bool:
        result = await self._collection.update_one({"_id": id}, {"$set": data})
        return result.modified_count > 0

    async def delete_one(self, id: str) -> bool:
        result = await self._collection.delete_one({"_id": id})
        return result.deleted_count > 0

    async def upsert_one(self, id: str, data: T) -> str:
        result = await self._collection.update_one(
            {"_id": id}, {"$set": msgspec.to_builtins(data)}, upsert=True
        )
        return str(result.upserted_id) if result.upserted_id else id
