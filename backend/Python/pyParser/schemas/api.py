from pydantic import BaseModel
from uuid import UUID


class VerifyMsg(BaseModel):
    session_id: UUID
    acc_name: str
    acc_tag: str
    acc_server: str
