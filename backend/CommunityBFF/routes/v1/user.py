from fastapi import APIRouter, HTTPException, Cookie, Depends, status
from dishka.integrations.fastapi import FromDishka, DishkaRoute, inject


from services.user import UserService
from services.session import SessionService

from typing import Annotated
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from schemas import Cookies, User, Session

router = APIRouter(prefix="/users", route_class=DishkaRoute)


@inject
async def get_current_user_id(
    cookies: Annotated[Cookies, Cookie()],
    sd: FromDishka[SessionService],
) -> str:
    user_id = await sd.get_uid(cookies.sid)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session"
        )
    return user_id


@router.get("/me")
async def get_user(
    us: FromDishka[UserService],
    uid=Depends(get_current_user_id),
):

    user = await us.get_user_by_id(uid)
    if user:
        return user
    raise HTTPException(status_code=404)
