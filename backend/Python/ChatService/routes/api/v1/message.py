from fastapi import APIRouter, HTTPException, Cookie, Depends, Query
from dishka.integrations.fastapi import DishkaRoute, FromDishka

from services.session import SessionDescriptor
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID, uuid4
from schemas.v1.message import CreateMessage
from services.message import MessageService
from models.message import Message
from schemas.v1.api import Cookies, GetQueryParams

router = APIRouter(route_class=DishkaRoute)


@router.post("/")
async def create_message(
    create_data: CreateMessage, ms: FromDishka[MessageService]
) -> Message:
    msg = await ms.create_message(user_id=uuid4(), event=create_data)
    return msg


@router.get("/chat/{chat_id}")
async def get_chat_messages(
    chat_id: UUID,
    params: Annotated[GetQueryParams, Query()],
    ms: FromDishka[MessageService],
):
    msgs = await ms.get_chat_messages(chat_id=chat_id, params=params)
    return msgs
