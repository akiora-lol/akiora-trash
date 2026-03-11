from typing import Literal
from beanie import Document
from pydantic import BaseModel, Field, model_validator
from uuid import UUID, uuid4
from pymongo import IndexModel, ASCENDING
from datetime import datetime, UTC


def time_now():
    return datetime.now(tz=UTC)


class LeagueRank(BaseModel):
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
    division: int = Field(1, ge=1, le=4)
    lp: int | None = Field(None, ge=0)

    @model_validator(mode="after")
    def fix(self):
        if self.rank in ["master", "grandmaster", "challenger"]:
            self.division = 1
        return self


class RankRange(BaseModel):
    server: Literal["ru", "euw", "eune", "tr", "na"]
    min_rank: LeagueRank
    max_rank: LeagueRank


class ShortForm(BaseModel):
    blocked_by: list[UUID] = Field(default_factory=list)
    rank_range: list[RankRange]
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = Field(
        default_factory=list
    )
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = Field(
        default_factory=list
    )
    description: str


class ColdForm(Document):
    id: UUID = Field(default_factory=uuid4)
    owner_id: UUID
    owner_type: Literal["user"] = "user"
    liked_by: list[UUID] = Field(default_factory=list)
    disliked_by: list[UUID] = Field(default_factory=list)
    blocked_by: list[UUID] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=time_now)
    rank_range: list[RankRange]
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = Field(
        default_factory=list
    )
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = Field(
        default_factory=list
    )
    description: str

    status: Literal["active", "frozen"]
    updated_at: datetime = Field(default_factory=time_now)
    history: list[ShortForm] = Field(default_factory=list)

    def short(self):
        return ShortForm(**self.model_dump())

    class Settings:
        bson_encoders = {UUID: str}
        keep_nulls = False
