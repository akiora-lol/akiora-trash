from helpers.opt_parse import AsyncOpGgStatsParser, OpGgParserPool
import asyncio
from faststream import FastStream
from faststream.rabbit import RabbitBroker
import time


async def high_performance_batch_processing(
    players: list[tuple], batch_size: int = 10, parser_pool_size: int = 5
):
    """Пакетная обработка большого количества игроков"""

    async with OpGgParserPool(pool_size=parser_pool_size) as pool:
        semaphore = asyncio.Semaphore(batch_size)  # Ограничиваем concurrent запросы

        async def process_with_semaphore(player):
            async with semaphore:
                parser = await pool.get_parser()
                try:
                    stats = await parser.parse_from_server_name_tag(*player)
                    return stats
                finally:
                    await pool.return_parser(parser)

        # Создаем задачи с ограничением concurrency
        tasks = [process_with_semaphore(player) for player in players]

        # Обрабатываем результаты по мере выполнения
        results = []
        for task in asyncio.as_completed(tasks):
            try:
                result = await task
                results.append(result)
                print(f"Processed {len(results)}/{len(players)}")
            except Exception as e:
                print(f"Failed: {e}")

        return results


if __name__ == "__main__":
    # Пример запуска
    async def main():
        # Тестируем один запрос
        start_time = time.perf_counter()
        async with AsyncOpGgStatsParser() as parser:
            stats = await parser.parse_from_server_name_tag(
                "euw", "три пореза на", "руке"
            )
            print(
                f"Parsed: {stats.solo_queue.current_rank if stats.solo_queue else 'No rank'}"
            )
        elapsed = time.perf_counter() - start_time
        print(f"\n✅ Один запрос выполнен за: {elapsed:.2f} секунд")
        print(f"Parsed: {stats.solo_queue.icon_id if stats.solo_queue else 'No rank'}")
        # Тестируем пул
        players = [
            ("euw", "i miss her smile", "1710"),
            ("euw", "БОЛЬ", "000"),
            ("ru", "ORION", "ABDUL"),
            ("euw", "i miss her smile", "1710"),
            ("euw", "БОЛЬ", "000"),
            ("ru", "ORION", "ABDUL"),
        ]
        start_time = time.perf_counter()
        results = await high_performance_batch_processing(players)

        elapsed = time.perf_counter() - start_time
        avg_time = elapsed / len(players) if players else 0
        for x in results:
            print(x.solo_queue.current_rank)
        print(f"\n✅ Пул из {len(players)} запросов выполнен за: {elapsed:.2f} секунд")
        print(f"📊 Среднее время на запрос: {avg_time:.2f} секунд")
        print(f"Batch processed: {len(results)} players")

    asyncio.run(main())
