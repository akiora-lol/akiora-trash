from uuid import UUID
from models.message import Message


class MessageRepo:
    async def create_message(
        self, chat_id: UUID, creator_id: UUID, content: str, ttl: int | None = None
    ) -> Message:
        message = Message(
            chat_id=chat_id, creator_id=creator_id, content=content, ttl=ttl
        )
        await message.insert()
        return message

    async def get_message_by_id(self, message_id: UUID) -> Message | None:
        return await Message.get(message_id)

    async def delete_message(self, message_id: UUID) -> None:
        message = await self.get_message_by_id(message_id)
        if message:
            await message.delete()

    async def update_message_content(
        self, message_id: UUID, new_content: str
    ) -> Message | None:
        message = await self.get_message_by_id(message_id)
        if message:
            message.content = new_content
            await message.save()
            return message
        return None

    async def update_message_status(
        self, message_id: UUID, new_status: str
    ) -> Message | None:
        message = await self.get_message_by_id(message_id)
        if message:
            message.status = new_status
            await message.save()
            return message
        return None

    async def get_messages_by_chat_id(self, chat_id: UUID) -> list[Message]:
        messages = await Message.find(Message.chat_id == chat_id).to_list()
        return messages

    async def get_messages_by_creator_id(self, creator_id: UUID) -> list[Message]:
        messages = await Message.find(Message.creator_id == creator_id).to_list()
        return messages

    async def get_all_messages(self) -> list[Message]:
        messages = await Message.find_all().to_list()
        return messages

    async def delete_messages_by_chat_id(self, chat_id: UUID) -> None:
        messages = await self.get_messages_by_chat_id(chat_id)
        for message in messages:
            await message.delete()

    async def delete_messages_by_creator_id(self, creator_id: UUID) -> None:
        messages = await self.get_messages_by_creator_id(creator_id)
        for message in messages:
            await message.delete()

    async def update_message_ttl(
        self, message_id: UUID, new_ttl: int | None
    ) -> Message | None:
        message = await self.get_message_by_id(message_id)
        if message:
            message.ttl = new_ttl
            await message.save()
            return message
        return None
