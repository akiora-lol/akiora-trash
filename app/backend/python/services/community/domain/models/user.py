from datetime import datetime
from uuid import uuid4

from msgspec import Struct, field
from pydantic import EmailStr, TypeAdapter

from services.community.domain.exceptions.user import UserException

from ..utils import time_now_utc
from ..values import Birthday, Gender, Platform, Social

email_validator = TypeAdapter(EmailStr)


class User(Struct):
    email: str
    id: str = field(default_factory=lambda: str(uuid4()))
    nickname: str = field(default_factory=lambda: f"user_{time_now_utc()}")
    bio: str = field(default="")
    gender: Gender = field(default_factory=Gender.default)
    birth_date: Birthday = field(default_factory=Birthday.default)
    personal_socials: dict[Platform, Social] = field(default_factory=dict)
    created_at: datetime = field(default_factory=time_now_utc)
    last_updated: datetime = field(default_factory=time_now_utc)

    def __post_init__(self):
        try:
            email = email_validator.validate_python(self.email)
            self.email = email
        except:
            raise UserException("email validation failed")

    @classmethod
    def create(
        cls,
        email: str,
        nickname: str | None,
        bio: str | None,
        gender: Gender | None,
        birth_date: Birthday | None,
        personal_socials: dict[Platform, Social] | None,
    ) -> "User":

        user = User(email=email)
        if nickname:
            user.nickname = nickname
        if bio:
            user.bio = bio
        if gender:
            user.gender = gender
        if birth_date:
            user.birth_date = birth_date
        if personal_socials:
            user.personal_socials = personal_socials
        return user
