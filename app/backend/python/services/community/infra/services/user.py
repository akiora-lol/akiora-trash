from domain.models.user import User

from shared.infra.redis import RedisService

from ..db.user import UserCommandService, UserQueryService


class UserRepo:
    def __init__(
        self, cs: UserCommandService, qs: UserQueryService, rs: RedisService
    ):
        self._command_service = cs
        self._query_service = qs
        self._redis = rs

    async def create_user(self, user: User) -> str:
        return await self._command_service.create_user(user)

    async def update_user(self, user_id: str, data: dict) -> bool:
        return await self._command_service.update_user(user_id, data)

    async def delete_user(self, user_id: str) -> bool:
        return await self._command_service.delete_user(user_id)

    async def get_user(self, user_id: str) -> User:
        return await self._query_service.get_user(user_id)

    async def get_all_users(self, limit: int = 100, offset: int = 0) -> list[User]:
        return await self._query_service.get_all_users(limit, offset)

    async def get_users_by_email(self, email: str) -> list[User]:
        return await self._query_service.get_users_by_email(email)

    async def count_users(self) -> int:
        return await self._query_service.count_users()

    async def user_exists(self, user_id: str) -> bool:
        return await self._query_service.user_exists(user_id)
