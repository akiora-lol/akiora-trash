import logging
from typing import Union

from faststream.rabbit import RabbitRouter
from faststream.annotations import Logger
from dishka.integrations.faststream import FromDishka, inject

from config.settings import settings
from schemas import (
    CreateMessageEvent,
    UpdateMessageEvent,
    DeleteMessageEvent,
)
from services.message_service import MessageService
from services.message_producer import MessageProducer
import messaging

logger = logging.getLogger(__name__)


message_router = RabbitRouter()


@message_router.subscriber(
    queue=messaging.message_queue,
    exchange=messaging.chat_exchange,
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
        if event_type == "create":
            processed = await message_service.process_create_message(message)
        elif event_type == "update":
            processed = await message_service.process_update_message(message)
        elif event_type == "delete":
            processed = await message_service.process_delete_message(message)
        else:
            logger.error(f"Unknown event type: {event_type}")
            raise ValueError(f"Unknown event type: {event_type}")

        # TODO uncomment when ws done
        # await producer.publish_processed_message(processed)

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


@message_router.subscriber(f"{settings.rabbit_settings.message_input_queue}.dlq")
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
