from pydantic_settings import BaseSettings, SettingsConfigDict
from loguru import logger
import logging
import sys


class Settings(BaseSettings):
    """Настройки приложения SocketService"""

    model_config = SettingsConfigDict(
        env_nested_delimiter="__",
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_notifications_channel: str = "socket.notifications"

    # Приложение
    app_name: str = "SocketService"
    app_version: str = "0.1.0"
    env_type: str = "dev"  # dev или prod
    log_level: str = "INFO"

    # WebSocket
    ws_ping_interval: int = 30
    ws_ping_timeout: int = 10


settings = Settings()


class InterceptHandler(logging.Handler):
    """Перехватчик стандартных логов для отправки в loguru"""

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
    Настройка логирования для всего приложения.
    В режиме dev - консоль с цветами и DEBUG уровнем.
    В режиме prod - консоль + файл с JSON форматом.
    """
    logger.remove()

    dev_format = (
        "<green>{time:HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    prod_format = (
        "{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}"
    )

    if settings.env_type == "dev":
        logger.add(
            sys.stderr,
            level=settings.log_level,
            format=dev_format,
            colorize=True,
        )
        logger.info("Режим разработки: логирование в консоль с DEBUG уровнем")
    else:
        logger.add(
            sys.stderr,
            level="INFO",
            format=prod_format,
            colorize=False,
        )
        logger.add(
            "logs/socket_service.log",
            level="DEBUG",
            rotation="10 MB",
            retention="1 month",
            serialize=True,
        )
        logger.info("Режим продакшена: логирование в консоль и файл")

    logging.basicConfig(
        handlers=[InterceptHandler()],
        level=0,
        force=True,
    )
    logger.info(f"Запуск {settings.app_name} v{settings.app_version}")
