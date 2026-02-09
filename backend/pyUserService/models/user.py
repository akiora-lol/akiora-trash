from beanie import Document
from pydantic import ConfigDict, Field, EmailStr, field_serializer
from uuid import UUID, uuid4
from typing import Literal
from datetime import datetime, UTC


def time_now():
    return datetime.now(tz=UTC)


def default_name():
    return f"user{int(time_now().timestamp())}"


def default_roles():
    return ["default"]


class User(Document):
    id: UUID = Field(default_factory=uuid4)
    email: EmailStr
    nickname: str = Field(default_factory=default_name)
    gender: Literal["male", "female"] | None = None
    age: int | None = Field(default=None, min=15)
    socials: dict | None = None
    roles: list[str] = Field(default_factory=default_roles)
    created_at: datetime = Field(default_factory=time_now)
    last_updated: datetime = Field(default_factory=time_now)

    # @field_serializer("id")
    # def serialize_id(self, id: UUID):
    #     return str(id)

    # @field_serializer("created_at")
    # def serialize_ca(self, dt: datetime):
    #     return dt.isoformat()

    # @field_serializer("last_activity")
    # def serialize_la(self, dt: datetime):
    #     return dt.isoformat()

    # @field_serializer("exipres_at")
    # def serialize_ea(self, dt: datetime):
    #     return dt.isoformat()

    model_config = ConfigDict(extra="ignore")

    class Settings:
        bson_encoders = {UUID: str}
        keep_nulls = False
