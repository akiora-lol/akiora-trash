from msgspec import Struct
from uuid import UUID
from datetime import datetime, timezone, date
from email_validator import validate_email, EmailNotValidError
from typing import Literal
from litestar.dto import DTOConfig
from litestar.dto.msgspec_dto import MsgspecDTO


class Role(Struct):
    resource_type: str
    access_level: int


Platform = Literal["vk", "tg", "ds", "yt", "tw", "sc"]


class Social(Struct):
    link: str
    hidden: bool = True


class Birthday(Struct):
    day: date
    hidden: bool = True


def ensure_utc(dt: datetime) -> datetime:

    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    else:
        return dt.astimezone(timezone.utc)


class User(Struct):
    id: UUID
    email: str
    nickname: str
    created_at: datetime
    last_updated: datetime
    avatar: str | None = None
    bio: str | None = None
    gender: Literal["male", "female"] | None = None
    birth_date: Birthday | None = None
    socials: dict[Platform, Social] | None = None
    roles: dict[UUID, Role] | None = None

    def __post_init__(self):
        try:
            valid = validate_email(self.email)
            self.email = valid.normalized
        except EmailNotValidError as e:
            raise ValueError(f"Invalid email: {e}")

        self.created_at = ensure_utc(self.created_at)
        self.last_updated = ensure_utc(self.last_updated)


class PublicUserDTO(MsgspecDTO[User]):
    config = DTOConfig(
        exclude={"roles"},
        rename_strategy="camel",
    )
