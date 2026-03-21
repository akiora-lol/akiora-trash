from enum import Enum


class Gender(str, Enum):
    UNKNOWN = "unknown"
    MALE = "male"
    FEMALE = "female"

    @classmethod
    def default(cls) -> "Gender":
        return cls.UNKNOWN
