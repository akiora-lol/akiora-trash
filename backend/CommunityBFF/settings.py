from pydantic_settings import BaseSettings, SettingsConfigDict


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
    log_level: str = "INFO"
    auth_service_url: str
    user_rpc_stream: str


settings = Settings()
