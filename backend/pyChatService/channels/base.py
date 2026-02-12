from uuid import UUID
from faststream.rabbit import RabbitRouter
from faststream.annotations import Logger
from faststream.rabbit.annotations import RabbitMessage

from config.messaging import (
    chat_exchange,
    form_queue,
    user_queue,
    form_exchange,
    user_exchange,
)
from models import Chat, Message
from services.message import MessageService
from services.chat import ChatService
from schemas.v1.chat import CreateChat

router = RabbitRouter()


@router.subscriber(
    queue=form_queue,
    exchange=form_exchange,
)
async def handle_user_info(
    event: dict,
    logger: Logger,
    msg: RabbitMessage,
):
    logger.info(f"Received event {event}")

    try:
        uid1 = str(event.get("like_sender"))
        uid2 = str(event.get("form_creator"))

        if not all([uid1, uid2]):
            raise

        ce = CreateChat(
            owner_id=UUID(int=0),
            owner_type="system",
            type="private",
            status="active",
            allowed_users=[UUID(uid1), UUID(uid2)],
        )
        chat = await ChatService().create_chat(ce)

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        await msg.reject()
