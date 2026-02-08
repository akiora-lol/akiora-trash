from .sso.discord import router as discord_router
from .sso.yandex import router as yandex_router

__all__ = ["discord_router", "yandex_router"]
