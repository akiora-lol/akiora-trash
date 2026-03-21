from typing import *

from pydantic import BaseModel, Field


class Birthday(BaseModel):
    """
    Birthday model
    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    day: str = Field(validation_alias="day")

    hidden: Optional[bool] = Field(validation_alias="hidden", default=None)
