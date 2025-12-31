"""
Сервис для работы с сообщениями.
Содержит бизнес-логику обработки сообщений между обработчиками событий и репозиторием.
"""

import logging
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime

from repos.message_repo import MessageRepo
from services.chat_service import ChatService
from schemas.events import (
    CreateMessageEvent,
    UpdateMessageEvent,
    DeleteMessageEvent,
    ProcessedMessageEvent,
    MessageEventType,
)

logger = logging.getLogger(__name__)


class MessageService:
    """Сервис для обработки сообщений."""

    def __init__(self, message_repo: MessageRepo, chat_service: ChatService):
        self.message_repo = message_repo
        self.chat_service = chat_service

    async def process_create_message(
        self, event: CreateMessageEvent
    ) -> ProcessedMessageEvent:
        """
        Обрабатывает создание нового сообщения.

        Args:
            event: Событие создания сообщения

        Returns:
            Обработанное событие
        """
        logger.info(
            f"Processing CREATE message event: user={event.user_id}, chat={event.chat_id}"
        )

        # Валидация
        await self._validate_message_event(event)

        # Дополнительная валидация контента
        validated_body = self._validate_message_content(event.message_body)

        try:
            # Создаем сообщение в БД
            message_uuid = uuid4()
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
                event_type=MessageEventType.CREATE,
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
                event_type=MessageEventType.CREATE,
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
        """
        Обрабатывает обновление существующего сообщения.

        Args:
            event: Событие обновления сообщения

        Returns:
            Обработанное событие
        """
        logger.info(
            f"Processing UPDATE message event: message={event.message_id}, user={event.user_id}"
        )

        # Валидация
        await self._validate_message_event(event)

        # Валидация нового контента
        validated_body = self._validate_message_content(event.new_message_body)

        try:
            message_uuid = UUID(event.message_id)

            # Проверяем существование сообщения
            existing_message = await self.message_repo.get_message_by_id(message_uuid)
            if not existing_message:
                raise ValueError(f"Message not found: {event.message_id}")

            # Проверяем права на изменение (пользователь должен быть создателем)
            if str(existing_message.creator_id) != event.user_id:
                raise PermissionError(
                    f"User {event.user_id} cannot update message {event.message_id}"
                )

            # Обновляем сообщение
            updated_message = await self.message_repo.update_message_content(
                message_id=message_uuid, new_content=validated_body
            )

            logger.info(f"Message updated successfully: {message_uuid}")

            return ProcessedMessageEvent(
                message_id=event.message_id,
                event_type=MessageEventType.UPDATE,
                user_id=event.user_id,
                chat_id=event.chat_id,
                message_body=validated_body,
                original_timestamp=event.timestamp,
                processed_at=datetime.utcnow(),
                status="success",
            )

        except Exception as e:
            logger.error(f"Error updating message: {e}", exc_info=True)
            return ProcessedMessageEvent(
                message_id=event.message_id,
                event_type=MessageEventType.UPDATE,
                user_id=event.user_id,
                chat_id=event.chat_id,
                message_body=event.new_message_body,
                original_timestamp=event.timestamp,
                processed_at=datetime.utcnow(),
                status="error",
            )

    async def process_delete_message(
        self, event: DeleteMessageEvent
    ) -> ProcessedMessageEvent:
        """
        Обрабатывает удаление сообщения.

        Args:
            event: Событие удаления сообщения

        Returns:
            Обработанное событие
        """
        logger.info(
            f"Processing DELETE message event: message={event.message_id}, user={event.user_id}"
        )

        # Валидация
        await self._validate_message_event(event)

        try:
            message_uuid = UUID(event.message_id)

            # Проверяем существование сообщения
            existing_message = await self.message_repo.get_message_by_id(message_uuid)
            if not existing_message:
                raise ValueError(f"Message not found: {event.message_id}")

            # Проверяем права на удаление
            if str(existing_message.creator_id) != event.user_id:
                raise PermissionError(
                    f"User {event.user_id} cannot delete message {event.message_id}"
                )

            # Удаляем сообщение
            await self.message_repo.delete_message(message_uuid)

            logger.info(f"Message deleted successfully: {message_uuid}")

            return ProcessedMessageEvent(
                message_id=event.message_id,
                event_type=MessageEventType.DELETE,
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
                event_type=MessageEventType.DELETE,
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
        """
        Валидирует событие сообщения.

        Args:
            event: Событие для валидации

        Raises:
            ValueError: Если валидация не прошла
        """
        # Проверяем существование чата
        chat_exists = await self.chat_service.validate_chat_exists(event.chat_id)
        if not chat_exists:
            raise ValueError(f"Chat not found: {event.chat_id}")

        # Проверяем, что пользователь является участником чата
        user_in_chat = await self.chat_service.validate_user_in_chat(
            event.chat_id, event.user_id
        )
        if not user_in_chat:
            raise ValueError(
                f"User {event.user_id} is not a member of chat {event.chat_id}"
            )

    def _validate_message_content(self, content: str) -> str:
        """
        Валидирует и очищает контент сообщения.

        Args:
            content: Контент сообщения

        Returns:
            Очищенный контент

        Raises:
            ValueError: Если контент невалиден
        """
        # Убираем лишние пробелы
        cleaned = content.strip()

        # Проверяем длину
        if len(cleaned) == 0:
            raise ValueError("Message content cannot be empty")

        if len(cleaned) > 10000:
            raise ValueError("Message content is too long (max 10000 characters)")

        # Можно добавить фильтрацию нецензурных слов, вредоносного контента и т.д.

        return cleaned
