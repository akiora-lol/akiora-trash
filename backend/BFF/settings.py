from pydantic_settings import BaseSettings, SettingsConfigDict
import sys
import logging
from loguru import logger


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_nested_delimiter="__",
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    redis_url: str = "redis://localhost:6379/0"
    app_name: str = "CommunityBFF"
    app_version: str = "0.1"
    log_level: str = "DEBUG"
    auth_service_url: str
    user_rpc_stream: str
    env_type: str = "dev"
    secret_key: str


settings = Settings()


class InterceptHandler(logging.Handler):
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging():
    """
    Настраивает логгер для всего приложения в зависимости от окружения.
    """
    # Удаляем стандартный обработчик, чтобы избежать дублирования
    logger.remove()

    # Определяем формат для консоли (разработка)
    dev_format = (
        "<green>{time:HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>"
    )

    # Определяем формат для файла (продакшен)
    prod_format = "{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function} | {message}"

    if settings.env_type == "dev":
        logger.add(sys.stderr, level="DEBUG", format=dev_format, colorize=True)
        logger.info("Режим разработки: логирование настроено для вывода в консоль.")

    else:
        logger.add(sys.stderr, level="DEBUG", format=prod_format, colorize=False)

        # В файл пишем все, начиная с DEBUG, в формате JSON для машинного анализа
        logger.add(
            "logs/app.log",
            level="DEBUG",
            rotation="10 MB",
            retention="1 month",
            serialize=True,  # Структурированное логирование в JSON
        )
        logger.info(
            "Режим продакшена: логирование настроено для вывода в консоль и файл."
        )
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    logger.info("Стандартный logging перехвачен и направлен в Loguru.")
