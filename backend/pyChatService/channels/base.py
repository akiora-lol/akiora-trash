from uuid import UUID
from faststream.rabbit import RabbitRouter
from faststream.annotations import Logger
from faststream.rabbit.annotations import RabbitMessage

from config.messaging import chat_exchange,form_queue,user_queue,form_exchange,user_exchange
from models import Chat,Message
from services.message import MessageService
from services.chat import ChatService
from schemas.v1.chat import CreateChat

router = RabbitRouter()



@router.subscriber(
    queue=form_queue,
    exchange=form_exchange,
)
async def handle_user_info(
    event: dict,
    logger: Logger,
    msg: RabbitMessage,
):
    logger.info(f"Received event {event}")

    try:
        uid1 = str(event.get("like_sender"))
        uid2 = str(event.get("form_creator"))
        # TODO
        # form matched -> both chatlists updated
        # if user is blocked, ignore likes on notification service
        # also if user is blocked mark chat as frozen and when its frozen no1 can type into it besides system
        # notification service builds notifications in redis, when they're done it sends them
        # listen to block user event to freeze
        # how to notify about likes? do i show profile? how do i construct them?
        # 
        if not all([uid1,uid2]):
            raise

     

        ce=CreateChat(owner_id=UUID(int=0),owner_type='system',type='private',status='active',allowed_users=[UUID(uid1),UUID(uid2)])
        chat=await ChatService().create_chat(ce)

        if chat:
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
