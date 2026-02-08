from uuid import UUID
from helpers.caching import get_redis_client


class SessionDescriptor:
    def __init__(self):
        self.prefix = "session_id:"
        self.redis_client = get_redis_client()

    async def get_user_id(self, session_id: UUID):
        d = await self.redis_client.get(f"{self.prefix}{session_id}")
        if d:
            return d["user_id"]
