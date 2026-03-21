from datetime import date

from msgspec import Struct, field


class Birthday(Struct):
    day: date
    hidden: bool = field(default=True)

    @classmethod
    def default(cls) -> "Birthday":
        return cls(day=date.min, hidden=True)
