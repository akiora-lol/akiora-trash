from uuid import UUID
import uuid
from helpers import get_redis_client


class SessionDescriptor:
    def __init__(self):
        self.prefix = "sid:"
        self.redis_client = get_redis_client()

    async def get_user_id_by_session_id(self, session_id: str) -> UUID | None:

        pattern = f"sid:{session_id}:user_id:*"

        cursor = 0
        while True:
            cursor, keys = await self.redis.scan(
                cursor=cursor,
                match=pattern,
                count=100,
            )

            for key in keys:
                # key выглядит: sid:{session_id}:user_id:{user_id}
                parts = key.split(":")
                if len(parts) >= 4:
                    return uuid.UUID(parts[-1])

            if cursor == 0:
                break

        return None

    async def get_session_ids_by_user_id(self, user_id: UUID) -> list[UUID]:
        """Получение всех session_id для user_id"""
        # Паттерн для поиска: sid:*:user_id:{user_id}
        pattern = f"sid:*:user_id:{user_id}"

        cursor = 0
        session_ids = []

        while True:
            cursor, keys = await self.redis.scan(
                cursor=cursor, match=pattern, count=100
            )

            for key in keys:
                # Извлекаем session_id из ключа
                # key: sid:{session_id}:user_id:{user_id}
                parts = key.split(":")
                if len(parts) >= 4:
                    session_ids.append(uuid.UUID(parts[1]))  # session_id

            if cursor == 0:
                break

        return session_ids
