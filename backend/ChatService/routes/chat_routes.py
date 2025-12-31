"""
Роуты для обработки событий чатов в RabbitMQ.
"""

import logging

from faststream.rabbit import RabbitRouter, RabbitQueue, RabbitExchange, ExchangeType
from faststream.annotations import Logger
from dishka.integrations.faststream import FromDishka, inject

from config.settings import settings
from schemas.events import CreateChatEvent
from services.chat_service import ChatService
from backend.ChatService.services.message_producer import MessageProducer

logger = logging.getLogger(__name__)

# Создаем роутер для чатов
chat_router = RabbitRouter()

# Декларируем exchange
chat_exchange = RabbitExchange(
    name=settings.rabbitmq_exchange_name,
    type=ExchangeType.DIRECT,
    durable=settings.rabbitmq_exchange_durable,
)

# Декларируем input queue для создания чатов
chat_input_queue = RabbitQueue(
    name=settings.rabbitmq_chat_input_queue,
    durable=settings.rabbitmq_chat_input_queue_durable,
    routing_key=settings.rabbitmq_chat_input_routing_key,
)


@chat_router.subscriber(
    queue=chat_input_queue,
    exchange=chat_exchange,
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

        # Публикуем обработанное событие
        await producer.publish_processed_chat(processed)

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
