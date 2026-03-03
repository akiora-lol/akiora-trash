from uuid import UUID
from faststream.redis import RedisBroker, StreamSub
from faststream.annotations import Logger
from faststream.redis.annotations import RedisMessage
from dishka.integrations.faststream import FromDishka


from services.chat import ChatService
from schemas.v1.chat import CreateChat

router = RedisBroker()


@router.subscriber(stream=StreamSub(stream="messenger.rpc", group="self"))
async def handle_user_info(
    event: dict,
    logger: Logger,
    chat_service: FromDishka[ChatService],
    msg: RedisMessage,
):
    logger.info(f"Received event {event}")

    # try:
    #     uid1 = str(event.get("like_sender"))
    #     uid2 = str(event.get("form_creator"))

    #     if not all([uid1, uid2]):
    #         raise

    #     ce = CreateChat(
    #         owner_id=UUID(int=0),
    #         owner_type="system",
    #         type="private",
    #         status="active",
    #         allowed_users=[UUID(uid1), UUID(uid2)],
    #     )
    #     chat = await chat_service.create_chat(ce)
    #     await msg.ack()

    # except Exception as e:
    #     logger.error(f"Error: {str(e)}")
    #     await msg.reject()
