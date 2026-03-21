from domain.models.user import User

from shared import MongoQuery


class UserQueryService:
    def __init__(self, query: MongoQuery):
        self._query_mongo = query

    async def get_user(self, user_id: str) -> User:
        return await self._query_mongo.get_by_id(User, user_id)

    async def get_all_users(self, limit: int = 100, offset: int = 0) -> list[User]:
        return await self._query_mongo.get_all_as_list(User, limit, offset)

    async def get_users_by_email(self, email: str) -> list[User]:
        return await self._query_mongo.get_by_field_as_list(User, "email", email)

    async def count_users(self) -> int:
        return await self._query_mongo.count()

    async def user_exists(self, user_id: str) -> bool:
        return await self._query_mongo.exists(user_id)
