"""
Сервис для работы с чатами.
Содержит бизнес-логику между обработчиками событий и репозиторием.
"""

import logging
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime

from repos.chat_repo import ChatRepo
from schemas import (
    CreateChatEvent,
    ProcessedChatEvent,
)


logger = logging.getLogger(__name__)


class ChatService:
    """Сервис для работы с чатами."""

    def __init__(self, chat_repo: ChatRepo):
        self.chat_repo = chat_repo

    async def validate_chat_exists(self, chat_id: str) -> bool:
        try:
            if isinstance(chat_id, str):
                chat_uuid = UUID(chat_id)
            else:
                chat_uuid = chat_id

            chat = await self.chat_repo.get_chat_by_id(chat_uuid)
            return chat is not None
        except (ValueError, TypeError) as e:
            logger.warning(f"Invalid chat_id format: {chat_id}, error: {e}")
            return False

    async def validate_user_in_chat(self, chat_id: str, user_id: str) -> bool:
        try:
            chat_uuid = UUID(chat_id)
            user_uuid = UUID(user_id)

            chat = await self.chat_repo.get_chat_by_id(chat_uuid)
            if not chat:
                logger.warning(f"Chat not found: {chat_id}")
                return False

            if chat.allowed_users:
                return user_uuid in chat.allowed_users

            return True

        except (ValueError, TypeError) as e:
            logger.warning(
                f"Invalid format: chat_id={chat_id}, user_id={user_id}, error: {e}"
            )
            return False

    async def get_chat_info(self, chat_id: str) -> Optional[dict]:
        try:
            chat_uuid = UUID(chat_id)
            chat = await self.chat_repo.get_chat_by_id(chat_uuid)

            if chat:
                return {
                    "id": str(chat.id),
                    "name": getattr(chat, "name", None),
                    "created_at": getattr(chat, "created_at", None),
                }
            return None

        except (ValueError, TypeError) as e:
            logger.error(f"Error getting chat info: {e}")
            return None

    async def process_create_chat(self, event: CreateChatEvent) -> ProcessedChatEvent:
        logger.info(
            f"Processing CREATE chat event: creator={event.creator_id}, "
            f"title={event.title}, type={event.chat_type}"
        )

        try:
            self._validate_create_chat_event(event)

            creator_uuid = UUID(event.creator_id)
            allowed_users_uuids = [UUID(user_id) for user_id in event.allowed_users]

            if (
                event.chat_type == "private"
                and str(creator_uuid) not in event.allowed_users
            ):
                allowed_users_uuids.append(creator_uuid)

            chat = await self.chat_repo.create_chat(
                creator_id=creator_uuid, title=event.title
            )

            chat.chat_type = event.chat_type
            chat.allowed_users = allowed_users_uuids
            chat.updated_at = datetime.utcnow()
            await chat.save()

            logger.info(
                f"Chat created successfully: id={chat.id}, "
                f"type={chat.chat_type}, allowed_users={len(allowed_users_uuids)}"
            )

            return ProcessedChatEvent(
                chat_id=str(chat.id),
                event_type="create",
                creator_id=event.creator_id,
                title=event.title,
                chat_type=event.chat_type,
                allowed_users=event.allowed_users,
                original_timestamp=event.timestamp,
                processed_at=datetime.utcnow(),
                status="success",
            )

        except Exception as e:
            logger.error(f"Error creating chat: {e}", exc_info=True)
            return ProcessedChatEvent(
                chat_id=str(uuid4()),
                event_type="create",
                creator_id=event.creator_id,
                title=event.title,
                chat_type=event.chat_type,
                allowed_users=event.allowed_users,
                original_timestamp=event.timestamp,
                processed_at=datetime.utcnow(),
                status="error",
            )

    def _validate_create_chat_event(self, event: CreateChatEvent) -> None:
        try:
            UUID(event.creator_id)
        except ValueError:
            raise ValueError(f"Invalid creator_id format: {event.creator_id}")

        if not event.title or len(event.title.strip()) == 0:
            raise ValueError("Chat title cannot be empty")

        if len(event.title) > 100:
            raise ValueError("Chat title is too long (max 100 characters)")

        if event.chat_type == "private":
            if not event.allowed_users:
                raise ValueError("Private chat must have at least one allowed user")

            for user_id in event.allowed_users:
                try:
                    UUID(user_id)
                except ValueError:
                    raise ValueError(
                        f"Invalid user_id format in allowed_users: {user_id}"
                    )
