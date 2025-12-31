from beanie import Document
from pydantic import Field
from uuid import UUID, uuid4
from typing import List, Literal
from datetime import datetime


class Chat(Document):
    id: UUID = Field(default_factory=uuid4)
    creator_id: UUID
    title: str = Field(min_length=1, max_length=100)
    chat_type: Literal["public", "private"] = Field(
        default="public", description="Chat type: public or private"
    )
    allowed_users: List[UUID] = Field(
        default_factory=list, description="List of allowed users for private chats"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        bson_encoders = {UUID: str}
        keep_nulls = False
