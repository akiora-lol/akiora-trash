from typing import AsyncIterator
from dishka import Provider, Scope, make_async_container, provide

from redis.asyncio import Redis
from faststream.redis import RedisBroker

from settings import Settings
from services import (
    SessionService,
    RedisManager,
    RedisService,
    AuthService,
    UserService,
)
from dishka.integrations.litestar import LitestarProvider
from aiohttp import ClientSession, ClientTimeout, TCPConnector
import asyncio

from typing import AsyncIterable


class HttpProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_session(self, settings: Settings) -> AsyncIterable[ClientSession]:

        async with asyncio.Lock():
            connector = TCPConnector(
                limit=100,
                limit_per_host=30,
                ttl_dns_cache=300,
                force_close=False,
                enable_cleanup_closed=True,
            )

            timeout = ClientTimeout(
                total=30,
                connect=5,
                sock_read=10,
            )

            ses = ClientSession(
                base_url=settings.auth_service_url.rsplit("/", maxsplit=1),
                connector=connector,
                timeout=timeout,
                headers={"User-Agent": "CommunityBFF/1.0"},
            )

        yield ses

        if ses:
            await ses.close()


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()


class ServiceProvider(Provider):
    scope = Scope.APP

    @provide(scope=Scope.APP)
    async def get_redis_broker(self, settings: Settings) -> RedisBroker:
        broker = RedisBroker(
            url=settings.redis_url,
            max_connections=20,
        )
        await broker.connect()
        return broker

    @provide(scope=Scope.APP)
    def get_redis_manager(self, settings: Settings) -> RedisManager:
        return RedisManager(settings)

    @provide(scope=Scope.REQUEST)
    async def get_redis_client(self, rm: RedisManager) -> AsyncIterator[Redis]:
        async with rm.get_client_context() as client:
            yield client

    @provide(scope=Scope.REQUEST)
    def get_redis_service(self, redis_client: Redis) -> RedisService:
        return RedisService(redis_client)

    @provide(scope=Scope.REQUEST)
    def get_session_service(
        self, redis_service: RedisService, settings: Settings
    ) -> SessionService:
        return SessionService(redis_service, settings)

    @provide(scope=Scope.REQUEST)
    def get_auth_service(
        self,
        settings: Settings,
        session: ClientSession,
    ) -> AuthService:
        return AuthService(settings, session)

    @provide(scope=Scope.REQUEST)
    def get_user_service(
        self,
        broker: RedisBroker,
        settings: Settings,
    ) -> UserService:
        return UserService(
            redis_broker=broker,
            settings=settings,
        )


container = make_async_container(
    ServiceProvider(), ConfigProvider(), LitestarProvider(), HttpProvider()
)
