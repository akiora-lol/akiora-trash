from faststream.rabbit import RabbitRouter
from faststream.annotations import Logger
from faststream.rabbit.annotations import RabbitMessage

from config.messaging import user_exchange, auth_exchange, session_queue
from models.user import User
from repos.user import UserRepo

router = RabbitRouter()


@router.subscriber(queue="user_rpc")
async def handle_rpc_request(event: dict, logger: Logger):
    logger.info(f"RPC Received {event}")
    return 333


@router.publisher(exchange=user_exchange, routing_key="user.info.public")
@router.subscriber(
    queue=session_queue,
    exchange=auth_exchange,
)
async def handle_user_info(
    event: dict,
    logger: Logger,
    msg: RabbitMessage,
):
    logger.info(f"Received event {event}")

    try:
        email = event.get("email")
        sid = event.get("sid")
        if not email:
            raise ValueError("No email in event")

        user = await User.find_one(User.email == email)

        if user:
            user_data = user.model_dump()
            user_data["sid"] = sid
            await msg.ack()
            return user_data
        else:
            user = await UserRepo.create_user(email)
            user_data = user.model_dump()
            user_data["sid"] = sid
            await msg.ack()
            return user_data

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        await msg.reject()
