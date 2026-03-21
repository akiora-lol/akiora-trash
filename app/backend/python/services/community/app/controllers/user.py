from dishka.integrations.litestar import FromDishka
from litestar import Controller, delete, get, patch, post
from litestar.di import Provide
from litestar.status_codes import (
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
)

from ..dto.user import UserCreate, UserResponse, UserUpdate
from ..use_cases.user import UserUC
from .utils import get_user_id_from_cookie


class UserController(Controller):
    path = "/users"
    dependencies = {"current_user_id": Provide(get_user_id_from_cookie)}

    @get("", sync_to_thread=False)
    async def get_users(
        self,
        user_uc: FromDishka[UserUC],
        limit: int = 100,
        offset: int = 0,
    ) -> list[UserResponse]:
        return await user_uc.get(limit=limit, offset=offset)

    @get("/{user_id:str}", sync_to_thread=False)
    async def get_user(
        self,
        user_uc: FromDishka[UserUC],
        user_id: str,
    ) -> UserResponse:
        return await user_uc.get(user_id=user_id)

    @post("", status_code=HTTP_201_CREATED, sync_to_thread=False)
    async def create_user(
        self,
        user_uc: FromDishka[UserUC],
        data: UserCreate,
    ) -> UserResponse:
        return await user_uc.create(data=data)

    @patch("/{user_id:str}", sync_to_thread=False)
    async def update_user(
        self,
        user_uc: FromDishka[UserUC],
        user_id: str,
        data: UserUpdate,
    ) -> UserResponse:
        return await user_uc.update(user_id=user_id, data=data)

    @delete("/{user_id:str}", status_code=HTTP_204_NO_CONTENT, sync_to_thread=False)
    async def delete_user(
        self,
        user_uc: FromDishka[UserUC],
        user_id: str,
    ) -> None:
        await user_uc.delete_user(user_id)
