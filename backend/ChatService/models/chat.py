from beanie import Document
from pydantic import Field
from uuid import UUID, uuid4


class Chat(Document):
    id: UUID = Field(default_factory=uuid4)
    creator_id: UUID
    title: str = Field(min_length=1, max_length=100)

    class Settings:
        bson_encoders = {UUID: str}
        keep_nulls = False
