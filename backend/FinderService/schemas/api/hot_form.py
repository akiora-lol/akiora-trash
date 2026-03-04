from msgspec import Struct, field
from uuid import UUID
from datetime import datetime
from typing import Literal


class LeagueRank(Struct):
    rank: Literal[
        "iron",
        "bronze",
        "silver",
        "gold",
        "platinum",
        "emerald",
        "diamond",
        "master",
        "grandmaster",
        "challenger",
    ]
    division: int = field(default=1)
    lp: int | None = field(default=None)


class RankRange(Struct):
    server: Literal["ru", "euw", "eune", "tr", "na"]
    min_rank: LeagueRank
    max_rank: LeagueRank


class HotFormCreate(Struct):
    owner_id: UUID
    owner_type: Literal["group", "user"]
    rank_range: list[RankRange]
    description: str
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = field(
        default_factory=list
    )
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = field(
        default_factory=list
    )


class HotFormUpdate(Struct):
    rank_range: list[RankRange] | None = field(default=None)
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] | None = field(
        default=None
    )
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] | None = field(
        default=None
    )
    description: str | None = field(default=None)


class HotFormResponse(Struct):
    id: UUID
    owner_id: UUID
    owner_type: Literal["group", "user"]
    created_at: datetime
    rank_range: list[RankRange]
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]]
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]]
    description: str
    liked_by: list[UUID] = field(default_factory=list)
    disliked_by: list[UUID] = field(default_factory=list)


class HotFormListResponse(Struct):
    items: list[HotFormResponse]
    total: int
