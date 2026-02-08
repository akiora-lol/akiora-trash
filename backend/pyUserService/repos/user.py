from uuid import UUID
from pydantic import EmailStr
from models.user import User


class UserRepo:
    @classmethod
    async def create_user(cls, email: EmailStr) -> User:
        existing = await User.find_one(User.email == email)
        if existing:
            return None
        user = User(email=email)
        await user.insert()
        return user

    @classmethod
    async def get_user_by_id(cls, user_id: UUID) -> User | None:
        return await User.get(user_id)

    @classmethod
    async def delete_user_by_id(cls, user_id: UUID) -> None:
        user = await cls.get_user_by_id(user_id)
        if user:
            await user.delete()

    @classmethod
    async def update_user(cls, id: UUID, update_dict) -> User | None:
        u = await cls.get_user_by_id(id)
        if not u:
            return None
        u = u.model_copy(update=update_dict)
        await u.save()
        return u
