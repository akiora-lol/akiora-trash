from faststream.redis import RedisRouter
from dishka.integrations.faststream import FromDishka
from loguru import logger

from services.cold_form_service import ColdFormService


router = RedisRouter()


@router.subscriber(stream="cold_form.rpc")
async def handle_cold_form_rpc(
    message: bytes,
    service: FromDishka[ColdFormService],
) -> bytes:
    logger.info("RPC: Handling cold_form.rpc message")
    return await service.handle_rpc(message)
