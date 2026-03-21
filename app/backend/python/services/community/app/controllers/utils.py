from typing import Annotated

from dishka.integrations.litestar import FromDishka, inject
from litestar.exceptions import HTTPException
from litestar.params import Parameter

from shared import RedisService


@inject
async def get_user_id_from_cookie(
    sid: Annotated[str, Parameter(cookie="sid")],
    redis_service: FromDishka[RedisService],
) -> str:
    try:
        data = await redis_service.get(key=f"sid:{sid}")
        return data.get("uid", "")
    except:
        raise HTTPException(status_code=403)
