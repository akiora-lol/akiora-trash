from faststream import AckPolicy, Logger
from faststream.rabbit import RabbitRouter
from faststream.rabbit.annotations import RabbitMessage
from config.messaging import aaq, avq, parse_exchange
from helpers.caching import get_redis_client
from helpers.opt_parse import AsyncOpGgStatsParser
from schemas.api import VerifyMsg

rb = RabbitRouter()


@rb.subscriber(exchange=parse_exchange, queue=avq, ack_policy=AckPolicy.MANUAL)
async def get_account_icon_id(body: VerifyMsg, msg: RabbitMessage, logger: Logger):
    try:
        async with AsyncOpGgStatsParser() as parser:
            stats = await parser.parse_from_server_name_tag(
                body.acc_server, body.acc_name, body.acc_tag
            )
            logger.info(
                f"Parsed: {stats.solo_queue.icon_id if stats.solo_queue else 'No rank'}"
            )
        if stats:
            await get_redis_client().append(
                key=str(body.session_id),
                value=f"current_icon_id={int(stats.solo_queue.icon_id)}:",
            )

    except Exception as e:
        logger.warning(e)
    return


@rb.subscriber(exchange=parse_exchange, queue=aaq, ack_policy=AckPolicy.MANUAL)
async def get_account_info(msg: VerifyMsg, logger: Logger):
    return
