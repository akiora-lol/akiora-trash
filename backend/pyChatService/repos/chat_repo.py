from typing import Literal
from uuid import UUID
from models.chat import Chat
from beanie.operators import Size, All


class ChatRepo:
    async def create_chat(
        self,
        owner_id: UUID,
        owner_type: Literal["system", "club", "tournament"],
        type: Literal["private", "public"],
        allowed_users: list,
    ) -> Chat:
        data = {k: v for k, v in locals().items() if k != "self" and v is not None}
        chat = Chat(**data)
        exists = await Chat.find(
            All(Chat.allowed_users, allowed_users), Size(Chat.allowed_users, 2)
        ).to_list()

        if exists:
            print(exists)
            if len(exists) != 1:
                raise  # Criminal error needs to be manually fixed
            return exists[0]
        saved = await chat.save()
        return saved

    async def get_chat_by_id(self, chat_id: UUID) -> Chat | None:
        return await Chat.get(chat_id)

    async def delete_chat(self, chat_id: UUID) -> None:
        chat = await self.get_chat_by_id(chat_id)
        if chat:
            await chat.delete()

    async def update_chat_title(self, chat_id: UUID, new_title: str) -> Chat | None:
        chat = await self.get_chat_by_id(chat_id)
        if chat:
            chat.title = new_title
            await chat.save()
            return chat
        return None
