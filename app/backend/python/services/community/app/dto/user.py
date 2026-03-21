from datetime import datetime

from domain.models import Birthday, Gender, Platform, Social
from msgspec import Struct, to_builtins


class DTO(Struct):
    def as_dict(self) -> dict:
        return to_builtins(self)


class UserCreate(DTO):
    email: str
    nickname: str | None = None
    bio: str | None = None
    gender: Gender | None = None
    birth_date: Birthday | None = None
    personal_socials: dict[Platform, Social] | None = None


class UserUpdate(DTO):
    nickname: str | None = None
    bio: str | None = None
    gender: Gender | None = None
    birth_date: Birthday | None = None
    personal_socials: dict[Platform, Social] | None = None


class UserResponse(DTO):
    id: str
    email: str
    nickname: str
    bio: str
    gender: Gender
    birth_date: Birthday | None
    personal_socials: dict[Platform, Social]
    created_at: datetime
    last_updated: datetime
