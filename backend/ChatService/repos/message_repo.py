from uuid import UUID
from models.message import Message
from datetime import datetime, timedelta, UTC


class MessageRepo:
    async def create_message(
        self,
        chat_id: UUID,
        creator_id: UUID,
        body: str,
        ttl: int | None,
        spoiler: bool,
    ) -> Message:
        data = {
            k: v
            for k, v in locals().items()
            if k not in ["self", "ttl"] and v is not None
        }
        if ttl:
            data["expires_at"] = datetime.now(tz=UTC) + timedelta(seconds=ttl)

        msg = Message(**data)
        saved = await msg.save()
        return saved

    async def update_message_body(self, message_id, new_body):
        message = await Message.get(message_id)
        if message:
            previous = message.short()
            message.body = new_body
            message.history.append(previous)
            await message.save()
            return message
        return None

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

    async def get_messages_by_chat_id(
        self, chat_id: UUID, offset: int = 0, limit: int = 100
    ) -> list[Message]:
        messages = (
            await Message.find(Message.chat_id == chat_id)
            .skip(offset)
            .limit(limit)
            .sort(-Message.timestamp)  # - desc + asc
            .to_list()
        )
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
