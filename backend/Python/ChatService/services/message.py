import logging

from uuid import UUID
from repos.message_repo import MessageRepo
from schemas.v1.chat import CreateChat
from .chat import ChatService
from schemas.v1.message import CreateMessage, UpdateMessage
from schemas.v1.api import GetQueryParams
from models.message import Message

logger = logging.getLogger(__name__)


class MessageService:
    def __init__(self, chat_service: ChatService, message_repo: MessageRepo):
        self.message_repo = message_repo
        self.chat_service = chat_service

    async def create_message(self, user_id: UUID, event: CreateMessage) -> Message:
        if event.receiver_type == "chat":
            return await self.message_repo.create_message(
                chat_id=event.receiver_id,
                creator_id=user_id,
                body=event.body,
                ttl=event.ttl,
                spoiler=event.spoiler,
            )
        elif event.receiver_type == "user":
            crc = CreateChat(
                owner_id=UUID(int=0),
                owner_type="system",
                type="private",
                status="active",
                allowed_users=[user_id, event.receiver_id],
            )
            chat_id = await self.chat_service.create_chat(crc)
            return await self.message_repo.create_message(
                chat_id=chat_id,
                creator_id=user_id,
                body=event.body,
                ttl=event.ttl,
                spoiler=event.spoiler,
            )
        raise

    async def update_message(self, user_id: UUID, event: UpdateMessage):
        await self.message_repo.update_message(event.msg_id, event.body)

    async def get_chat_messages(self, chat_id, params: GetQueryParams) -> list[Message]:
        return await self.message_repo.get_messages_by_chat_id(
            chat_id, offset=params.offset, limit=params.limit
        )
