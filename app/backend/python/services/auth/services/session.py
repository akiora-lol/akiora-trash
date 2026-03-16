# from datetime import UTC, datetime
from uuid import UUID

from models.session import Session
from pydantic import EmailStr

from shared import RedisService


class SessionService:
    def __init__(self, repo: RedisService):
        self.repo = repo
        self.ttl = 60 * 24 * 60 * 60

    async def create_session(
        self,
        email: EmailStr,
        provider: str,
        user_id: UUID,
        user_data: dict | None = None,
    ) -> UUID:
        session_data = Session(
            user_id=user_id,
            email=email,
            auth_source=provider,
            custom_data={"user": user_data},
        )
        await self.repo.create(
            key=f"sid:{session_data.id}", value=session_data.model_dump(), ttl=self.ttl
        )

        return session_data.id

    async def get_session(self, session_id: UUID) -> Session:

        data = await self.repo.get(key=f"sid:{session_id}")

        return Session(**data)

    # TODO  check for user_id in custom_data
    # async def delete_user_sessions(self, user_id: UUID):
    #     """Удаление всех сессий пользователя (при смене пароля и т.д.)"""
    #     # В реальном приложении нужен индекс user_id -> session_id
    #     # Для простоты используем сканирование (осторожно в production!)

    #     sessions = await SessionData.find_all(user_id=user_id)
    #     for x in sessions:
    #         await x.delete()

    #     cursor = 0
    #     while True:
    #         cursor, keys = await self.redis.scan(cursor=cursor, match=f"{self.prefix}*")

    #         for key in keys:
    #             data = await self.redis.get(key)
    #             if data:
    #                 session = SessionData(**data)
    #                 if session.user_id == user_id:
    #                     await self.redis.delete(key)

    #         if cursor == 0:
    #             break
