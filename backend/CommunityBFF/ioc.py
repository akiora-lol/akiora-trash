# services/providers.py

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
    ApiLogger,
    SessionLogger,
    UserService,
    AuthLogger,
    DomainLogger,
)
from dishka.integrations.fastapi import (
    FastapiProvider,
)
from aiohttp import ClientSession, ClientTimeout, TCPConnector
import asyncio

from typing import AsyncIterable


class HttpProvider(Provider):
    def __init__(self):
        self._session: ClientSession | None = None
        self._lock = asyncio.Lock()

    @provide(scope=Scope.APP)
    async def get_session(self, settings: Settings) -> AsyncIterable[ClientSession]:

        async with self._lock:
            if self._session is None or self._session.closed:
                connector = TCPConnector(
                    limit=100,
                    limit_per_host=30,
                    ttl_dns_cache=300,
                    force_close=False,  # Держим соединения открытыми
                    enable_cleanup_closed=True,
                )

                timeout = ClientTimeout(
                    total=30,
                    connect=5,
                    sock_read=10,
                )

                self._session = ClientSession(
                    base_url=settings.auth_service_url.rsplit("/", maxsplit=1),
                    connector=connector,
                    timeout=timeout,
                    headers={"User-Agent": "CommunityBFF/1.0"},
                )

        yield self._session

        if self._session and not self._session.closed:
            await self._session.close()


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()


class LoggerProvider(Provider):
    @provide(scope=Scope.APP)
    def get_api_logger(self) -> ApiLogger:
        return ApiLogger()

    @provide(scope=Scope.APP)
    def get_session_logger(self) -> SessionLogger:
        return SessionLogger()

    @provide(scope=Scope.APP)
    def get_auth_logger(self) -> AuthLogger:
        return AuthLogger()

    @provide(scope=Scope.APP)
    def get_domain_logger(self) -> DomainLogger:
        return DomainLogger()


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
        self, redis_service: RedisService, settings: Settings, logger: SessionLogger
    ) -> SessionService:
        return SessionService(redis_service, settings, logger)

    @provide(scope=Scope.REQUEST)
    def get_auth_service(
        self,
        settings: Settings,
        logger: AuthLogger,
        session: ClientSession,
    ) -> AuthService:
        return AuthService(settings, logger, session)

    @provide(scope=Scope.REQUEST)
    def get_user_service(
        self,
        broker: RedisBroker,
        logger: DomainLogger,
        settings: Settings,
    ) -> UserService:
        return UserService(
            redis_broker=broker,
            settings=settings,
            logger=logger.get_domain_logger("UserService"),
        )


container = make_async_container(
    ServiceProvider(),
    ConfigProvider(),
    FastapiProvider(),
    LoggerProvider(),
)
