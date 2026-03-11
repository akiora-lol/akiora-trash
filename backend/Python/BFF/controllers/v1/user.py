from litestar import Controller, get, post, Request
from litestar.status_codes import HTTP_401_UNAUTHORIZED
from litestar.exceptions import HTTPException
from litestar.params import Parameter
from litestar.status_codes import HTTP_201_CREATED
from dishka.integrations.litestar import FromDishka, inject
from schemas import User, PublicUserDTO
from typing import Annotated
from litestar.di import Provide
from services import SessionService
import msgspec
from loguru import logger
from datetime import datetime, timedelta


@inject
async def get_current_user_id(
    sid: Annotated[str, Parameter(cookie="sid")],
    sd: FromDishka[SessionService],
) -> str:
    logger.info(sid)
    user_id = await sd.get_uid(sid)
    if not user_id:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid session")
    return user_id


@logger.catch
@inject
async def get_current_user(
    sid: Annotated[str, Parameter(cookie="sid")],
    sd: FromDishka[SessionService],
) -> User:
    logger.info(sid)
    dt = datetime.now()
    user = await sd.get_user(sid)
    dt2 = datetime.now() - dt

    logger.info(dt2.microseconds)
    if not user:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid session")
    return msgspec.convert(user, User)


class UserController(Controller):
    path = "/users"
    dependencies = {
        "current_user_id": Provide(get_current_user_id),
        "current_user": Provide(get_current_user),
    }

    @get("/me", return_dto=PublicUserDTO)
    def get_me(self, current_user: User) -> User:

        return current_user
