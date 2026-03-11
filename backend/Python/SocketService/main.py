from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from dishka import AsyncContainer
from dishka.integrations.fastapi import inject, FromDishka, setup_dishka
from faststream.redis.fastapi import RedisRouter
from loguru import logger

from settings import setup_logging, settings
from ioc import container
from managers import ConnectionManager
from handlers import MessageHandler
from notification import NotificationSubscriber


# Redis router
router = RedisRouter(settings.redis_url)


@router.subscriber(channel=settings.redis_notifications_channel)
async def handle_notification(
    message: dict,
    subscriber: FromDishka[NotificationSubscriber],
) -> None:
    """
    Обработчик сообщений из канала уведомлений.
    Получает уведомления из Redis pub/sub и рассылает пользователям.
    """
    await subscriber.handle(message)


@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "healthy",
    }


@inject
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    conn_manager: FromDishka[ConnectionManager],
    container: FromDishka[AsyncContainer],
):
    """
    WebSocket эндпоинт для подключения клиентов.
    
    SESSION-scope: ConnectionManager (одно соединение)
    REQUEST-scope: MessageHandler (каждое сообщение)
    """
    logger.info(f"Новое WebSocket соединение для пользователя {user_id}")

    # Подключение (SESSION-scope)
    await conn_manager.connect(websocket)

    try:
        # Основной цикл обработки сообщений
        while True:
            # Получение сообщения от клиента
            message_text = await websocket.receive_text()
            logger.debug(f"Получено сообщение от {user_id}: {message_text[:100]}...")

            # Обработка сообщения (REQUEST-scope)
            async with container() as request_container:
                message_handler: MessageHandler = await request_container.get(
                    MessageHandler,
                    user_id=user_id,
                    message_data=message_text,
                )

                # Обработка и отправка ответа
                result = await message_handler.process()
                await conn_manager.send(result)

    except WebSocketDisconnect:
        logger.info(f"Пользователь {user_id} отключился")
        await conn_manager.disconnect(websocket)
    except Exception as e:
        logger.exception(f"Ошибка в WebSocket соединении для {user_id}: {e}")
        await conn_manager.disconnect(websocket)


# Инициализация приложения
setup_logging()
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=router.lifespan_context,
)

setup_dishka(container, app)
app.include_router(router)

logger.info(f"{settings.app_name} v{settings.app_version} запущен")
