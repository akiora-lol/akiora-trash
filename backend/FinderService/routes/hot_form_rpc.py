from faststream.redis import RedisRouter
from dishka.integrations.faststream import FromDishka
from loguru import logger

from services.hot_form_service import HotFormService


router = RedisRouter()


@router.subscriber(stream="hot_form.rpc")
async def handle_hot_form_rpc(
    message: bytes,
    service: FromDishka[HotFormService],
) -> bytes:
    logger.info("RPC: Handling hot_form.rpc message")
    return await service.handle_rpc(message)
