from faststream import AckPolicy, Logger
from faststream.rabbit import RabbitRouter
from faststream.rabbit.annotations import RabbitMessage
from config.messaging import aaq, avq, parse_exchange
from schemas.api import VerifyMsg
import redis

rb = RabbitRouter()
try:
    r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
except redis.exceptions.ConnectionError as e:
    print(f"Error connecting to Redis: {e}")
    exit()


@rb.subscriber(exchange=parse_exchange, queue=avq, ack_policy=AckPolicy.MANUAL)
async def get_account_icon_id(body: VerifyMsg, msg: RabbitMessage, logger: Logger):
    return


@rb.subscriber(exchange=parse_exchange, queue=aaq, ack_policy=AckPolicy.MANUAL)
async def get_account_info(msg: VerifyMsg, logger: Logger):
    return
