import re
import requests
from typing import Optional, List
from lxml import html
from urllib.parse import urlparse, urlunparse
from schemas.player import (
    ChampionStats as ChampionStats,
    RankedStats as RankedStats,
    SummonerStats as SummonerStats,
)


class OpGgStatsParser:
    def __init__(self, headers: Optional[dict] = None):
        self.headers = headers or {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def parse_from_server_name_tag(
        self, server: str, name: str, tag: str
    ) -> SummonerStats:
        return self.parse_from_url(
            f"https://op.gg/en/lol/summoners/{server}/{name}-{tag}"
        )

    def parse_from_url(self, url: str) -> SummonerStats:
        parsed_url = urlparse(url)
        print(parsed_url)
        bom = parsed_url.path.split("/")[-2:]

        server = bom[0]
        nametag = bom[1]
        name = nametag.split("-")[0]
        tag = nametag.split("-")[1]

        english_url = ""
        if any(x in parsed_url.netloc for x in ["op.gg", "leagueofgraphs"]):
            english_url = f"https://op.gg/en/lol/summoners/{server}/{name}-{tag}"

        main_doc = self._fetch_html(english_url)

        champions_url = self._generate_champions_url(english_url)

        champs_doc = self._fetch_html(champions_url)

        return self._parse_stats(main_doc, champs_doc)

    def _fetch_html(self, url: str) -> html.HtmlElement:
        """Загружает HTML страницу и возвращает lxml элемент"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            # Декодируем с правильной кодировкой
            response.encoding = "utf-8"

            # Проверяем, не перенаправляет ли нас на другую страницу
            final_url = response.url
            if final_url != url:
                print(f"Перенаправлено с {url} на {final_url}")

            return html.fromstring(response.content)
        except requests.RequestException as e:
            raise Exception(f"Ошибка при загрузке страницы {url}: {str(e)}")

    def _generate_champions_url(self, url: str) -> str:
        parsed_url = urlparse(url)
        path = parsed_url.path

        path_parts = path.strip("/").split("/")

        if (
            len(path_parts) >= 5
            and path_parts[0] == "lol"
            and path_parts[1] == "summoners"
        ):
            path_parts.insert(2, "champions")
            new_path = "/" + "/".join(path_parts)
            return urlunparse(
                (
                    parsed_url.scheme,
                    parsed_url.netloc,
                    new_path,
                    parsed_url.params,
                    parsed_url.query,
                    parsed_url.fragment,
                )
            )

        return url.rstrip("/") + "/champions"

    def _parse_stats(
        self, doc: html.HtmlElement, champs: html.HtmlElement
    ) -> SummonerStats:
        """Основной метод для парсинга статистики из HTML элементов"""
        stats = SummonerStats()

        has_solo_queue = self._check_queue_exists(doc, 1)
        has_flex_queue = self._check_queue_exists(doc, 2)

        # Парсим статистику
        if has_solo_queue:
            stats.solo_queue = self._parse_ranked_stats(doc, 1)

        if has_flex_queue:
            stats.flex_queue = self._parse_ranked_stats(doc, 2)

        # Парсим статистику по чемпионам
        stats.champion_stats = self._parse_champion_stats(champs)

        return stats

    def _check_queue_exists(self, doc: html.HtmlElement, queue_section: int) -> bool:
        """Проверяет наличие секции с рейтингом"""
        queue_type = "Solo/Duo" if queue_section == 1 else "Flex"
        xpath = f"//aside/section[{queue_section}]//span[text()='Ranked {queue_type}']"
        return len(doc.xpath(xpath)) > 0

    def _parse_ranked_stats(
        self, doc: html.HtmlElement, queue_section: int
    ) -> RankedStats:
        """Парсит статистику ранговой очереди"""
        queue_type = "Solo/Duo" if queue_section == 1 else "Flex"
        stats = RankedStats()

        # Текущий ранг
        rank_node = doc.xpath(f"//aside/section[{queue_section}]//strong")
        if rank_node:
            stats.current_rank = rank_node[0].text.strip() if rank_node[0].text else ""

        # Текущие LP - оригинальный XPath из C# кода
        queue_condition = f"count(//aside/section[{queue_section}]/div[1]/div//span[text()='Ranked {queue_type}']) > 0"
        lp_xpath = f"//aside/section[{queue_section}]/div[2]/div/div[1]/div[1]/div/span[{queue_condition}]/text()[1]"
        lp_nodes = doc.xpath(lp_xpath)
        if lp_nodes and lp_nodes[0].strip():
            stats.current_lp = lp_nodes[0].strip()

        # Win/Loss
        wl_nodes = doc.xpath(
            f"//aside/section[{queue_section}]/div[2]/div/div[1]/div[2]/span[1]/text()"
        )
        if wl_nodes:
            stats.win_loss = " ".join([n.strip() for n in wl_nodes if n.strip()])

        # Win Rate
        win_rate_nodes = doc.xpath(
            f"//aside/section[{queue_section}]/div[2]/div/div[1]/div[2]/span[2]/text()"
        )
        if win_rate_nodes:
            stats.win_rate = " ".join([n.strip() for n in win_rate_nodes if n.strip()])

        # Иконка профиля - ищем по alt атрибуту
        # Внимание: в C# коде ищется конкретный summoner name 'ABDUL THE MENACE#meow'
        # В реальном использовании нужно искать динамически или убрать эту проверку
        icon_nodes = doc.xpath("//img[contains(@alt, '#')]")
        if icon_nodes:
            for icon in icon_nodes:
                alt_text = icon.get("alt", "")
                if alt_text:
                    src = icon.get("src", "")
                    if src:
                        match = re.search(r"profileIcon(\d+)\.jpg", src)
                        if match and match.group(1).isdigit():
                            stats.icon_id = int(match.group(1))
                            break

        # Best LP
        best_lp_nodes = doc.xpath(
            f"//aside/section[{queue_section}]/div[2]/div/div[2]/div//span/text()"
        )
        if best_lp_nodes:
            stats.best_lp = " ".join([n.strip() for n in best_lp_nodes if n.strip()])

        # Best Rank
        best_rank_nodes = doc.xpath(
            f"//aside/section[{queue_section}]/div[2]/div/div[2]/div//strong/text()"
        )
        if best_rank_nodes:
            stats.best_rank = " ".join(
                [n.strip() for n in best_rank_nodes if n.strip()]
            )

        return stats

    def _parse_champion_stats(self, doc: html.HtmlElement) -> List[ChampionStats]:
        """Парсит статистику по чемпионам"""
        champion_stats = []

        # Пробуем несколько XPath, так как структура может отличаться
        xpath_options = [
            "//section[2]/div/table/tbody/tr",
            "//div[@class='content-section']/table/tbody/tr",
            "//table/tbody/tr[contains(@class, 'Row')]",
        ]

        rows = None
        for xpath in xpath_options:
            rows = doc.xpath(xpath)
            if rows:
                break

        if not rows:
            print("Не найдены строки с статистикой чемпионов")
            return champion_stats

        for i, row in enumerate(rows):
            # Пропускаем строки как в C# коде
            if i == 0 or i == 2:
                continue
            if i > 11:
                break

            stats = ChampionStats()

            # Извлекаем данные из каждой ячейки
            stats.position = self._get_cell_text(row, "td[1]")
            stats.champion = self._get_cell_text(row, "td[2]/div/strong")

            # Wins
            wins_nodes = row.xpath("td[3]/div/div/div[1]/span/text()[1]")
            if wins_nodes:
                stats.wins = self._extract_number(wins_nodes[0])

            # Losses
            losses_nodes = row.xpath("td[3]/div/div/div[2]/span/text()[1]")
            if losses_nodes:
                stats.losses = self._extract_number(losses_nodes[0])

            stats.win_rate = self._get_cell_text(row, "td[3]/div/span")
            stats.kda_ratio = self._get_cell_text(row, "td[4]/span/div")
            stats.kda = self._get_cell_text(row, "td[4]/span/span")
            stats.laning = self._get_cell_text(row, "td[6]/span/span[1]/span[1]")
            stats.damage_per_minute = self._get_cell_text(row, "td[7]/span/span[1]")
            stats.damage_share_ratio = self._get_cell_text(row, "td[7]/span/span[2]")
            stats.wards_score = self._get_cell_text(row, "td[8]/span/span[1]")
            stats.wards_control = self._get_cell_text(row, "td[8]/span/span[2]")
            stats.cs = self._get_cell_text(row, "td[9]/span/span[1]")
            stats.cs_per_minute = self._get_cell_text(row, "td[9]/span/span[2]")
            stats.gold = self._get_cell_text(row, "td[10]/span/span[1]")
            stats.gold_per_minute = self._get_cell_text(row, "td[10]/span/span[2]")
            stats.double_kills = self._get_cell_text(row, "td[11]/span/span")
            stats.triple_kills = self._get_cell_text(row, "td[12]/span/span")
            stats.quadra_kills = self._get_cell_text(row, "td[13]/span/span")
            stats.penta_kills = self._get_cell_text(row, "td[14]/span/span")

            champion_stats.append(stats)

        return champion_stats

    def _get_cell_text(self, row: html.HtmlElement, xpath: str) -> str:
        """Извлекает текст из ячейки таблицы"""
        nodes = row.xpath(f"./{xpath}")
        if nodes:
            return nodes[0].text.strip() if nodes[0].text else ""
        return ""

    def _extract_number(self, text: str) -> str:
        """Извлекает только цифры из текста"""
        match = re.search(r"\d+", text)
        return match.group() if match else ""

    def print_stats(self, stats: SummonerStats):
        """Выводит статистику в удобочитаемом формате"""
        print("=" * 50)
        print("SUMMONER STATISTICS")
        print("=" * 50)

        if stats.solo_queue:
            print("\nSOLO/DUO QUEUE:")
            print(f"  Current Rank: {stats.solo_queue.current_rank}")
            print(f"  Current LP: {stats.solo_queue.current_lp}")
            print(f"  Win/Loss: {stats.solo_queue.win_loss}")
            print(f"  Win Rate: {stats.solo_queue.win_rate}")
            print(f"  Best Rank: {stats.solo_queue.best_rank}")
            print(f"  Best LP: {stats.solo_queue.best_lp}")
            if stats.solo_queue.icon_id:
                print(f"  Profile Icon ID: {stats.solo_queue.icon_id}")

        if stats.flex_queue:
            print("\nFLEX QUEUE:")
            print(f"  Current Rank: {stats.flex_queue.current_rank}")
            print(f"  Current LP: {stats.flex_queue.current_lp}")
            print(f"  Win/Loss: {stats.flex_queue.win_loss}")
            print(f"  Win Rate: {stats.flex_queue.win_rate}")
            print(f"  Best Rank: {stats.flex_queue.best_rank}")
            print(f"  Best LP: {stats.flex_queue.best_lp}")

        if stats.champion_stats:
            print(f"\nTOP {len(stats.champion_stats)} CHAMPIONS:")
            for champ in stats.champion_stats:
                print(f"\n  {champ.position}. {champ.champion}")
                print(f"    Win Rate: {champ.win_rate} ({champ.wins}W {champ.losses}L)")
                print(f"    KDA: {champ.kda} ({champ.kda_ratio})")
                if champ.cs:
                    print(f"    CS: {champ.cs} ({champ.cs_per_minute}/min)")
                if champ.gold:
                    print(f"    Gold: {champ.gold} ({champ.gold_per_minute}/min)")
                if champ.damage_per_minute:
                    print(
                        f"    Damage: {champ.damage_per_minute}/min ({champ.damage_share_ratio})"
                    )
