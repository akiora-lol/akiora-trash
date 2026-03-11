from dishka import Provider, Scope, make_async_container, provide, provide_all
from dishka.integrations.fastapi import FastapiProvider

from settings import Settings
from managers import GlobalStorage, ConnectionManager
from handlers import MessageHandler, HandlerRegistry
from handlers.chat import ChatMessageHandler
from handlers.info import InfoMessageHandler
from notification import NotificationService
from schemas.base import MessageType


class ConfigProvider(Provider):
    """Провайдер конфигурации"""

    scope = Scope.APP

    @provide
    def get_settings(self) -> Settings:
        return Settings()


class StorageProvider(Provider):
    """Провайдер хранилищ и менеджеров"""

    scope = Scope.APP

    @provide(scope=Scope.APP)
    def get_storage(self) -> GlobalStorage:
        """Один на все приложение"""
        return GlobalStorage()

    @provide(scope=Scope.SESSION)
    def get_connection_manager(
        self,
        storage: GlobalStorage,
        user_id: str,
    ) -> ConnectionManager:
        """Новый для каждого WebSocket соединения"""
        return ConnectionManager(storage, user_id)


class HandlerProvider(Provider):
    """Провайдер обработчиков сообщений"""

    scope = Scope.APP

    @provide(scope=Scope.APP)
    def get_handler_registry(
        self,
        chat_handler: ChatMessageHandler,
        info_handler: InfoMessageHandler,
    ) -> HandlerRegistry:
        """Создание и заполнение реестра обработчиков"""
        registry = HandlerRegistry()
        registry.register(MessageType.CHAT_MESSAGE, ChatMessageHandler)
        registry.register(MessageType.INFO_REQUEST, InfoMessageHandler)
        return registry

    @provide(scope=Scope.REQUEST)
    def get_message_handler(
        self,
        registry: HandlerRegistry,
        user_id: str,
        message_data: str,
    ) -> MessageHandler:
        """
        FACTORY-scoped обработчик для каждого сообщения.
        Выбирает нужный обработчик на основе типа сообщения.
        """
        import msgspec

        try:
            data = msgspec.json.decode(message_data)
            if isinstance(data, dict) and "type" in data:
                msg_type = MessageType(data["type"])
                handler_class = registry.get_handler(msg_type)
                if handler_class:
                    return handler_class(user_id, message_data)
        except (ValueError, msgspec.DecodeError):
            pass

        # Handler по умолчанию
        return MessageHandler(user_id, message_data)


class NotificationProvider(Provider):
    """Провайдер сервиса уведомлений"""

    scope = Scope.APP

    @provide(scope=Scope.APP)
    def get_notification_service(
        self,
        connection_manager: ConnectionManager,
    ) -> NotificationService:
        """Сервис уведомлений (APP-scoped)"""
        # Для broadcast используем ConnectionManager без привязки к user_id
        # Создаем временный менеджер для сервиса
        from managers import GlobalStorage

        storage = GlobalStorage()
        temp_manager = ConnectionManager(storage, "system")
        return NotificationService(temp_manager)


class NotificationServiceProvider(Provider):
    """
    Провайдер сервиса уведомлений с правильным ConnectionManager.
    NotificationService использует ConnectionManager для отправки уведомлений.
    """

    @provide(scope=Scope.APP)
    def get_notification_service(self, storage: GlobalStorage) -> NotificationService:
        """Сервис уведомлений"""
        # Создаем ConnectionManager для системы (broadcast)
        system_manager = ConnectionManager(storage, "system")
        return NotificationService(system_manager)


container = make_async_container(
    ConfigProvider(),
    StorageProvider(),
    HandlerProvider(),
    NotificationServiceProvider(),
    FastapiProvider(),
)
