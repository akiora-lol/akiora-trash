from typing import *

from pydantic import BaseModel, Field

from .Birthday import Birthday
from .Gender import Gender


class UserUpdate(BaseModel):
    """
    UserUpdate model
    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    nickname: Optional[Union[str, None]] = Field(validation_alias="nickname", default=None)

    bio: Optional[Union[str, None]] = Field(validation_alias="bio", default=None)

    gender: Optional[Union[Gender, None]] = Field(validation_alias="gender", default=None)

    birth_date: Optional[Union[Birthday, None]] = Field(validation_alias="birth_date", default=None)

    personal_socials: Optional[Union[Dict[str, Any], None]] = Field(validation_alias="personal_socials", default=None)
