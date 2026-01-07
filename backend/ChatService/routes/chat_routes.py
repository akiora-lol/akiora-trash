"""
Роуты для обработки событий чатов в RabbitMQ.
"""

import logging

from faststream.rabbit import RabbitRouter
from faststream.annotations import Logger
from dishka.integrations.faststream import FromDishka, inject
import messaging


from schemas import CreateChatEvent
from services.chat_service import ChatService
from services.message_producer import MessageProducer

logger = logging.getLogger(__name__)


chat_router = RabbitRouter()


@chat_router.subscriber(
    queue=messaging.chat_queue,
    exchange=messaging.chat_exchange,
)
@inject
async def handle_create_chat_event(
    event: CreateChatEvent,
    logger: Logger,
    chat_service: FromDishka[ChatService],
    producer: FromDishka[MessageProducer],
):
    """
    Обработчик событий создания чата из input очереди.
    """
    logger.info(
        f"Received CREATE chat event from user {event.creator_id}: "
        f"title='{event.title}', type={event.chat_type}"
    )

    try:
        # Обрабатываем создание чата
        processed = await chat_service.process_create_chat(event)

        logger.info(
            f"Successfully processed CREATE chat event: "
            f"chat_id={processed.chat_id}, status={processed.status}"
        )

    except Exception as e:
        logger.error(
            f"Error processing CREATE chat event from user {event.creator_id}: {str(e)}",
            exc_info=True,
        )
        raise
