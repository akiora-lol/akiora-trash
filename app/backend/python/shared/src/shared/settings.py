from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_nested_delimiter="__",
        case_sensitive=False,
        extra="ignore",
    )
    # Infra

    mongodb_url: str = ""
    mongodb_db_name: str = ""
    redis_url: str = ""
    redis_ttl: int = 0
    rustfs_url: str = ""

    # APP

    app_name: str = ""
    app_version: str = ""
    log_level: str = "INFO"

    # Auth specific

    yandex_cid: str = ""
    yandex_cs: str = ""

    discord_cid: str = ""
    discord_cs: str = ""

    # Email

    smtp_port: str = ""
    smtp_server: str = ""
    email_address: str = ""
    email_password: str = ""

    secret_key: str = ""
