from fastapi import APIRouter
from .message import router as msg_router

router = APIRouter(prefix="/v1")
router.include_router(msg_router)
