from beanie import Document
from pydantic import Field
from uuid import UUID, uuid4
from pymongo import IndexModel, ASCENDING
from datetime import datetime, UTC


def time_now():
    return datetime.now(tz=UTC)


class HotForm(Document):
    id: UUID = Field(default_factory=uuid4)
    creator_id: UUID
    liked_by: list[UUID] = Field(default_factory=list)
    disliked_by: list[UUID] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=time_now)
    
    


    class Settings:
        bson_encoders = {UUID: str}
        keep_nulls = False
        indexes = [IndexModel([("created_at", ASCENDING)], expireAfterSeconds=900)]
