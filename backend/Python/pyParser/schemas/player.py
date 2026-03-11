from typing import List, Optional
from pydantic import BaseModel, Field


class ChampionStats(BaseModel):
    position: str = Field(default="")
    champion: str = Field(default="")
    wins: str = Field(default="")
    losses: str = Field(default="")
    win_rate: str = Field(default="")
    kda_ratio: str = Field(default="")
    kda: str = Field(default="")
    laning: str = Field(default="")
    damage_per_minute: str = Field(default="")
    damage_share_ratio: str = Field(default="")
    wards_score: str = Field(default="")
    wards_control: str = Field(default="")
    cs: str = Field(default="")
    cs_per_minute: str = Field(default="")
    gold: str = Field(default="")
    gold_per_minute: str = Field(default="")
    double_kills: str = Field(default="")
    triple_kills: str = Field(default="")
    quadra_kills: str = Field(default="")
    penta_kills: str = Field(default="")


class RankedStats(BaseModel):
    current_rank: str = Field(default="")
    current_lp: str = Field(default="")
    win_loss: str = Field(default="")
    win_rate: str = Field(default="")
    best_rank: str = Field(default="")
    best_lp: str = Field(default="")
    icon_id: Optional[int] = Field(default=None)


class SummonerStats(BaseModel):
    solo_queue: Optional[RankedStats] = Field(default=None)
    flex_queue: Optional[RankedStats] = Field(default=None)
    champion_stats: List[ChampionStats] = Field(default_factory=list)


class Account(BaseModel):
    name: str
    tag: str
    server: str


class GameData(BaseModel):
    account: Account
    stats: SummonerStats
