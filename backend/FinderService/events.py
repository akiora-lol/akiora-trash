from enum import Enum
from msgspec import Struct, field
from uuid import UUID
from datetime import datetime
from typing import Any


class HotFormRPCCommand(str, Enum):
    CREATE = "create"
    GET = "get"
    GET_BY_OWNER = "get_by_owner"
    GET_ALL = "get_all"
    UPDATE = "update"
    DELETE = "delete"
    LIKE = "like"
    DISLIKE = "dislike"


class ColdFormRPCCommand(str, Enum):
    CREATE = "create"
    GET = "get"
    GET_BY_OWNER = "get_by_owner"
    GET_ALL = "get_all"
    UPDATE = "update"
    DELETE = "delete"
    LIKE = "like"
    DISLIKE = "dislike"
    BLOCK = "block"
    FREEZE = "freeze"
    ACTIVATE = "activate"


class RPCRequest(Struct):
    command: str
    params: dict[str, Any] = field(default_factory=dict)


class RPCResponse(Struct):
    success: bool
    data: Any | None = None
    error: str | None = None
