from faststream.rabbit import RabbitRouter
from faststream.annotations import Logger
from models.session_data import SessionData
from config.messaging import user_exchange, auth_user_info_queue
from faststream.rabbit.annotations import RabbitMessage
from services.session import SessionService
from uuid import UUID

router = RabbitRouter()


@router.subscriber(
    queue=auth_user_info_queue,
    exchange=user_exchange,
)
async def handle_user_info(
    event: dict,
    msg: RabbitMessage,
    logger: Logger,
):
    """
    Обработчик событий создания чата из input очереди.
    """
    logger.info(f"Received event{event}")

    try:
        ss = SessionService()
        upd = await ss.update_session_user_info(UUID(event["sid"]), event)

        logger.info(f"Successfully processed user event: {event}")
        if isinstance(upd, SessionData):
            logger.info(f"New session : {upd.model_dump()}")
        await msg.ack()

    except Exception as e:
        logger.error(
            f"Error processing CREATE chat event from user {event['id']}: {str(e)}"
        )
        await msg.reject()
