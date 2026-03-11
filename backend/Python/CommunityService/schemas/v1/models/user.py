from msgspec import Struct, field
from uuid import UUID
from datetime import datetime, timezone, date
from typing import Literal


class Role(Struct):
    resource_type: str
    access_level: int


Platform = Literal[
    "vk",
    "tg",
    "ds",
    "yt",
    "tw",
]


class Social(Struct):
    link: str
    hidden: bool = True


class Birthday(Struct):
    day: date
    hidden: bool = True


def ensure_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class User(Struct):
    id: UUID
    email: str
    avatar: str
    nickname: str
    created_at: datetime = field(default_factory=lambda: ensure_utc(datetime.now()))
    last_updated: datetime = field(default_factory=lambda: ensure_utc(datetime.now()))
    bio: str | None = None
    gender: Literal["male", "female"] | None = None
    birth_date: Birthday | None = None
    socials: dict[Platform, Social] | None = None
    roles: dict[UUID, Role] | None = None
