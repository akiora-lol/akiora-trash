from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
import re


class TierInfo(BaseModel):
    """Модель для информации о тире"""

    tier: Optional[str] = None
    division: Optional[int] = None
    lp: Optional[int] = None


class PreviousSeason(BaseModel):
    """Модель для предыдущего сезона"""

    season_id: int
    season_name: Optional[str] = None
    tier_info: TierInfo


class LeagueStat(BaseModel):
    """Модель для лиговой статистики"""

    game_type: str
    tier_info: TierInfo
    win: Optional[int] = None
    lose: Optional[int] = None


class ChampionStat(BaseModel):
    """Модель для статистики по чемпиону"""

    id: int
    name: Optional[str] = None
    win: Optional[int] = None
    lose: Optional[int] = None
    game_length_second: Optional[int] = None
    kill: Optional[int] = None
    death: Optional[int] = None
    assist: Optional[int] = None
    gold_earned: Optional[int] = None
    minion_kill: Optional[int] = None


class Summoner(BaseModel):
    """Модель для саммонера"""

    sumid: str
    puuid: str
    game_name: str
    tagline: str
    icon_id: Optional[int] = None
    previous_seasons: List[PreviousSeason] = Field(default_factory=list)
    league_stats: List[LeagueStat] = Field(default_factory=list)
    most_champions: List[ChampionStat] = Field(default_factory=list)


class PlayerProfile(BaseModel):
    """Основная модель профиля игрока"""

    region: str
    summoner: Summoner
