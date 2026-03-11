from faststream.redis import RedisBroker
from models.user import User
from uuid import UUID
from loguru import logger


class UserService:
    def __init__(self, redis_broker: RedisBroker):
        self.redis = redis_broker
        logger.debug("UserService initialized")

    async def handle_rpc(self, msg: dict):
        logger.info("Handling RPC request: {msg}", msg=msg)
        if msg.get("action") == "get":
            if mail := msg.get("email"):
                logger.debug("Fetching user by email: {email}", email=mail)
                us = await self.get_user_by_email(mail)
                result = us.model_dump()
                logger.info("Returning user data: {data}", data=result)
                return result
        logger.warning("Unknown RPC action: {action}", action=msg.get("action"))
        raise ValueError(f"Unknown action: {msg.get('action')}")

    async def get_user_by_id(self, id: str | UUID):
        logger.debug("Fetching user by ID: {id}", id=id)
        data = await User.get(id)
        if data:
            logger.info("User found by ID: {id}", id=id)
        else:
            logger.warning("User not found by ID: {id}", id=id)
        return data

    async def get_user_by_email(self, email: str):
        logger.debug("Fetching user by email: {email}", email=email)
        data = await User.find_one(User.email == email)
        if not data:
            logger.info("User not found by email: {email}, creating new user", email=email)
            data = User(email=email)
            await data.save()
            logger.info("New user created with email: {email}", email=email)
        else:
            logger.info("User found by email: {email}", email=email)
        return data
