from typing import Literal, Annotated
from fastapi import APIRouter, Request, Cookie, HTTPException

from dishka.integrations.fastapi import FromDishka, DishkaRoute
from services.opgg_service import OpggService

router = APIRouter(route_class=DishkaRoute)


@router.get("/trigger")
async def me(
    ops: FromDishka[OpggService],
    name: str,
    tag: str,
    server: str,
):

    return await ops.get_user(name + tag, server=server)
