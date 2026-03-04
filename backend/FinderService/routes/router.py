from faststream.redis import RedisRouter

from routes.hot_form_rpc import router as hot_form_router
from routes.cold_form_rpc import router as cold_form_router


router = RedisRouter()
router.include_router(hot_form_router)
router.include_router(cold_form_router)

__all__ = ["router"]
