from typing import Literal
from msgspec import Struct


class CreateUser(Struct):
    email: str
    key: str


class EmailRequest(Struct):
    email: str


class SimpleUpdateRequest(Struct, omit_defaults=True):
    email: str | None = None
    gender: Literal["male", "female"] | None = None
    nickname: str | None = None
    age: int | None = None
