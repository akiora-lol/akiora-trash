from datetime import UTC, datetime


import hmac
from uuid import UUID


from schemas import Session
from services import RedisService, SessionLogger, logged_async, logged
from shortuuid import decode as short_decode
import hashlib
from settings import Settings


class SessionService:
    def __init__(self, repo: RedisService, settings: Settings, logger: SessionLogger):
        self.prefix = "sid:"
        self.repo = repo
        self.logger = logger
        self.settings = settings

    @logged
    def verify_session(self, signed_id: str) -> UUID | None:
        try:
            session_id_enc, signature = signed_id.rsplit(".", 1)

            session_id = short_decode(session_id_enc)

            expected_signature = hmac.new(
                self.SECRET_KEY.encode(),
                str(session_id).encode(),
                hashlib.sha256,
            ).hexdigest()

            if hmac.compare_digest(signature, expected_signature):
                return session_id
        except:
            raise

    @logged_async
    async def get_session(self, session_id: UUID) -> Session | None:

        data = await self.repo.get(f"{self.prefix}{session_id}", Session)

        return data

    @logged_async
    async def get_session_uid(self, session_id: UUID) -> str | None:

        data = await self.repo.get(f"{self.prefix}{session_id}", Session)
        if data:
            return data.custom_data.get("user").get("id")

        return None

    @logged_async
    async def get_uid(self, signed_ses: str) -> str | None:

        sid = self.verify_session(signed_id=signed_ses)

        return await self.get_session_uid(sid)

    async def get_session_user(self, session_id: UUID) -> dict | None:

        data = await self.repo.get(f"{self.prefix}{session_id}", Session)
        if data:
            return data.custom_data.get("user")

        return data
