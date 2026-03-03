from pydantic import BaseModel, ConfigDict, Field


class Cookies(BaseModel):
    session_id: str


class GetQueryParams(BaseModel):
    limit: int = Field(00, gt=0, le=200)
    offset: int = Field(0, ge=0)
    model_config = ConfigDict(extra="ignore")
