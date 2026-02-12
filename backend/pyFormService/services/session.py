# services/session_service.py
import json
from datetime import UTC, datetime


from uuid import UUID

from pydantic import EmailStr

from models.session_data import SessionData
from helpers.redis import get_redis_client


class SessionService:
    def __init__(self):
        self.redis = get_redis_client()
        self.prefix = "sid:"

    async def create_session(self, email: EmailStr, provider: str, client_host) -> UUID:
        session_data = SessionData(
            email=email,
            ip_address=client_host,
            auth_source=provider,
        )
        await session_data.save()

        await self.redis.setex(
            f"{self.prefix}{session_data.id}",
            int(
                (
                    session_data.exipres_at.astimezone(tz=UTC) - datetime.now(tz=UTC)
                ).total_seconds()
            ),
            session_data.model_dump_json(),
        )

        return session_data.id

    async def get_session(self, session_id: UUID) -> SessionData | None:
        """Получение данных сессии"""
        data = SessionData(
            **json.loads(await self.redis.get(f"{self.prefix}{session_id}"))
        )
        if not data:
            data = await SessionData.get(session_id)
            if not data:
                return None

        data.last_activity = datetime.now(tz=UTC)

        await self.redis.setex(
            f"{self.prefix}{session_id}",
            int(
                (
                    data.exipres_at.astimezone(tz=UTC) - datetime.now(tz=UTC)
                ).total_seconds()
            ),
            data.model_dump_json(),
        )

        return data

    async def update_session_user_info(
        self, session_id: UUID, user_info: dict
    ) -> SessionData | None:
        """Обновление данных сессии"""
        session = await self.get_session(session_id)
        if not session:
            return None
        print(user_info)

        if session.custom_data.get("user"):
            session.custom_data["user"].update(user_info)
        else:
            session.custom_data["user"] = user_info

        session.last_activity = datetime.now(tz=UTC)
        await session.save()
        await self.redis.setex(
            f"{self.prefix}{session_id}",
            int(
                (
                    session.exipres_at.astimezone(tz=UTC) - datetime.now(tz=UTC)
                ).total_seconds()
            ),
            session.model_dump_json(),
        )

        return session

    async def update_session(self, session_id: UUID, **kwargs) -> SessionData | None:
        """Обновление данных сессии"""
        session = await self.get_session(session_id)
        if not session:
            return None

        # TODO make it type safe idk
        session = session.model_copy(update=kwargs)

        session.last_activity = datetime.now(tz=UTC)
        await session.save()
        await self.redis.setex(
            f"{self.prefix}{session_id}",
            int(
                (
                    session.exipres_at.astimezone(tz=UTC) - datetime.now(tz=UTC)
                ).total_seconds()
            ),
            session.model_dump_json(),
        )

        return session

    async def delete_session(self, session_id: UUID):
        """Удаление сессии"""
        sd = await SessionData.get(session_id)
        if sd:
            await sd.delete()
        await self.redis.delete(f"{self.prefix}{session_id}")

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
