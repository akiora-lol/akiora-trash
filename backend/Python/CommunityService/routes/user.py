from faststream.redis import RedisRouter, StreamSub
from loguru import logger
from dishka import FromDishka

from services.user import UserService
from settings import Settings

from msgspec import msgpack

settings = Settings()

router = RedisRouter()


@router.subscriber(
    stream=StreamSub(stream="user.rpc", group="user.worker", consumer="user")
)
async def handle_rpc(
    msg: bytes,
    user_service: FromDishka[UserService],
):
    msg_dict = msgpack.decode(msg)
    logger.info("Incoming RPC message: {msg}", msg=msg_dict)
    data = await user_service.handle_rpc(msg_dict)
    logger.info("Returning RPC response: {data}", data=data)

    return msgpack.encode(data)
