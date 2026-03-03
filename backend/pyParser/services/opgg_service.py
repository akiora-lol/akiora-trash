from opgg.opgg import OPGG
from schemas.v1.summoner import (
    Summoner,
    TierInfo,
    PreviousSeason,
    LeagueStat,
    PlayerProfile,
    ChampionStat,
)
from opgg.params import By, Region, LangCode
from typing import List, Optional
import re


class OpggService:
    def __init__(self, opgg: OPGG):
        self.opgg = opgg

    async def _extract_icon_id(self, profile_image_url: str) -> Optional[int]:
        """Извлечение icon_id из URL"""
        match = re.search(r"profileIcon(\d+)\.jpg", profile_image_url)
        if match:
            return int(match.group(1))
        return None

    async def _parse_tier_info(self, tier_data: dict) -> TierInfo:
        """Парсинг информации о тире"""
        return TierInfo(
            tier=tier_data.get("tier"),
            division=tier_data.get("division"),
            lp=tier_data.get("lp"),
        )

    async def _parse_previous_seasons(
        self, previous_seasons_data: List[dict]
    ) -> List[PreviousSeason]:
        """Парсинг предыдущих сезонов (первые 5)"""
        previous_seasons = []
        smap = await self.opgg._get_season_meta_map_async(LangCode.ENGLISH)

        for season_data in previous_seasons_data[:5]:
            season_id = season_data.get("season_id")
            season_info = smap[int(season_id)]

            tier_data = season_data.get("tier_info", {})

            previous_seasons.append(
                PreviousSeason(
                    season_id=season_id,
                    season_name=str(season_info.display_value),
                    tier_info=await self._parse_tier_info(tier_data),
                )
            )

        return previous_seasons

    async def _parse_league_stats(
        self, league_stats_data: List[dict]
    ) -> List[LeagueStat]:
        """Парсинг лиговой статистики (только SOLORANKED и FLEXRANKED)"""
        league_stats = []

        for stat_data in league_stats_data:
            game_type = stat_data.get("game_type")
            if game_type in ["SOLORANKED", "FLEXRANKED"]:
                tier_data = stat_data.get("tier_info", {})

                league_stats.append(
                    LeagueStat(
                        game_type=game_type,
                        tier_info=await self._parse_tier_info(tier_data),
                        win=stat_data.get("win"),
                        lose=stat_data.get("lose"),
                    )
                )

        return league_stats

    async def _get_champ_name(self, id):
        x = await self.opgg.get_champion_by_async(By.ID, id)
        return x.name

    async def _parse_champion_stats(
        self, most_champions_data: dict
    ) -> List[ChampionStat]:
        """Парсинг статистики по чемпионам"""
        champion_stats = []
        champions_data = most_champions_data.get("champion_stats", [])

        for champ_data in champions_data:
            champ_id = champ_data.get("id")
            champ_name = await self._get_champ_name(champ_id)

            champion_stats.append(
                ChampionStat(
                    id=champ_id,
                    name=champ_name,
                    win=champ_data.get("win"),
                    lose=champ_data.get("lose"),
                    game_length_second=champ_data.get("game_length_second"),
                    kill=champ_data.get("kill"),
                    death=champ_data.get("death"),
                    assist=champ_data.get("assist"),
                    gold_earned=champ_data.get("gold_earned"),
                    minion_kill=champ_data.get("minion_kill"),
                )
            )

        return champion_stats

    async def _parse_summoner(self, summoner_data: dict) -> Summoner:
        """Парсинг данных саммонера"""
        return Summoner(
            sumid=summoner_data.get("summoner_id"),
            puuid=summoner_data.get("puuid"),
            game_name=summoner_data.get("game_name"),
            tagline=summoner_data.get("tagline"),
            icon_id=await self._extract_icon_id(
                str(summoner_data.get("profile_image_url", ""))
            ),
            previous_seasons=await self._parse_previous_seasons(
                summoner_data.get("previous_seasons", [])
            ),
            league_stats=await self._parse_league_stats(
                summoner_data.get("league_stats", [])
            ),
            most_champions=await self._parse_champion_stats(
                summoner_data.get("most_champions", {})
            ),
        )

    async def from_api(self, data: dict) -> PlayerProfile:
        """Преобразование данных из API в Pydantic модель"""
        region = data.get("region")
        summoner_data = data.get("summoner", {})

        return PlayerProfile(
            region=region, summoner=await self._parse_summoner(summoner_data)
        )

    async def get_user(self, name_tag: str, server: str) -> PlayerProfile:
        """
        Получение данных пользователя и преобразование в Pydantic модель

        Args:
            name_tag: имя и тег игрока (например, "Faker#KR1")
            server: сервер (например, "RU", "EUW", "KR")

        Returns:
            PlayerProfile: Pydantic модель с данными игрока
        """
        data = await self.opgg.search_async(name_tag, region=Region(server.upper()))

        # Берем первый результат поиска
        data = data[0]
        ret_data = await self.from_api(data.model_dump())
        # Преобразуем в Pydantic модель
        return ret_data
