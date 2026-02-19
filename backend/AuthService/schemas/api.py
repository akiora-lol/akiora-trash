from pydantic import BaseModel, Field, EmailStr


class Cookie(BaseModel):
    sid: str | None = None
    cvid: str | None = None
    email: EmailStr | None = None


class LoginInitRequest(BaseModel):
    email: EmailStr


class LoginFInishRequest(BaseModel):
    code: str = Field(..., max_length=6, min_length=6)
