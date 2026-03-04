import msgspec
from faststream.redis import RedisBroker
from loguru import logger


class SessionService:
    def __init__(self, redis_broker: RedisBroker):
        self.redis = redis_broker
        logger.debug("SessionService initialized")

    async def get_user_id_by_sid(self, sid: str):
        logger.info("Fetching user ID by session ID: {sid}", sid=sid)
        data = await self.redis.request(
            stream="auth.rpc", message={"sid": sid}, timeout=5
        )

        if data and data.body:
            data = msgspec.msgpack.decode(data.body)
            user_id = data.get("custom_data", {}).get("user", {}).get("id")
            if user_id:
                logger.info("User ID found for session {sid}: {user_id}", sid=sid, user_id=user_id)
            else:
                logger.warning("User ID not found in response for session {sid}", sid=sid)
            return user_id
        
        logger.warning("No data received for session {sid}", sid=sid)
        return None
