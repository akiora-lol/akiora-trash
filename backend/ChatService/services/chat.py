import logging
from uuid import UUID

from repos.chat_repo import ChatRepo

from schemas.v1.chat import CreateChat


logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self, chat_rpo: ChatRepo):
        self.chat_repo = chat_rpo

    async def create_chat(self, event: CreateChat) -> UUID:
        chat = await self.chat_repo.create_chat(
            owner_id=event.owner_id,
            owner_type=event.owner_type,
            allowed_users=event.allowed_users,
            type=event.type,
        )
        return chat.id
