from shared import MongoCommand
from models.user import User, UserCreate, UserUpdate


class UserCommandService:
    def __init__(self, command: MongoCommand):
        self._command = command

    async def create_user(self, user: UserCreate) -> str:
        user_data = User(
            email=user.email,
            nickname=user.nickname or "",
            bio=user.bio or "",
            gender=user.gender,
            birth_date=user.birth_date,
            socials=user.socials or {},
        )
        return await self._command.create_one(user_data)

    async def update_user(self, user_id: str, data: UserUpdate) -> bool:
        update_data = {}
        if data.nickname is not None:
            update_data["nickname"] = data.nickname
        if data.bio is not None:
            update_data["bio"] = data.bio
        if data.gender is not None:
            update_data["gender"] = data.gender.value
        if data.birth_date is not None:
            update_data["birth_date"] = data.birth_date
        if data.socials is not None:
            update_data["socials"] = data.socials
        if update_data:
            update_data["last_updated"] = User._field_defaults["last_updated"]()
        return await self._command.update_one(user_id, update_data)

    async def delete_user(self, user_id: str) -> bool:
        return await self._command.delete_one(user_id)
