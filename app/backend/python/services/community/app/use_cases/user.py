from typing import overload

from domain.models.user import User
from infra.services.user import UserRepo

from ..dto.user import UserCreate, UserResponse, UserUpdate


class UserUC:
    def __init__(self, user_repo: UserRepo):
        self._user_repo = user_repo

    @overload
    async def create(self, data: UserCreate) -> UserResponse: ...

    @overload
    async def create(self, **kwargs) -> UserResponse: ...

    async def create(self, data: UserCreate | None = None, **kwargs) -> UserResponse:
        if data is not None:
            user = User.create(**data.as_dict())
        else:
            user = User.create(**kwargs)
        await self._user_repo.create_user(user)
        return self._to_response(user)

    @overload
    async def get(self, *, user_id: str) -> UserResponse: ...

    @overload
    async def get(self, *, email: str) -> list[UserResponse]: ...

    @overload
    async def get(self, *, limit: int, offset: int = 0) -> list[UserResponse]: ...

    @overload
    async def get(self) -> list[UserResponse]: ...

    async def get(
        self,
        *,
        user_id: str | None = None,
        email: str | None = None,
        limit: int | None = None,
        offset: int = 0,
    ) -> UserResponse | list[UserResponse]:
        if user_id is not None:
            user = await self._user_repo.get_user(user_id)
            return self._to_response(user)
        elif email is not None:
            users = await self._user_repo.get_users_by_email(email)
            return [self._to_response(user) for user in users]
        elif limit is not None:
            users = await self._user_repo.get_all_users(limit, offset)
            return [self._to_response(user) for user in users]
        else:
            users = await self._user_repo.get_all_users()
            return [self._to_response(user) for user in users]

    @overload
    async def update(self, user_id: str, data: UserUpdate) -> UserResponse: ...

    @overload
    async def update(self, user_id: str, **kwargs) -> UserResponse: ...

    async def update(
        self, user_id: str, data: UserUpdate | None = None, **kwargs
    ) -> UserResponse:
        if data is not None:
            update_data = data.as_dict()
        else:
            update_data = kwargs

        await self._user_repo.update_user(user_id, update_data)
        user = await self._user_repo.get_user(user_id)
        return self._to_response(user)

    async def delete_user(self, user_id: str) -> bool:
        return await self._user_repo.delete_user(user_id)

    async def get_all_users(
        self, limit: int = 100, offset: int = 0
    ) -> list[UserResponse]:
        users = await self._user_repo.get_all_users(limit, offset)
        return [self._to_response(user) for user in users]

    async def get_users_by_email(self, email: str) -> list[UserResponse]:
        users = await self._user_repo.get_users_by_email(email)
        return [self._to_response(user) for user in users]

    async def count_users(self) -> int:
        return await self._user_repo.count_users()

    async def user_exists(self, user_id: str) -> bool:
        return await self._user_repo.user_exists(user_id)

    def _to_response(self, user: User) -> UserResponse:
        return UserResponse(
            id=user.id,
            email=user.email,
            nickname=user.nickname,
            bio=user.bio,
            gender=user.gender,
            birth_date=user.birth_date,
            personal_socials=user.personal_socials,
            created_at=user.created_at,
            last_updated=user.last_updated,
        )
