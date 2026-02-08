from beanie import Document
from pydantic import ConfigDict, Field, EmailStr
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

    model_config = ConfigDict(extra="ignore")

    class Settings:
        bson_encoders = {UUID: str}
        keep_nulls = False
