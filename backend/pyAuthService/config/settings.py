# from pydantic_settings import BaseSettings, SettingsConfigDict
# from typing import Literal
# from pydantic import BaseModel


# class RabbitSettings(BaseModel):
#     host: str = "localhost"
#     port: int = 5672
#     user: str = "guest"
#     password: str = "guest"
#     vhost: str = "/"

#     exchange_name: str = "chat_service_exchange"
#     exchange_type: Literal["direct", "fanout", "topic", "headers"] = "direct"
#     exchange_durable: bool = True

#     message_input_queue: str = "chat_service_message_crud"
#     message_input_routing_key: str = "chat_service.message.crud"
#     message_input_queue_durable: bool = True

#     output_exchange_name: str = "websocket_exchange"
#     output_routing_key: str = "websocket.message.created"
#     output_exchange_type: Literal["direct", "fanout", "topic", "headers"] = "direct"
#     output_exchange_durable: bool = True

#     chat_input_queue: str = "chat_service_chat_crud"
#     chat_input_routing_key: str = "chat_service.chat.crud"
#     chat_input_queue_durable: bool = True

# TODO add redis
# class Settings(BaseSettings):
#     model_config = SettingsConfigDict(
#         env_nested_delimiter="__",
#         env_file=".env",
#         env_file_encoding="utf-8",
#         case_sensitive=False,
#         extra="ignore",
#     )

#     rabbit_settings: RabbitSettings
#     mongodb_url: str = "mongodb://localhost:27017"
#     mongodb_db_name: str = "chat_db"

#     app_name: str = "ChatService"
#     app_version: str = "0.1"
#     log_level: str = "INFO"

#     @property
#     def rabbitmq_url(self) -> str:
#         return f"amqp://{self.rabbit_settings.user}:{self.rabbit_settings.password}@{self.rabbit_settings.host}:{self.rabbit_settings.port}{self.rabbit_settings.vhost}"


# # Global settings instance
# settings = Settings()
