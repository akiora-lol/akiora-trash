from typing import *

from pydantic import BaseModel, Field

from .Birthday import Birthday
from .Gender import Gender


class UserResponse(BaseModel):
    """
    UserResponse model
    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    id: str = Field(validation_alias="id")

    email: str = Field(validation_alias="email")

    nickname: str = Field(validation_alias="nickname")

    bio: str = Field(validation_alias="bio")

    gender: Gender = Field(validation_alias="gender")

    birth_date: Optional[Union[Birthday, None]] = Field(validation_alias="birth_date", default=None)

    personal_socials: Dict[str, Any] = Field(validation_alias="personal_socials")

    created_at: str = Field(validation_alias="created_at")

    last_updated: str = Field(validation_alias="last_updated")
