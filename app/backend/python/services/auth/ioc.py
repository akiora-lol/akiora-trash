from typing import AsyncIterator

from dishka import Provider, Scope, make_async_container, provide
from fastapi_sso.sso.base import SSOBase
from fastapi_sso.sso.discord import DiscordSSO
from fastapi_sso.sso.yandex import YandexSSO
from redis.asyncio import Redis
from shared.settings import Settings

from shared import RedisManager, RedisService

settings = Settings()  # pyright: ignore


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()  # pyright: ignore


class InfraProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_redis_manager(
        self, settings: Settings
    ) -> AsyncIterator[RedisManager]:
        manager = RedisManager(settings)
        async with manager.managed() as m:
            yield m

    @provide(scope=Scope.REQUEST)
    async def get_redis_client(self, rm: RedisManager) -> AsyncIterator[Redis]:
        async with rm.get_client_context() as client:
            yield client

    @provide(scope=Scope.REQUEST)
    def get_redis_service(self, redis_client: Redis, st: Settings) -> RedisService:
        return RedisService(redis_client, st.redis_ttl)


class ServiceProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_redis_manager(
        self, settings: Settings
    ) -> AsyncIterator[RedisManager]:
        manager = RedisManager(settings)
        async with manager.managed() as m:
            yield m

    @provide(scope=Scope.REQUEST)
    async def get_redis_client(self, rm: RedisManager) -> AsyncIterator[Redis]:
        async with rm.get_client_context() as client:
            yield client

    @provide(scope=Scope.REQUEST)
    def get_redis_service(self, redis_client: Redis, st: Settings) -> RedisService:
        return RedisService(redis_client, st.redis_ttl)


class OuathProvider(Provider):
    @provide(scope=Scope.APP)
    def get_yandex_sso(self, settings: Settings) -> YandexSSO:
        return YandexSSO(
            client_id=settings.yandex_cid,
            client_secret=settings.yandex_cs,
            redirect_uri="http://localhost:8000/auth/yandex/callback",
            allow_insecure_http=True,
            scope=["login:email"],
        )

    @provide(scope=Scope.APP)
    def get_discord_sso(self, settings: Settings) -> DiscordSSO:
        return DiscordSSO(
            client_id=settings.discord_cid,
            client_secret=settings.discord_cs,
            redirect_uri="http://localhost:8000/auth/discord/callback",
            allow_insecure_http=True,
            scope=["email"],
        )

    @provide(scope=Scope.APP)
    def get_sso_dict(
        self, yandex_sso: YandexSSO, discord_sso: DiscordSSO
    ) -> dict[str, SSOBase]:
        return {"yandex": yandex_sso, "discord": discord_sso}


container = make_async_container(ConfigProvider(), InfraProvider())
