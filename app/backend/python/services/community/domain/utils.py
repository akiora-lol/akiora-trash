from datetime import UTC, datetime


def time_now_utc() -> datetime:
    return datetime.now(tz=UTC)
