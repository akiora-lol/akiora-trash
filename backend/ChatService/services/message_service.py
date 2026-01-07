"""
Сервис для работы с сообщениями.
Содержит бизнес-логику обработки сообщений между обработчиками событий и репозиторием.
"""

import logging

from uuid import UUID, uuid4
from datetime import datetime, UTC

from repos.message_repo import MessageRepo
from services.chat_service import ChatService
from schemas import (
    CreateMessageEvent,
    UpdateMessageEvent,
    DeleteMessageEvent,
    ProcessedMessageEvent,
)

logger = logging.getLogger(__name__)


class MessageService:
    def __init__(self, message_repo: MessageRepo, chat_service: ChatService):
        self.message_repo = message_repo
        self.chat_service = chat_service

    async def process_create_message(
        self, event: CreateMessageEvent
    ) -> ProcessedMessageEvent:
        logger.info(
            f"Processing CREATE message event: user={event.user_id}, chat={event.chat_id}"
        )

        await self._validate_message_event(event)

        validated_body = self._validate_message_content(event.message_body)

        try:
            user_uuid = UUID(event.user_id)
            chat_uuid = UUID(event.chat_id)

            message = await self.message_repo.create_message(
                chat_id=chat_uuid,
                creator_id=user_uuid,
                content=validated_body,
                ttl=None,
            )

            logger.info(f"Message created successfully: {message.id}")

            # Формируем ответ
            return ProcessedMessageEvent(
                message_id=str(message.id),
                event_type="create",
                user_id=event.user_id,
                chat_id=event.chat_id,
                message_body=validated_body,
                original_timestamp=event.timestamp,
                processed_at=datetime.utcnow(),
                status="success",
            )

        except Exception as e:
            logger.error(f"Error creating message: {e}", exc_info=True)
            return ProcessedMessageEvent(
                message_id=str(uuid4()),
                event_type="create",
                user_id=event.user_id,
                chat_id=event.chat_id,
                message_body=event.message_body,
                original_timestamp=event.timestamp,
                processed_at=datetime.utcnow(),
                status="error",
            )

    async def process_update_message(
        self, event: UpdateMessageEvent
    ) -> ProcessedMessageEvent:
        logger.info(
            f"Processing UPDATE message event: message={event.message_id}, user={event.user_id}"
        )

        await self._validate_message_event(event)

        validated_body = self._validate_message_content(event.new_message_body)

        try:
            message_uuid = UUID(event.message_id)

            existing_message = await self.message_repo.get_message_by_id(message_uuid)
            if not existing_message:
                raise ValueError(f"Message not found: {event.message_id}")

            # Проверяем права на изменение (пользователь должен быть создателем)
            if str(existing_message.creator_id) != event.user_id:
                raise PermissionError(
                    f"User {event.user_id} cannot update message {event.message_id}"
                )

            await self.message_repo.update_message_content(
                message_id=message_uuid, new_content=validated_body
            )

            logger.info(f"Message updated successfully: {message_uuid}")

            return ProcessedMessageEvent(
                message_id=event.message_id,
                event_type="update",
                user_id=event.user_id,
                chat_id=event.chat_id,
                message_body=validated_body,
                original_timestamp=event.timestamp,
                processed_at=datetime.now(tz=UTC),
                status="success",
            )

        except Exception as e:
            logger.error(f"Error updating message: {e}", exc_info=True)
            return ProcessedMessageEvent(
                message_id=event.message_id,
                event_type="update",
                user_id=event.user_id,
                chat_id=event.chat_id,
                message_body=event.new_message_body,
                original_timestamp=event.timestamp,
                processed_at=datetime.now(tz=UTC),
                status="error",
            )

    async def process_delete_message(
        self, event: DeleteMessageEvent
    ) -> ProcessedMessageEvent:
        logger.info(
            f"Processing DELETE message event: message={event.message_id}, user={event.user_id}"
        )

        await self._validate_message_event(event)

        try:
            message_uuid = UUID(event.message_id)

            existing_message = await self.message_repo.get_message_by_id(message_uuid)
            if not existing_message:
                raise ValueError(f"Message not found: {event.message_id}")

            if str(existing_message.creator_id) != event.user_id:
                raise PermissionError(
                    f"User {event.user_id} cannot delete message {event.message_id}"
                )

            await self.message_repo.delete_message(message_uuid)

            logger.info(f"Message deleted successfully: {message_uuid}")

            return ProcessedMessageEvent(
                message_id=event.message_id,
                event_type="delete",
                user_id=event.user_id,
                chat_id=event.chat_id,
                message_body=None,
                original_timestamp=event.timestamp,
                processed_at=datetime.utcnow(),
                status="success",
            )

        except Exception as e:
            logger.error(f"Error deleting message: {e}", exc_info=True)
            return ProcessedMessageEvent(
                message_id=event.message_id,
                event_type="delete",
                user_id=event.user_id,
                chat_id=event.chat_id,
                message_body=None,
                original_timestamp=event.timestamp,
                processed_at=datetime.utcnow(),
                status="error",
            )

    async def _validate_message_event(
        self, event: CreateMessageEvent | UpdateMessageEvent | DeleteMessageEvent
    ) -> None:
        chat_exists = await self.chat_service.validate_chat_exists(event.chat_id)
        if not chat_exists:
            raise ValueError(f"Chat not found: {event.chat_id}")

        user_in_chat = await self.chat_service.validate_user_in_chat(
            event.chat_id, event.user_id
        )
        if not user_in_chat:
            raise ValueError(
                f"User {event.user_id} is not a member of chat {event.chat_id}"
            )

    def _validate_message_content(self, content: str) -> str:
        cleaned = content.strip()

        if len(cleaned) == 0:
            raise ValueError("Message content cannot be empty")

        if len(cleaned) > 10000:
            raise ValueError("Message content is too long (max 10000 characters)")

        return cleaned
