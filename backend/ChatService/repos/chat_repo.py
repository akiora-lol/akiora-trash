from uuid import UUID
from models.chat import Chat


class ChatRepo:
    async def create_chat(self, creator_id: UUID, title: str) -> Chat:
        chat = Chat(creator_id=creator_id, title=title)
        await chat.insert()
        return chat

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
