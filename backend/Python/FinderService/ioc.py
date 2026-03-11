from dishka import Provider, Scope, make_async_container, provide

from settings import Settings
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.asynchronous.database import AsyncDatabase

from services.hot_form_service import HotFormService
from services.cold_form_service import ColdFormService
from msgspec.msgpack import Decoder
from events import RPCRequest


class ConfigProvider(Provider):
    @provide(scope=Scope.APP)
    def get_settings(self) -> Settings:
        return Settings()


class MspProvider(Provider):
    @provide(scope=Scope.APP)
    def get_rpc_decoder(self) -> Decoder:
        dec = Decoder(RPCRequest)
        return dec


class DatabaseProvider(Provider):
    @provide(scope=Scope.APP)
    async def get_mongo_client(self, settings: Settings) -> AsyncIOMotorClient:
        return AsyncIOMotorClient(settings.mongodb_url)

    @provide(scope=Scope.APP)
    async def get_mongo_db(
        self, settings: Settings, client: AsyncIOMotorClient
    ) -> AsyncDatabase:
        return client[settings.mongodb_db_name]


class ServiceProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_hot_form_service(self, dec: Decoder) -> HotFormService:
        return HotFormService(dec)

    @provide(scope=Scope.REQUEST)
    def get_cold_form_service(self, dec: Decoder) -> ColdFormService:
        return ColdFormService(dec)


container = make_async_container(
    ConfigProvider(), DatabaseProvider(), ServiceProvider(), MspProvider()
)
