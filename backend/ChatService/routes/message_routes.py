"""
Роуты для обработки событий сообщений в RabbitMQ.
"""

import logging
from typing import Union

from faststream.rabbit import RabbitRouter, RabbitQueue, RabbitExchange, ExchangeType
from faststream.annotations import Logger
from dishka.integrations.faststream import FromDishka, inject

from config.settings import settings
from schemas.events import (
    CreateMessageEvent,
    UpdateMessageEvent,
    DeleteMessageEvent,
    MessageEventType,
)
from services.message_service import MessageService
from backend.ChatService.services.message_producer import MessageProducer

logger = logging.getLogger(__name__)


message_router = RabbitRouter()


chat_exchange = RabbitExchange(
    name=settings.rabbitmq_exchange_name,
    type=ExchangeType.DIRECT,
    durable=settings.rabbitmq_exchange_durable,
)


input_queue = RabbitQueue(
    name=settings.rabbitmq_input_queue,
    durable=settings.rabbitmq_input_queue_durable,
    routing_key=settings.rabbitmq_input_routing_key,
)


@message_router.subscriber(
    queue=input_queue,
    exchange=chat_exchange,
)
@inject
async def handle_message_event(
    message: Union[CreateMessageEvent, UpdateMessageEvent, DeleteMessageEvent],
    logger: Logger,
    message_service: FromDishka[MessageService],
    producer: FromDishka[MessageProducer],
):
    event_type = message.event_type

    logger.info(
        f"Received {event_type} event from user {message.user_id} "
        f"in chat {message.chat_id}"
    )

    try:
        # Обрабатываем событие в зависимости от типа
        if event_type == MessageEventType.CREATE:
            processed = await message_service.process_create_message(message)
        elif event_type == MessageEventType.UPDATE:
            processed = await message_service.process_update_message(message)
        elif event_type == MessageEventType.DELETE:
            processed = await message_service.process_delete_message(message)
        else:
            logger.error(f"Unknown event type: {event_type}")
            raise ValueError(f"Unknown event type: {event_type}")

        await producer.publish_processed_message(processed)

        logger.info(
            f"Successfully processed {event_type} event: "
            f"message_id={processed.message_id}, status={processed.status}"
        )

    except Exception as e:
        logger.error(
            f"Error processing {event_type} event from user {message.user_id} "
            f"in chat {message.chat_id}: {str(e)}",
            exc_info=True,
        )
        # Можно добавить логику отправки в DLQ или повторную обработку
        raise


@message_router.subscriber(f"{settings.rabbitmq_input_queue}.dlq")
@inject
async def handle_dead_letter_queue(
    message: Union[CreateMessageEvent, UpdateMessageEvent, DeleteMessageEvent],
    logger: Logger,
):
    """
    Обработчик для Dead Letter Queue.
    Логирует сообщения, которые не удалось обработать.
    """
    logger.warning(
        f"Message in DLQ: type={message.event_type}, "
        f"user={message.user_id}, chat={message.chat_id}"
    )
    # Здесь можно добавить логику для обработки неудачных сообщений:
    # - сохранение в БД для ручной обработки
    # - отправка уведомления админам
    # - повторная попытка обработки
