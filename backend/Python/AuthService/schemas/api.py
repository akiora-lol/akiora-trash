from pydantic import BaseModel, Field, EmailStr, ConfigDict
from uuid import UUID
from typing import Literal


class Cookie(BaseModel):
    sid: str | None = None
    cvid: str | None = None
    email: EmailStr | None = None
    model_config = ConfigDict(extra="ignore")


class LoginInitRequest(BaseModel):
    email: EmailStr


class LoginFInishRequest(BaseModel):
    code: str = Field(..., max_length=6, min_length=6)


SocialKey = Literal["vk", "tg", "ds", "yt", "tw", "sc"]


class Social(BaseModel):
    type: Literal["personal", "public"]
    link: str
    hidden: bool = Field(default=False)


class User(BaseModel):
    id: UUID
    email: EmailStr
    nickname: str
    gender: Literal["male", "female"] | None = None
    age: int | None = Field(default=None, min=15)
    socials: dict[SocialKey, list[Social]] = Field(default_factory=dict)
    roles: list[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class AuthResponse(BaseModel):
    user: User
    authenticated: bool
