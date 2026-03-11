import re
import asyncio
import aiohttp
from typing import Optional, List, Dict
from lxml import html
from urllib.parse import urlparse, urlunparse
from schemas.player import (
    ChampionStats as ChampionStats,
    RankedStats as RankedStats,
    SummonerStats as SummonerStats,
)
import backoff
from aiohttp import ClientTimeout, TCPConnector
# TODO exception handling ( user not found etc)


class AsyncOpGgStatsParser:
    """Асинхронный парсер Op.GG с поддержкой пула соединений"""

    def __init__(
        self,
        headers: Optional[Dict[str, str]] = None,
        max_connections: int = 100,
        max_connections_per_host: int = 10,
        timeout: int = 30,
    ):
        self.headers = headers or {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }

        # Конфигурация клиента
        self.timeout = ClientTimeout(total=timeout)
        self.connector = TCPConnector(
            limit=max_connections,
            limit_per_host=max_connections_per_host,
            enable_cleanup_closed=True,
            force_close=False,
            ttl_dns_cache=300,
        )

        self.session: Optional[aiohttp.ClientSession] = None
        self._session_lock = asyncio.Lock()

    async def __aenter__(self):
        await self._ensure_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def _ensure_session(self):
        """Создает сессию если она еще не создана"""
        if self.session is None or self.session.closed:
            async with self._session_lock:
                if self.session is None or self.session.closed:
                    self.session = aiohttp.ClientSession(
                        headers=self.headers,
                        connector=self.connector,
                        timeout=self.timeout,
                        trust_env=True,
                    )

    async def close(self):
        """Закрывает сессию"""
        if self.session and not self.session.closed:
            await self.session.close()
            self.session = None

    @backoff.on_exception(
        backoff.expo,
        (aiohttp.ClientError, asyncio.TimeoutError),
        max_tries=3,
        max_time=30,
    )
    async def parse_from_server_name_tag(
        self, server: str, name: str, tag: str
    ) -> SummonerStats:
        """Парсит статистику по серверу, имени и тегу"""
        url = f"https://op.gg/en/lol/summoners/{server}/{name}-{tag}"
        return await self.parse_from_url(url)

    async def parse_from_url(self, url: str) -> SummonerStats:
        """Парсит статистику по URL"""
        await self._ensure_session()

        parsed_url = urlparse(url)

        path_parts = parsed_url.path.strip("/").split("/")

        if len(path_parts) >= 4:
            server = path_parts[-2]
            nametag = path_parts[-1]
            if "-" in nametag:
                name, tag = nametag.split("-", 1)
            else:
                name, tag = nametag, ""
        else:
            raise ValueError(f"Invalid URL format: {url}")

        # Основная страница и страница с чемпионами
        main_url = f"https://op.gg/en/lol/summoners/{server}/{name}-{tag}"
        champions_url = self._generate_champions_url(main_url)

        # Параллельная загрузка обеих страниц
        main_task = self._fetch_html(main_url)
        champs_task = self._fetch_html(champions_url)

        main_doc, champs_doc = await asyncio.gather(main_task, champs_task)

        return self._parse_stats(main_doc, champs_doc)

    @backoff.on_exception(
        backoff.expo,
        (aiohttp.ClientError, asyncio.TimeoutError),
        max_tries=3,
        max_time=30,
    )
    async def _fetch_html(self, url: str) -> html.HtmlElement:
        """Асинхронно загружает HTML страницу"""
        await self._ensure_session()

        try:
            async with self.session.get(url, allow_redirects=True) as response:
                response.raise_for_status()

                # Проверяем редиректы
                if str(response.url) != url:
                    print(f"Redirected from {url} to {response.url}")

                content = await response.read()

                # Пытаемся определить кодировку
                encoding = response.charset or "utf-8"
                try:
                    text = content.decode(encoding)
                except UnicodeDecodeError:
                    text = content.decode("utf-8", errors="ignore")

                return html.fromstring(text)

        except aiohttp.ClientResponseError as e:
            if e.status == 404:
                raise ValueError(f"Summoner not found: {url}")
            raise
        except Exception as e:
            raise Exception(f"Error loading page {url}: {str(e)}")

    def _generate_champions_url(self, url: str) -> str:
        """Генерирует URL для страницы с чемпионами"""
        parsed_url = urlparse(url)
        path = parsed_url.path

        path_parts = path.strip("/").split("/")

        if len(path_parts) >= 5 and path_parts[1] == "summoners":
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

    # Остальные методы парсинга (_parse_stats, _check_queue_exists, etc.)
    # остаются такими же, так как они синхронные и работают с уже загруженным HTML
    def _parse_stats(
        self, doc: html.HtmlElement, champs: html.HtmlElement
    ) -> SummonerStats:
        """Основной метод для парсинга статистики из HTML элементов"""
        stats = SummonerStats()

        has_solo_queue = self._check_queue_exists(doc, 1)
        has_flex_queue = self._check_queue_exists(doc, 2)

        if has_solo_queue:
            stats.solo_queue = self._parse_ranked_stats(doc, 1)

        if has_flex_queue:
            stats.flex_queue = self._parse_ranked_stats(doc, 2)

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

        rank_node = doc.xpath(f"//aside/section[{queue_section}]//strong")
        if rank_node:
            stats.current_rank = rank_node[0].text.strip() if rank_node[0].text else ""

        queue_condition = f"count(//aside/section[{queue_section}]/div[1]/div//span[text()='Ranked {queue_type}']) > 0"
        lp_xpath = f"//aside/section[{queue_section}]/div[2]/div/div[1]/div[1]/div/span[{queue_condition}]/text()[1]"
        lp_nodes = doc.xpath(lp_xpath)
        if lp_nodes and lp_nodes[0].strip():
            stats.current_lp = lp_nodes[0].strip()

        wl_nodes = doc.xpath(
            f"//aside/section[{queue_section}]/div[2]/div/div[1]/div[2]/span[1]/text()"
        )
        if wl_nodes:
            stats.win_loss = " ".join([n.strip() for n in wl_nodes if n.strip()])

        win_rate_nodes = doc.xpath(
            f"//aside/section[{queue_section}]/div[2]/div/div[1]/div[2]/span[2]/text()"
        )
        if win_rate_nodes:
            stats.win_rate = " ".join([n.strip() for n in win_rate_nodes if n.strip()])

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

        best_lp_nodes = doc.xpath(
            f"//aside/section[{queue_section}]/div[2]/div/div[2]/div//span/text()"
        )
        if best_lp_nodes:
            stats.best_lp = " ".join([n.strip() for n in best_lp_nodes if n.strip()])

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
            print("Champion stats rows not found")
            return champion_stats

        for i, row in enumerate(rows):
            if i == 0 or i == 2:
                continue
            if i > 11:
                break

            stats = ChampionStats()

            stats.position = self._get_cell_text(row, "td[1]")
            stats.champion = self._get_cell_text(row, "td[2]/div/strong")

            wins_nodes = row.xpath("td[3]/div/div/div[1]/span/text()[1]")
            if wins_nodes:
                stats.wins = self._extract_number(wins_nodes[0])

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


