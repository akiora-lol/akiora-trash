from msgspec import Struct


class GetUser(Struct):
    email: str
    action: str = "get"
