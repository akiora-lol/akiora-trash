from typing import *

from pydantic import BaseModel, Field


class Social(BaseModel):
    """
    Social model
    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    link: str = Field(validation_alias="link")

    hidden: Optional[bool] = Field(validation_alias="hidden", default=None)
