from fastapi import APIRouter, HTTPException, Cookie, Depends, Query


from services.session import SessionDescriptor
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID, uuid4
from schemas.v1.message import CreateMessage
from services.message import MessageService
from models.message import Message
from schemas.v1.api import Cookies, GetQueryParams

router = APIRouter(prefix="/messages")


@router.post("/")
async def create_message(create_data: CreateMessage) -> Message:
    msg = await MessageService().create_message(user_id=uuid4(), event=create_data)
    return msg


@router.get("/{chat_id}")
async def get_chat_messages(chat_id: UUID, params: Annotated[GetQueryParams, Query()]):
    msgs = await MessageService().get_chat_messages(chat_id=chat_id, params=params)
    return msgs
