from domain.models.user import User

from shared import MongoCommand


class UserCommandService:
    def __init__(self, command: MongoCommand):
        self._command_mongo = command

    async def create_user(self, user: User) -> str:

        return await self._command_mongo.create_one(user)

    async def update_user(self, user_id: str, data: dict) -> bool:

        return await self._command_mongo.update_one(user_id, data)

    async def delete_user(self, user_id: str) -> bool:
        return await self._command_mongo.delete_one(user_id)