class OpGgParserPool:
    """Пул асинхронных парсеров для параллельной обработки"""

    def __init__(
        self,
        pool_size: int = 10,
        max_connections_per_parser: int = 10,
        headers: Optional[Dict[str, str]] = None,
    ):
        self.pool_size = pool_size
        self.max_connections_per_parser = max_connections_per_parser
        self.headers = headers

        self._parsers: List[AsyncOpGgStatsParser] = []
        self._available_parsers: asyncio.Queue = asyncio.Queue()
        self._lock = asyncio.Lock()
        self._initialized = False

    async def initialize(self):
        """Инициализирует пул парсеров"""
        if not self._initialized:
            async with self._lock:
                if not self._initialized:
                    for i in range(self.pool_size):
                        parser = AsyncOpGgStatsParser(
                            headers=self.headers,
                            max_connections_per_host=self.max_connections_per_parser,
                        )
                        await parser._ensure_session()  # Создаем сессии заранее
                        self._parsers.append(parser)
                        await self._available_parsers.put(parser)
                    self._initialized = True

    async def get_parser(self) -> AsyncOpGgStatsParser:
        """Получает парсер из пула"""
        await self.initialize()
        return await self._available_parsers.get()

    async def return_parser(self, parser: AsyncOpGgStatsParser):
        """Возвращает парсер в пул"""
        await self._available_parsers.put(parser)

    async def close_all(self):
        """Закрывает все парсеры"""
        async with self._lock:
            for parser in self._parsers:
                await parser.close()
            self._initialized = False
            self._parsers.clear()
            while not self._available_parsers.empty():
                try:
                    self._available_parsers.get_nowait()
                except asyncio.QueueEmpty:
                    break

    async def __aenter__(self):
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close_all()
