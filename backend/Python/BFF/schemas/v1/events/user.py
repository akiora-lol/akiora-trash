from msgspec import Struct


class CreateUser(Struct):
    email: str
