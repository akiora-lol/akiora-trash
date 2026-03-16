from datetime import UTC, date, datetime
from enum import Enum
from typing import Literal
from uuid import UUID, uuid4

from msgspec import Struct, field


def time_now() -> datetime:
    return datetime.now(tz=UTC)


Platform = Literal["vk", "tg", "ds", "yt", "tw"]


class Social(Struct):
    link: str
    hidden: bool = field(default=True)


class Birthday(Struct):
    day: date
    hidden: bool = field(default=True)


class Gender(str, Enum):
    UNKNOWN = "unknown"
    MALE = "male"
    FEMALE = "female"


class User(Struct):
    email: str
    id: str = field(default_factory=lambda: str(uuid4()))
    nickname: str = field(default="")
    bio: str = field(default="")
    gender: Gender = Gender.UNKNOWN
    birth_date: Birthday | None = None
    socials: dict[Platform, Social] = field(default_factory=dict)
    created_at: datetime = field(default_factory=time_now)
    last_updated: datetime = field(default_factory=time_now)


class UserCreate(Struct):
    email: str
    nickname: str | None = None
    bio: str | None = None
    gender: Gender = Gender.UNKNOWN
    birth_date: Birthday | None = None
    socials: dict[Platform, Social] | None = None


class UserUpdate(Struct):
    nickname: str | None = None
    bio: str | None = None
    gender: Gender | None = None
    birth_date: Birthday | None = None
    socials: dict[Platform, Social] | None = None


class UserResponse(Struct):
    id: str
    email: str
    nickname: str
    bio: str
    gender: Gender
    birth_date: Birthday | None
    socials: dict[Platform, Social]
    created_at: datetime
    last_updated: datetime
