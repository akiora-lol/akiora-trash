from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from pydantic import BaseModel, EmailStr, Field, field_serializer


def time_now():
    return datetime.now(tz=UTC)


def session_expires_at():
    return datetime.now(tz=UTC) + timedelta(days=30)


class Session(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    email: EmailStr
    user_id: UUID
    created_at: datetime = Field(default_factory=time_now)
    last_activity: datetime = Field(default_factory=time_now)

    exipres_at: datetime = Field(default_factory=session_expires_at)
    auth_source: str
    custom_data: dict = Field(default_factory=dict)

    @field_serializer("id")
    def serialize_id(self, id: UUID):
        return str(id)

    @field_serializer("user_id")
    def serialize_uid(self, id: UUID):
        return str(id)

    @field_serializer("created_at")
    def serialize_ca(self, dt: datetime):
        return dt.isoformat()

    @field_serializer("last_activity")
    def serialize_la(self, dt: datetime):
        return dt.isoformat()

    @field_serializer("exipres_at")
    def serialize_ea(self, dt: datetime):
        return dt.isoformat()

    class Settings:
        bson_encoders = {UUID: str}
        keep_nulls = False
