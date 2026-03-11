from pydantic import BaseModel, ConfigDict, Field
from typing import Literal
from pydantic import model_validator
from uuid import UUID
from datetime import datetime


class Cookies(BaseModel):
    session_id: str


class GetQueryParams(BaseModel):
    limit: int = Field(00, gt=0, le=200)
    offset: int = Field(0, ge=0)
    model_config = ConfigDict(extra="ignore")


class LeagueRankCreate(BaseModel):
    """Модель для создания/обновления ранга"""

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
    def fix_division(self):
        if self.rank in ["master", "grandmaster", "challenger"]:
            self.division = 1
        return self


class RankRangeCreate(BaseModel):
    """Модель для создания диапазона рангов"""

    server: Literal["ru", "euw", "eune", "tr", "na"]
    min_rank: LeagueRankCreate
    max_rank: LeagueRankCreate


class HotFormCreate(BaseModel):
    """Модель для создания HotForm"""

    owner_id: UUID
    owner_type: Literal["group", "user"]
    rank_range: list[RankRangeCreate]
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = Field(
        default_factory=list
    )
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = Field(
        default_factory=list
    )
    description: str = Field(..., min_length=1, max_length=1000)


class HotFormUpdate(BaseModel):
    """Модель для обновления HotForm"""

    rank_range: list[RankRangeCreate] | None = None
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] | None = None
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] | None = None
    description: str | None = Field(None, min_length=1, max_length=1000)


class ColdFormCreate(BaseModel):
    """Модель для создания ColdForm"""

    owner_id: UUID
    rank_range: list[RankRangeCreate]
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = Field(
        default_factory=list
    )
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] = Field(
        default_factory=list
    )
    description: str = Field(..., min_length=1, max_length=1000)


class ColdFormUpdate(BaseModel):
    """Модель для обновления ColdForm"""

    rank_range: list[RankRangeCreate] | None = None
    my_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] | None = None
    looking_for_roles: list[Literal["top", "jg", "mid", "adc", "sup"]] | None = None
    description: str | None = Field(None, min_length=1, max_length=1000)
    status: Literal["active", "frozen"] | None = None


class InteractionCreate(BaseModel):
    """Модель для лайков/дизлайков"""

    user_id: UUID


class HotFormResponse(BaseModel):
    """Модель ответа с HotForm"""

    id: UUID
    owner_id: UUID
    owner_type: Literal["group", "user"]
    liked_by: list[UUID]
    disliked_by: list[UUID]
    created_at: datetime
    rank_range: list[RankRangeCreate]
    my_roles: list[str]
    looking_for_roles: list[str]
    description: str


class ColdFormResponse(BaseModel):
    """Модель ответа с ColdForm"""

    id: UUID
    owner_id: UUID
    liked_by: list[UUID]
    disliked_by: list[UUID]
    blocked_by: list[UUID]
    created_at: datetime
    rank_range: list[RankRangeCreate]
    my_roles: list[str]
    looking_for_roles: list[str]
    description: str
    status: Literal["active", "frozen"]
    updated_at: datetime
