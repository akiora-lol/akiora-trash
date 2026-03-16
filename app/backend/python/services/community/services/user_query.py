from msgspec import Struct

from shared import MongoQuery
from models.user import User


class UserQueryService:
    def __init__(self, query: MongoQuery):
        self._query = query

    async def get_user(self, user_id: str) -> User | None:
        return await self._query.get_by_id(User, user_id)

    async def get_all_users(
        self, limit: int = 100, offset: int = 0
    ) -> list[User]:
        return await self._query.get_all_as_list(User, limit, offset)

    async def get_users_by_email(self, email: str) -> list[User]:
        return await self._query.get_by_field_as_list(User, "email", email)

    async def count_users(self) -> int:
        return await self._query.count()

    async def user_exists(self, user_id: str) -> bool:
        return await self._query.exists(user_id)
