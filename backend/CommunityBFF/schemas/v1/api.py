from pydantic import BaseModel, ConfigDict


class Cookies(BaseModel):
    sid: str
    model_config = ConfigDict(extra="ignore")
