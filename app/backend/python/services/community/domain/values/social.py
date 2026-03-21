from enum import Enum

from msgspec import Struct, field


class Platform(str, Enum):
    VK = "vk"
    DS = "ds"
    TG = "tg"
    YT = "yt"
    TW = "tw"


class Social(Struct):
    link: str
    hidden: bool = field(default=True)
