from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )

    # RabbitMQ Configuration
    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_user: str = "guest"
    rabbitmq_password: str = "guest"
    rabbitmq_vhost: str = "/"

    # RabbitMQ Exchange Configuration
    rabbitmq_exchange_name: str = "chat_exchange"
    rabbitmq_exchange_type: Literal["direct", "fanout", "topic", "headers"] = "direct"
    rabbitmq_exchange_durable: bool = True

    # RabbitMQ Queue Configuration - Input
    rabbitmq_input_queue: str = "chat_messages_input"
    rabbitmq_input_routing_key: str = "chat.message.new"
    rabbitmq_input_queue_durable: bool = True

    # RabbitMQ Queue Configuration - Output
    rabbitmq_output_queue: str = "chat_messages_output"
    rabbitmq_output_routing_key: str = "chat.message.processed"
    rabbitmq_output_queue_durable: bool = True

    # RabbitMQ Queue Configuration - Chat Instance Creation
    rabbitmq_chat_input_queue: str = "chat_instance_input"
    rabbitmq_chat_input_routing_key: str = "chat.instance.create"
    rabbitmq_chat_input_queue_durable: bool = True

    # MongoDB Configuration
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "chat_db"

    # Application Settings
    app_name: str = "ChatService"
    app_version: str = "1.0.0"
    log_level: str = "INFO"

    @property
    def rabbitmq_url(self) -> str:
        """Build RabbitMQ connection URL."""
        return f"amqp://{self.rabbitmq_user}:{self.rabbitmq_password}@{self.rabbitmq_host}:{self.rabbitmq_port}{self.rabbitmq_vhost}"


# Global settings instance
settings = Settings()
