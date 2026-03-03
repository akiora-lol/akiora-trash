from faststream.redis import RedisBroker
from settings import Settings
from logging import Logger
from services import logged_async, logged


class UserService:
    def __init__(self, redis_broker: RedisBroker, settings: Settings, logger: Logger):
        self.broker = redis_broker
        self.rpc = settings.user_rpc_stream
        self.maxlen = 100_000
        self.timeout = 20
        self.logger = logger

    @logged_async
    async def get_user(self, uid: str):
        await self.broker.request(
            stream=self.rpc,
            maxlen=self.maxlen,
            message={"action": "get", "id": uid},
            timeout=self.timeout,
        )
